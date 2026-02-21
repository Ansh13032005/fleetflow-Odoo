import { Driver } from '@prisma/client';

export interface DriverWithCompliance extends Driver {
  licenseExpired: boolean;
}
