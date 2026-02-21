import { IsNumber, IsOptional, IsString, IsEnum, Min } from 'class-validator';
import { TripStatus } from '@prisma/client';

export class UpdateTripDto {
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  cargoWeight?: number;

  @IsOptional()
  @IsString()
  vehicleId?: string | null;

  @IsOptional()
  @IsString()
  driverId?: string | null;

  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;

  @IsOptional()
  @IsString()
  startLocation?: string;

  @IsOptional()
  @IsString()
  endLocation?: string;

  /** Completion data (used when status = COMPLETED): final odometer reading in km */
  @IsOptional()
  @IsNumber()
  @Min(0)
  finalOdometer?: number;

  /** Completion data: fuel liters for ExpenseLog */
  @IsOptional()
  @IsNumber()
  @Min(0)
  fuelLiters?: number;

  /** Completion data: fuel cost for ExpenseLog */
  @IsOptional()
  @IsNumber()
  @Min(0)
  fuelCost?: number;
}
