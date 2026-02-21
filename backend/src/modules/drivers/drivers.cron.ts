import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DriversService } from './drivers.service';

@Injectable()
export class DriversCron {
  constructor(private driversService: DriversService) {}

  /** Run daily at 00:00 to flag drivers with expired licenses (set status to SUSPENDED). */
  @Cron('0 0 * * *')
  async handleExpiredLicenses() {
    const count = await this.driversService.flagExpiredLicenses();
    if (count > 0) {
      console.log(`[DriversCron] Flagged ${count} driver(s) with expired license(s).`);
    }
  }
}
