/**
 * Single seed file: adds test data for ALL dashboards (Manager, Dispatcher, Finance, Safety).
 * Run once: npm run db:seed   (or npx prisma db seed)
 * Full reset: npm run db:reset (drops DB, migrates, runs this seed)
 *
 * Test accounts (password: Test123!):
 *   manager@fleetflow.test   | Finance: finance@fleetflow.test
 *   dispatcher@fleetflow.test | Safety:  safety@fleetflow.test
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TEST_PASSWORD = 'Test123!';

async function main() {
  console.log('Seeding database with test data for all dashboards...\n');

  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

  // ─── 1. Users (all 4 roles) ───────────────────────────────────────────────
  await Promise.all([
    prisma.user.upsert({
      where: { email: 'manager@fleetflow.test' },
      update: {},
      create: {
        email: 'manager@fleetflow.test',
        password: hashedPassword,
        firstName: 'Manager',
        lastName: 'User',
        role: 'MANAGER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'dispatcher@fleetflow.test' },
      update: {},
      create: {
        email: 'dispatcher@fleetflow.test',
        password: hashedPassword,
        firstName: 'Dispatcher',
        lastName: 'User',
        role: 'DISPATCHER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'safety@fleetflow.test' },
      update: {},
      create: {
        email: 'safety@fleetflow.test',
        password: hashedPassword,
        firstName: 'Safety',
        lastName: 'Officer',
        role: 'SAFETY_OFFICER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'finance@fleetflow.test' },
      update: {},
      create: {
        email: 'finance@fleetflow.test',
        password: hashedPassword,
        firstName: 'Finance',
        lastName: 'Analyst',
        role: 'FINANCIAL_ANALYST',
      },
    }),
  ]);
  console.log('✓ Users (manager, dispatcher, safety, finance)');

  // ─── 2. Vehicles (varied statuses for Manager / Dispatcher dashboards) ─────
  const vehicles = await Promise.all([
    prisma.vehicle.upsert({
      where: { licensePlate: 'MH-01-AB-1001' },
      update: {},
      create: {
        nameModel: 'Ford Transit 350',
        licensePlate: 'MH-01-AB-1001',
        maxLoadCapacity: 1500,
        odometer: 45200,
        status: 'AVAILABLE',
      },
    }),
    prisma.vehicle.upsert({
      where: { licensePlate: 'MH-02-CD-2002' },
      update: {},
      create: {
        nameModel: 'Mercedes Sprinter',
        licensePlate: 'MH-02-CD-2002',
        maxLoadCapacity: 2500,
        odometer: 78100,
        status: 'ON_TRIP',
      },
    }),
    prisma.vehicle.upsert({
      where: { licensePlate: 'MH-03-EF-3003' },
      update: {},
      create: {
        nameModel: 'Volkswagen Crafter',
        licensePlate: 'MH-03-EF-3003',
        maxLoadCapacity: 1800,
        odometer: 32500,
        status: 'IN_SHOP',
      },
    }),
    prisma.vehicle.upsert({
      where: { licensePlate: 'MH-04-GH-4004' },
      update: {},
      create: {
        nameModel: 'Iveco Daily',
        licensePlate: 'MH-04-GH-4004',
        maxLoadCapacity: 3000,
        odometer: 120500,
        status: 'OUT_OF_SERVICE',
      },
    }),
    prisma.vehicle.upsert({
      where: { licensePlate: 'MH-05-IJ-5005' },
      update: {},
      create: {
        nameModel: 'Tata Ace',
        licensePlate: 'MH-05-IJ-5005',
        maxLoadCapacity: 750,
        odometer: 28000,
        status: 'AVAILABLE',
      },
    }),
    prisma.vehicle.upsert({
      where: { licensePlate: 'MH-06-KL-6006' },
      update: {},
      create: {
        nameModel: 'Ashok Leyland Dost',
        licensePlate: 'MH-06-KL-6006',
        maxLoadCapacity: 1200,
        odometer: 56000,
        status: 'AVAILABLE',
      },
    }),
  ]);
  console.log(`✓ Vehicles (${vehicles.length})`);

  // ─── 3. Drivers (for Dispatcher / Safety dashboards) ───────────────────────
  const driverCount = await prisma.driver.count();
  let drivers = await prisma.driver.findMany();
  if (driverCount === 0) {
    drivers = await Promise.all([
      prisma.driver.create({
        data: {
          firstName: 'Ramesh',
          lastName: 'Kumar',
          licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          safetyScore: 95,
          status: 'ON_DUTY',
        },
      }),
      prisma.driver.create({
        data: {
          firstName: 'Suresh',
          lastName: 'Patil',
          licenseExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          safetyScore: 88,
          status: 'ON_TRIP',
        },
      }),
      prisma.driver.create({
        data: {
          firstName: 'Vijay',
          lastName: 'Sharma',
          licenseExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          safetyScore: 92,
          status: 'OFF_DUTY',
        },
      }),
      prisma.driver.create({
        data: {
          firstName: 'Anita',
          lastName: 'Desai',
          licenseExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          safetyScore: 65,
          status: 'SUSPENDED',
        },
      }),
      prisma.driver.create({
        data: {
          firstName: 'Rajesh',
          lastName: 'Nair',
          licenseExpiry: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000),
          safetyScore: 78,
          status: 'ON_DUTY',
        },
      }),
    ]);
  }
  console.log(`✓ Drivers (${drivers.length})`);

  const [v1, v2, v3, v4, v5, v6] = vehicles;
  const [d1, d2, d3, d4, d5] = drivers;

  // ─── 4. Clear operational data so we can recreate (idempotent re-seed) ─────
  await prisma.expenseLog.deleteMany({});
  await prisma.maintenanceLog.deleteMany({});
  await prisma.trip.deleteMany({});
  console.log('✓ Cleared trips, maintenance, expenses');

  // ─── 5. Trips (DRAFT, DISPATCHED, COMPLETED, CANCELLED) for all dashboards ──
  const tripData = [
    { cargoWeight: 800, status: 'DRAFT' as const, startLocation: 'Warehouse A', endLocation: 'Customer B', vehicleId: v1.id, driverId: d1.id },
    { cargoWeight: 1200, status: 'DISPATCHED' as const, startLocation: 'Depot', endLocation: 'Distribution Center', vehicleId: v2.id, driverId: d2.id },
    { cargoWeight: 500, status: 'COMPLETED' as const, startLocation: 'Factory', endLocation: 'Retail Store', vehicleId: v1.id, driverId: d1.id },
    { cargoWeight: 1000, status: 'COMPLETED' as const, startLocation: 'Port', endLocation: 'Warehouse', vehicleId: v5.id, driverId: d3.id },
    { cargoWeight: 600, status: 'COMPLETED' as const, startLocation: 'Mumbai Hub', endLocation: 'Pune DC', vehicleId: v6.id, driverId: d5.id },
    { cargoWeight: 400, status: 'COMPLETED' as const, startLocation: 'Nashik', endLocation: 'Mumbai', vehicleId: v1.id, driverId: d1.id },
    { cargoWeight: 900, status: 'CANCELLED' as const, startLocation: 'Site X', endLocation: 'Site Y', vehicleId: undefined, driverId: undefined },
    { cargoWeight: 1100, status: 'DRAFT' as const, startLocation: 'Hub 2', endLocation: 'Client C', vehicleId: v5.id, driverId: d3.id },
  ];
  const trips = await Promise.all(
    tripData.map((t) =>
      prisma.trip.create({
        data: {
          cargoWeight: t.cargoWeight,
          status: t.status,
          startLocation: t.startLocation,
          endLocation: t.endLocation,
          vehicleId: t.vehicleId ?? undefined,
          driverId: t.driverId ?? undefined,
        },
      })
    )
  );
  console.log(`✓ Trips (${trips.length})`);

  const completedTrips = trips.filter((t) => t.status === 'COMPLETED');
  const [t1, t2, t3, t4] = completedTrips;

  // ─── 6. Maintenance logs (Finance / Manager dashboards) ────────────────────
  const now = new Date();
  const week = 7 * 24 * 60 * 60 * 1000;
  await prisma.maintenanceLog.createMany({
    data: [
      { vehicleId: v1.id, description: 'Oil change and filter', cost: 2500, date: new Date(now.getTime() - 2 * week) },
      { vehicleId: v2.id, description: 'Brake pads replacement', cost: 4200, date: new Date(now.getTime() - 4 * week) },
      { vehicleId: v3.id, description: 'Transmission repair', cost: 18500, date: new Date(now.getTime() - 6 * week) },
      { vehicleId: v1.id, description: 'Tyre rotation', cost: 800, date: new Date(now.getTime() - 1 * week) },
      { vehicleId: v5.id, description: 'Battery replacement', cost: 3500, date: new Date(now.getTime() - 3 * week) },
      { vehicleId: v6.id, description: 'General service', cost: 3100, date: new Date(now.getTime() - 5 * week) },
    ],
  });
  console.log('✓ Maintenance logs (6)');

  // ─── 7. Expense logs / fuel (Finance analytics, km/L, reports) ─────────────
  await prisma.expenseLog.createMany({
    data: [
      { vehicleId: v1.id, tripId: t1?.id, fuelLiters: 45, fuelCost: 4725, date: new Date(now.getTime() - 1 * week) },
      { vehicleId: v2.id, tripId: t2?.id, fuelLiters: 60, fuelCost: 6300, date: new Date(now.getTime() - 2 * week) },
      { vehicleId: v1.id, tripId: t3?.id, fuelLiters: 38, fuelCost: 3990, date: new Date(now.getTime() - 3 * week) },
      { vehicleId: v5.id, tripId: t4?.id, fuelLiters: 22, fuelCost: 2310, date: new Date(now.getTime() - 4 * week) },
      { vehicleId: v6.id, fuelLiters: 55, fuelCost: 5775, date: new Date(now.getTime() - 5 * week) },
      { vehicleId: v1.id, fuelLiters: 30, fuelCost: 3150, date: new Date(now.getTime() - 6 * week) },
      { vehicleId: v2.id, fuelLiters: 48, fuelCost: 5040, date: new Date(now.getTime() - 7 * week) },
      { vehicleId: v5.id, fuelLiters: 18, fuelCost: 1890, date: new Date(now.getTime() - 8 * week) },
    ],
  });
  console.log('✓ Expense / fuel logs (8)');

  console.log('\n--- Test accounts (password: Test123!) ---');
  console.log('  Manager:        manager@fleetflow.test');
  console.log('  Dispatcher:     dispatcher@fleetflow.test');
  console.log('  Safety Officer: safety@fleetflow.test');
  console.log('  Finance:       finance@fleetflow.test');
  console.log('\nSeeding complete. Use these logins to test all dashboards.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
