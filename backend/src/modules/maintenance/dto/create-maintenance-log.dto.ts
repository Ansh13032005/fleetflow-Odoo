import { IsNumber, IsString, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateMaintenanceLogDto {
  @IsString()
  vehicleId: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  cost: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}
