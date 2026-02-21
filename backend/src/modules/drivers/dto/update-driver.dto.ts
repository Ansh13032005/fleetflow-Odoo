import { IsString, IsNumber, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { DriverStatus } from '@prisma/client';

export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;

  @IsOptional()
  @IsNumber()
  safetyScore?: number;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;
}
