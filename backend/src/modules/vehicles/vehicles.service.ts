import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Vehicle, VehicleStatus } from '@prisma/client';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateVehicleDto): Promise<Vehicle> {
    return this.prisma.vehicle.create({ data });
  }

  async findAll(): Promise<Vehicle[]> {
    return this.prisma.vehicle.findMany();
  }

  /** Selection endpoint: only vehicles where Status = AVAILABLE (for dispatch UI). */
  async findAvailable(): Promise<Vehicle[]> {
    return this.prisma.vehicle.findMany({
      where: { status: VehicleStatus.AVAILABLE },
    });
  }

  async findOne(id: string): Promise<Vehicle | null> {
    return this.prisma.vehicle.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateVehicleDto): Promise<Vehicle> {
    return this.prisma.vehicle.update({ where: { id }, data });
  }

  async remove(id: string): Promise<Vehicle> {
    return this.prisma.vehicle.delete({ where: { id } });
  }
}
