import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MaintenanceLog, Prisma, VehicleStatus } from '@prisma/client';
import { CreateMaintenanceLogDto } from './dto/create-maintenance-log.dto';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a maintenance log and set the vehicle's status to IN_SHOP (Phase 4).
   * Removes the vehicle from the Dispatcher's selection pool instantly.
   */
  async create(dto: CreateMaintenanceLogDto): Promise<MaintenanceLog> {
    return this.prisma.$transaction(async (tx) => {
      const log = await tx.maintenanceLog.create({
        data: {
          vehicleId: dto.vehicleId,
          description: dto.description,
          cost: dto.cost,
          date: dto.date ? new Date(dto.date) : undefined,
        },
      });

      await tx.vehicle.update({
        where: { id: dto.vehicleId },
        data: { status: VehicleStatus.IN_SHOP },
      });

      return log;
    });
  }

  async findAll(): Promise<MaintenanceLog[]> {
    return this.prisma.maintenanceLog.findMany({
      include: { vehicle: true },
    });
  }

  async findOne(id: string): Promise<MaintenanceLog | null> {
    return this.prisma.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true },
    });
  }

  async update(
    id: string,
    data: Prisma.MaintenanceLogUncheckedUpdateInput,
  ): Promise<MaintenanceLog> {
    return this.prisma.maintenanceLog.update({ where: { id }, data });
  }

  async remove(id: string): Promise<MaintenanceLog> {
    return this.prisma.maintenanceLog.delete({ where: { id } });
  }
}
