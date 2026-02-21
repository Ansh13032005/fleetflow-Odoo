import { Module } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { DriversCron } from './drivers.cron';

@Module({
  controllers: [DriversController],
  providers: [DriversService, DriversCron],
})
export class DriversModule {}
