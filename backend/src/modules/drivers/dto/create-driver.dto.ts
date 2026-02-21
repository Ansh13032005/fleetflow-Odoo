import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { DriverStatus } from '@prisma/client';

export class CreateDriverDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  licenseExpiry: string;

  @IsOptional()
  @IsNumber()
  safetyScore?: number;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;
}
