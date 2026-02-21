export enum Role {
    MANAGER = 'MANAGER',
    DISPATCHER = 'DISPATCHER',
    SAFETY_OFFICER = 'SAFETY_OFFICER',
    FINANCIAL_ANALYST = 'FINANCIAL_ANALYST',
}

export enum VehicleStatus {
    AVAILABLE = 'AVAILABLE',
    ON_TRIP = 'ON_TRIP',
    IN_SHOP = 'IN_SHOP',
    OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

export enum DriverStatus {
    ON_DUTY = 'ON_DUTY',
    OFF_DUTY = 'OFF_DUTY',
    ON_TRIP = 'ON_TRIP',
    SUSPENDED = 'SUSPENDED',
}

export enum TripStatus {
    DRAFT = 'DRAFT',
    DISPATCHED = 'DISPATCHED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: Role;
}

export interface Vehicle {
    id: string;
    nameModel: string;
    licensePlate: string;
    maxLoadCapacity: number;
    odometer: number;
    status: VehicleStatus;
    createdAt: string;
    updatedAt: string;
}

export interface Driver {
    id: string;
    firstName: string;
    lastName: string;
    licenseExpiry: string;
    safetyScore: number;
    status: DriverStatus;
    createdAt: string;
    updatedAt: string;
}

export interface Trip {
    id: string;
    cargoWeight: number;
    status: TripStatus;
    startLocation?: string;
    endLocation?: string;
    vehicleId?: string;
    driverId?: string;
    createdAt: string;
    updatedAt: string;
    vehicle?: Vehicle;
    driver?: Driver;
}

export interface MaintenanceLog {
    id: string;
    vehicleId: string;
    description: string;
    cost: number;
    date: string;
    createdAt: string;
    updatedAt: string;
}

export interface ExpenseLog {
    id: string;
    vehicleId: string;
    tripId?: string;           // optional link to a completed trip
    fuelLiters: number;
    fuelCost: number;
    distanceKm?: number;       // km driven during this fill-up period
    date: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}
