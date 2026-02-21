import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Trip, TripStatus, VehicleStatus, DriverStatus } from '@prisma/client';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Validates if a vehicle can carry the cargo weight (Trip Validation Rule Engine).
   * When CargoWeight > Vehicle.MaxLoadCapacity → ERROR.
   */
  private async validateVehicleCapacity(vehicleId: string, cargoWeight: number): Promise<void> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
    }

    if (cargoWeight > vehicle.maxLoadCapacity) {
      throw new BadRequestException(
        `Cargo weight (${cargoWeight} kg) exceeds vehicle capacity (${vehicle.maxLoadCapacity} kg)`,
      );
    }
  }

  /**
   * When dispatching, ensure vehicle is AVAILABLE and driver is ON_DUTY.
   */
  private async validateDispatchEligibility(vehicleId: string, driverId: string): Promise<void> {
    const [vehicle, driver] = await Promise.all([
      this.prisma.vehicle.findUnique({ where: { id: vehicleId } }),
      this.prisma.driver.findUnique({ where: { id: driverId } }),
    ]);

    if (!vehicle) throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
    if (!driver) throw new NotFoundException(`Driver with ID ${driverId} not found`);

    if (vehicle.status !== VehicleStatus.AVAILABLE) {
      throw new BadRequestException(
        `Vehicle is not available for dispatch (current status: ${vehicle.status})`,
      );
    }

    if (driver.status !== DriverStatus.ON_DUTY) {
      throw new BadRequestException(
        `Driver is not available for dispatch (current status: ${driver.status})`,
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(driver.licenseExpiry) < today) {
      throw new BadRequestException('Driver license has expired. Cannot dispatch.');
    }
  }

  private toPrismaCreateInput(dto: CreateTripDto): Record<string, unknown> {
    const data: Record<string, unknown> = {
      cargoWeight: dto.cargoWeight,
      status: dto.status ?? TripStatus.DRAFT,
      startLocation: dto.startLocation ?? undefined,
      endLocation: dto.endLocation ?? undefined,
    };
    if (dto.vehicleId) data.vehicle = { connect: { id: dto.vehicleId } };
    if (dto.driverId) data.driver = { connect: { id: dto.driverId } };
    return data;
  }

  private toPrismaUpdateInput(dto: UpdateTripDto): Record<string, unknown> {
    const data: Record<string, unknown> = { ...dto };
    if (dto.vehicleId !== undefined) {
      delete (data as Record<string, unknown>).vehicleId;
      data.vehicle = dto.vehicleId ? { connect: { id: dto.vehicleId } } : { disconnect: true };
    }
    if (dto.driverId !== undefined) {
      delete (data as Record<string, unknown>).driverId;
      data.driver = dto.driverId ? { connect: { id: dto.driverId } } : { disconnect: true };
    }
    // Completion-only fields (not on Trip model)
    delete (data as Record<string, unknown>).finalOdometer;
    delete (data as Record<string, unknown>).fuelLiters;
    delete (data as Record<string, unknown>).fuelCost;
    return data;
  }

  async create(dto: CreateTripDto): Promise<Trip> {
    const vehicleId = dto.vehicleId;
    const driverId = dto.driverId;
    const status = dto.status ?? TripStatus.DRAFT;

    // 1. Trip Validation Rule Engine: CargoWeight <= Vehicle.MaxLoadCapacity
    if (vehicleId != null && dto.cargoWeight != null) {
      await this.validateVehicleCapacity(vehicleId, dto.cargoWeight);
    }

    const data = this.toPrismaCreateInput(dto) as any;

    // 2. Lifecycle: when trip is DISPATCHED, run transaction (Vehicle + Driver → ON_TRIP)
    if (status === TripStatus.DISPATCHED) {
      if (!vehicleId || !driverId) {
        throw new BadRequestException('Dispatched trips must have a vehicle and a driver');
      }
      await this.validateDispatchEligibility(vehicleId, driverId);

      return this.prisma.$transaction(async (tx) => {
        const trip = await tx.trip.create({ data });

        await tx.vehicle.update({
          where: { id: vehicleId },
          data: { status: VehicleStatus.ON_TRIP },
        });

        await tx.driver.update({
          where: { id: driverId },
          data: { status: 'ON_TRIP' as DriverStatus },
        });

        return trip;
      });
    }

    return this.prisma.trip.create({ data });
  }

  async findAll(): Promise<Trip[]> {
    return this.prisma.trip.findMany({
      include: { vehicle: true, driver: true },
    });
  }

  async findOne(id: string): Promise<Trip | null> {
    return this.prisma.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true, expenseLogs: true },
    });
  }

  async update(id: string, dto: UpdateTripDto): Promise<Trip> {
    const existingTrip = await this.prisma.trip.findUnique({
      where: { id },
    });

    if (!existingTrip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    const vehicleId = dto.vehicleId ?? existingTrip.vehicleId;
    const weight = dto.cargoWeight !== undefined ? dto.cargoWeight : existingTrip.cargoWeight;

    // Validation: CargoWeight <= Vehicle.MaxLoadCapacity
    if (vehicleId && weight != null) {
      await this.validateVehicleCapacity(vehicleId, weight);
    }

    const data = this.toPrismaUpdateInput(dto) as any;

    // Transition: DRAFT → DISPATCHED (Lifecycle State Mutators in transaction)
    if (dto.status === TripStatus.DISPATCHED && existingTrip.status !== TripStatus.DISPATCHED) {
      const vid = vehicleId!;
      const did = dto.driverId ?? existingTrip.driverId;

      if (!vid || !did) {
        throw new BadRequestException('Cannot dispatch trip without vehicle and driver');
      }

      await this.validateDispatchEligibility(vid, did);

      return this.prisma.$transaction(async (tx) => {
        const trip = await tx.trip.update({ where: { id }, data });

        await tx.vehicle.update({
          where: { id: vid },
          data: { status: VehicleStatus.ON_TRIP },
        });

        await tx.driver.update({
          where: { id: did },
          data: { status: 'ON_TRIP' as DriverStatus },
        });

        return trip;
      });
    }

    // Transition: DISPATCHED → COMPLETED or CANCELLED (Post-Trip Mutations + ExpenseLog)
    const isEnding =
      dto.status === TripStatus.COMPLETED || dto.status === TripStatus.CANCELLED;
    const wasActive = existingTrip.status === TripStatus.DISPATCHED;

    if (isEnding && wasActive) {
      return this.prisma.$transaction(async (tx) => {
        const trip = await tx.trip.update({ where: { id }, data });

        if (existingTrip.vehicleId) {
          const vehicleUpdate: { status: VehicleStatus; odometer?: number } = {
            status: VehicleStatus.AVAILABLE,
          };
          if (dto.status === TripStatus.COMPLETED && dto.finalOdometer != null) {
            vehicleUpdate.odometer = dto.finalOdometer;
          }
          await tx.vehicle.update({
            where: { id: existingTrip.vehicleId },
            data: vehicleUpdate,
          });
        }

        if (existingTrip.driverId) {
          await tx.driver.update({
            where: { id: existingTrip.driverId },
            data: { status: DriverStatus.ON_DUTY },
          });
        }

        // Store fuel costs in ExpenseLog when completing with fuel data
        if (
          dto.status === TripStatus.COMPLETED &&
          existingTrip.vehicleId &&
          dto.fuelLiters != null &&
          dto.fuelCost != null
        ) {
          await tx.expenseLog.create({
            data: {
              vehicleId: existingTrip.vehicleId,
              tripId: id,
              fuelLiters: dto.fuelLiters,
              fuelCost: dto.fuelCost,
            },
          });
        }

        return trip;
      });
    }

    return this.prisma.trip.update({ where: { id }, data });
  }

  async remove(id: string): Promise<Trip> {
    return this.prisma.trip.delete({ where: { id } });
  }
}
