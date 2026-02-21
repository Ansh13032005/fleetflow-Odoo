import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('trips')
@UseGuards(RolesGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @Roles(Role.MANAGER, Role.DISPATCHER)
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripsService.create(createTripDto);
  }

  @Get()
  @Roles(Role.MANAGER, Role.DISPATCHER, Role.SAFETY_OFFICER, Role.FINANCIAL_ANALYST)
  findAll() {
    return this.tripsService.findAll();
  }

  @Get(':id')
  @Roles(Role.MANAGER, Role.DISPATCHER, Role.SAFETY_OFFICER, Role.FINANCIAL_ANALYST)
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.MANAGER, Role.DISPATCHER)
  update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.tripsService.update(id, updateTripDto);
  }

  @Delete(':id')
  @Roles(Role.MANAGER)
  remove(@Param('id') id: string) {
    return this.tripsService.remove(id);
  }
}
