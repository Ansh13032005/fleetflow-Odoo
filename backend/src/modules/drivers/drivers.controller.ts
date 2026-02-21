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
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('drivers')
@UseGuards(RolesGuard)
export class DriversController {
  constructor(private readonly driversService: DriversService) { }

  @Post()
  @Roles(Role.MANAGER, Role.SAFETY_OFFICER)
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @Get()
  @Roles(Role.MANAGER, Role.DISPATCHER, Role.SAFETY_OFFICER, Role.FINANCIAL_ANALYST)
  findAll() {
    return this.driversService.findAll();
  }

  @Get('valid')
  @Roles(Role.MANAGER, Role.DISPATCHER, Role.SAFETY_OFFICER, Role.FINANCIAL_ANALYST)
  findValid() {
    return this.driversService.findValid();
  }

  @Get(':id')
  @Roles(Role.MANAGER, Role.DISPATCHER, Role.SAFETY_OFFICER, Role.FINANCIAL_ANALYST)
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.MANAGER, Role.SAFETY_OFFICER)
  update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.update(id, updateDriverDto);
  }

  @Delete(':id')
  @Roles(Role.MANAGER, Role.SAFETY_OFFICER)
  remove(@Param('id') id: string) {
    return this.driversService.remove(id);
  }
}
