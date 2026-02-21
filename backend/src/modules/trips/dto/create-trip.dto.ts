import { IsNumber, IsOptional, IsString, IsEnum, Min } from 'class-validator';
import { TripStatus } from '@prisma/client';

export class CreateTripDto {
  @IsNumber()
  @Min(0.1)
  cargoWeight: number;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;

  @IsOptional()
  @IsString()
  startLocation?: string;

  @IsOptional()
  @IsString()
  endLocation?: string;
}
