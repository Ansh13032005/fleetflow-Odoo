import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { VehicleStatus, TripStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    async getDashboardMetrics() {
        // 1. Vehicles by Status
        const vehiclesData = await this.prisma.vehicle.groupBy({
            by: ['status'],
            _count: { status: true },
        });

        let activeVehicles = 0;
        let totalVehicles = 0;
        const vehicleStatusCounts: Record<string, number> = {};

        vehiclesData.forEach(item => {
            vehicleStatusCounts[item.status] = item._count.status;
            totalVehicles += item._count.status;
            if (item.status === VehicleStatus.ON_TRIP) {
                activeVehicles += item._count.status;
            }
        });

        const fleetUtilization = totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;

        // 2. Ongoing Trips
        const ongoingTripsCount = await this.prisma.trip.count({
            where: { status: TripStatus.DISPATCHED },
        });

        return {
            activeFleet: activeVehicles,
            totalFleet: totalVehicles,
            fleetUtilization: Math.round(fleetUtilization),
            ongoingTrips: ongoingTripsCount,
            vehicleStatusBreakdown: vehicleStatusCounts
        };
    }

    async getOperationalAnalytics() {
        // Fetch vehicles and eagerly load related maintenance logs and expense logs to compute totals
        const vehicles = await this.prisma.vehicle.findMany({
            select: {
                id: true,
                nameModel: true,
                licensePlate: true,
                odometer: true,
                maintenanceLogs: {
                    select: { cost: true }
                },
                expenseLogs: {
                    select: { fuelLiters: true, fuelCost: true }
                }
            }
        });

        const vehicleMetrics = vehicles.map(v => {
            const totalLiters = v.expenseLogs.reduce((sum: number, log: any) => sum + log.fuelLiters, 0);
            const totalKmLogged = v.odometer;
            const kmPerLiter = totalLiters > 0 ? totalKmLogged / totalLiters : 0;

            const maintenanceTotal = v.maintenanceLogs.reduce((sum: number, log: any) => sum + log.cost, 0);
            const fuelTotal = v.expenseLogs.reduce((sum: number, log: any) => sum + log.fuelCost, 0);
            const totalOperatingCost = maintenanceTotal + fuelTotal;

            return {
                vehicleId: v.id,
                name: v.nameModel,
                plate: v.licensePlate,
                kmPerLiter,
                maintenanceTotal,
                fuelTotal,
                totalOperatingCost,
                totalLiters,
                odometer: v.odometer
            };
        });

        return {
            vehicleMetrics
        };
    }
}
