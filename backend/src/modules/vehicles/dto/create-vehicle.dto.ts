import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { VehicleStatus } from '@prisma/client';

export class CreateVehicleDto {
  @IsString()
  nameModel: string;

  @IsString()
  licensePlate: string;

  @IsNumber()
  maxLoadCapacity: number;

  @IsNumber()
  odometer: number;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;
}
