import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Driver, DriverStatus } from '@prisma/client';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { DriverWithCompliance } from './entities/driver-response.interface';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) { }

  private toDriverWithCompliance(driver: Driver): DriverWithCompliance {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(driver.licenseExpiry);
    expiry.setHours(0, 0, 0, 0);
    return {
      ...driver,
      licenseExpired: expiry < today,
    };
  }

  async create(data: CreateDriverDto): Promise<DriverWithCompliance> {
    const driver = await this.prisma.driver.create({
      data: {
        ...data,
        licenseExpiry: new Date(data.licenseExpiry),
      },
    });
    return this.toDriverWithCompliance(driver);
  }

  async findAll(): Promise<DriverWithCompliance[]> {
    const drivers = await this.prisma.driver.findMany();
    return drivers.map((d) => this.toDriverWithCompliance(d));
  }

  /** Selection endpoint: only drivers where Status = ON_DUTY and license is valid (for dispatch UI). */
  async findValid(): Promise<DriverWithCompliance[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const drivers = await this.prisma.driver.findMany({
      where: {
        status: DriverStatus.ON_DUTY,
        licenseExpiry: { gte: today },
      },
    });
    return drivers.map((d) => this.toDriverWithCompliance(d));
  }

  async findOne(id: string): Promise<DriverWithCompliance | null> {
    const driver = await this.prisma.driver.findUnique({ where: { id } });
    return driver ? this.toDriverWithCompliance(driver) : null;
  }

  async update(
    id: string,
    data: UpdateDriverDto,
  ): Promise<DriverWithCompliance> {
    const payload =
      data.licenseExpiry != null
        ? { ...data, licenseExpiry: new Date(data.licenseExpiry) }
        : data;
    const driver = await this.prisma.driver.update({
      where: { id },
      data: payload,
    });
    return this.toDriverWithCompliance(driver);
  }

  async remove(id: string): Promise<Driver> {
    return this.prisma.driver.delete({ where: { id } });
  }

  /** Flag drivers with expired licenses (set status to SUSPENDED). Called by cron. */
  async flagExpiredLicenses(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = await this.prisma.driver.updateMany({
      where: {
        licenseExpiry: { lt: today },
        status: { not: DriverStatus.SUSPENDED },
      },
      data: { status: 'SUSPENDED' },
    });
    return result.count;
  }
}
