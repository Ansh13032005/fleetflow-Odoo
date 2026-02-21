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
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceLogDto } from './dto/create-maintenance-log.dto';
import { Prisma } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('maintenance')
@UseGuards(RolesGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @Roles(Role.MANAGER)
  create(@Body() createMaintenanceLogDto: CreateMaintenanceLogDto) {
    return this.maintenanceService.create(createMaintenanceLogDto);
  }

  @Get()
  @Roles(Role.MANAGER, Role.SAFETY_OFFICER, Role.FINANCIAL_ANALYST)
  findAll() {
    return this.maintenanceService.findAll();
  }

  @Get(':id')
  @Roles(Role.MANAGER, Role.SAFETY_OFFICER, Role.FINANCIAL_ANALYST)
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.MANAGER)
  update(
    @Param('id') id: string,
    @Body() updateMaintenanceLogDto: Prisma.MaintenanceLogUncheckedUpdateInput,
  ) {
    return this.maintenanceService.update(id, updateMaintenanceLogDto);
  }

  @Delete(':id')
  @Roles(Role.MANAGER)
  remove(@Param('id') id: string) {
    return this.maintenanceService.remove(id);
  }
}
