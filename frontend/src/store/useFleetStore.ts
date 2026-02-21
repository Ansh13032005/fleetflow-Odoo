import { create } from 'zustand';
import { Vehicle, Driver, Trip, VehicleStatus, DriverStatus, TripStatus, MaintenanceLog, ExpenseLog } from '@/types';
import * as api from '@/services/api';

// ─── Store Interface ──────────────────────────────────────────────────────────

interface FleetState {
    vehicles: Vehicle[];
    drivers: Driver[];
    availableVehicles: Vehicle[];
    validDrivers: Driver[];
    trips: Trip[];
    maintenanceLogs: MaintenanceLog[];
    expenseLogs: ExpenseLog[];
    isLoading: boolean;
    error: string | null;

    // Fetching
    fetchVehicles: (token: string) => Promise<void>;
    fetchDrivers: (token: string) => Promise<void>;
    fetchTrips: (token: string) => Promise<void>;
    fetchMaintenanceLogs: (token: string) => Promise<void>;
    fetchExpenseLogs: (token: string) => Promise<void>;
    fetchSelectionResources: (token: string) => Promise<void>;

    // Vehicle CRUD
    addVehicle: (token: string, data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateVehicle: (token: string, id: string, updates: Partial<Vehicle>) => Promise<void>;
    deleteVehicle: (token: string, id: string) => Promise<void>;

    // Driver CRUD
    addDriver: (token: string, data: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateDriver: (token: string, id: string, updates: Partial<Driver>) => Promise<void>;
    deleteDriver: (token: string, id: string) => Promise<void>;

    // Trip Lifecycle
    addTrip: (token: string, data: any) => Promise<void>;
    updateTrip: (token: string, id: string, updates: any) => Promise<void>;
    deleteTrip: (token: string, id: string) => Promise<void>;

    // Legacy support for UI components still using these names
    createTrip: (token: string, data: any) => Promise<{ success: boolean; error?: string }>;
    dispatchTrip: (token: string, tripId: string) => Promise<{ success: boolean; error?: string }>;
    cancelTrip: (token: string, tripId: string) => Promise<void>;
    completeTrip: (token: string, tripId: string, completionData?: { finalOdometer?: number; fuelLiters?: number; fuelCost?: number }) => Promise<void>;
    releaseFromShop: (token: string, vehicleId: string) => Promise<void>;

    // Maintenance Logs
    addMaintenanceLog: (token: string, log: Omit<MaintenanceLog, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateMaintenanceLog: (token: string, id: string, updates: Partial<MaintenanceLog>) => Promise<void>;
    deleteMaintenanceLog: (token: string, id: string) => Promise<void>;

    // Expense / Fuel Logs
    addExpenseLog: (token: string, log: Omit<ExpenseLog, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateExpenseLog: (token: string, id: string, updates: Partial<ExpenseLog>) => Promise<void>;
    deleteExpenseLog: (token: string, id: string) => Promise<void>;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useFleetStore = create<FleetState>()((set, get) => ({
    vehicles: [],
    drivers: [],
    availableVehicles: [],
    validDrivers: [],
    trips: [],
    maintenanceLogs: [],
    expenseLogs: [],
    isLoading: false,
    error: null,

    // ── Fetching ─────────────────────────────────────────────────────────────
    fetchVehicles: async (token) => {
        set({ isLoading: true, error: null });
        try {
            const vehicles = await api.getVehicles(token);
            set({ vehicles, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    fetchDrivers: async (token) => {
        set({ isLoading: true, error: null });
        try {
            const drivers = await api.getDrivers(token);
            set({ drivers, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    fetchTrips: async (token) => {
        set({ isLoading: true, error: null });
        try {
            const trips = await api.getTrips(token);
            set({ trips, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    fetchMaintenanceLogs: async (token) => {
        try {
            const maintenanceLogs = await api.getMaintenanceLogs(token);
            set({ maintenanceLogs });
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    fetchExpenseLogs: async (token) => {
        try {
            const expenseLogs = await api.getExpenseLogs(token);
            set({ expenseLogs });
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    fetchSelectionResources: async (token) => {
        set({ isLoading: true, error: null });
        try {
            const [v, d] = await Promise.all([
                api.getAvailableVehicles(token),
                api.getValidDrivers(token)
            ]);
            set({ availableVehicles: v, validDrivers: d, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    // ── Vehicle CRUD ──────────────────────────────────────────────────────────
    addVehicle: async (token, data) => {
        set({ isLoading: true, error: null });
        try {
            const newVehicle = await api.createVehicle(token, data);
            set((state) => ({ vehicles: [...state.vehicles, newVehicle], isLoading: false }));
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    updateVehicle: async (token, id, updates) => {
        set({ isLoading: true, error: null });
        try {
            const updated = await api.updateVehicleApi(token, id, updates);
            set((state) => ({
                vehicles: state.vehicles.map((v) => (v.id === id ? updated : v)),
                isLoading: false
            }));
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    deleteVehicle: async (token, id) => {
        set({ isLoading: true, error: null });
        try {
            await api.deleteVehicleApi(token, id);
            set((state) => ({
                vehicles: state.vehicles.filter((v) => v.id !== id),
                isLoading: false
            }));
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    // ── Driver CRUD ───────────────────────────────────────────────────────────
    addDriver: async (token, data) => {
        set({ isLoading: true, error: null });
        try {
            const newDriver = await api.createDriver(token, data);
            set((state) => ({ drivers: [...state.drivers, newDriver], isLoading: false }));
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    updateDriver: async (token, id, updates) => {
        set({ isLoading: true, error: null });
        try {
            const updated = await api.updateDriverApi(token, id, updates);
            set((state) => ({
                drivers: state.drivers.map((d) => (d.id === id ? updated : d)),
                isLoading: false
            }));
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    deleteDriver: async (token, id) => {
        set({ isLoading: true, error: null });
        try {
            await api.deleteDriverApi(token, id);
            set((state) => ({
                drivers: state.drivers.filter((d) => d.id !== id),
                isLoading: false
            }));
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    // ── Trip Lifecycle ────────────────────────────────────────────────────────
    addTrip: async (token, data) => {
        set({ isLoading: true, error: null });
        try {
            const newTrip = await api.createTripApi(token, data);
            set((state) => ({ trips: [newTrip, ...state.trips], isLoading: false }));
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
            throw err;
        }
    },

    updateTrip: async (token, id, updates) => {
        set({ isLoading: true, error: null });
        try {
            const updated = await api.updateTripApi(token, id, updates);
            set((state) => ({
                trips: state.trips.map((t) => (t.id === id ? updated : t)),
                isLoading: false
            }));
            // Refresh vehicles/drivers if status changed
            if (updates.status) {
                const refreshedVehicles = await api.getVehicles(token);
                const refreshedDrivers = await api.getDrivers(token);
                set({ vehicles: refreshedVehicles, drivers: refreshedDrivers });
            }
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    deleteTrip: async (token, id) => {
        set({ isLoading: true, error: null });
        try {
            await api.deleteTripApi(token, id);
            set((state) => ({
                trips: state.trips.filter((t) => t.id !== id),
                isLoading: false
            }));
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    // Legacy Adapters for existing UI components
    createTrip: async (token, data) => {
        try {
            await get().addTrip(token, data);
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    },

    dispatchTrip: async (token, tripId) => {
        try {
            await get().updateTrip(token, tripId, { status: TripStatus.DISPATCHED });
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    },

    cancelTrip: async (token, tripId) => {
        await get().updateTrip(token, tripId, { status: TripStatus.CANCELLED });
    },

    completeTrip: async (token, tripId, completionData) => {
        await get().updateTrip(token, tripId, {
            status: TripStatus.COMPLETED,
            finalOdometer: completionData?.finalOdometer,
            fuelLiters: completionData?.fuelLiters,
            fuelCost: completionData?.fuelCost,
        });
    },

    releaseFromShop: async (token, vehicleId) => {
        await get().updateVehicle(token, vehicleId, { status: VehicleStatus.AVAILABLE });
    },

    // ── Maintenance Logs (Phase 4: backend sets vehicle IN_SHOP on create) ───
    addMaintenanceLog: async (token, logData) => {
        const newLog = await api.createMaintenanceLogApi(token, {
            vehicleId: logData.vehicleId,
            description: logData.description,
            cost: logData.cost,
            date: logData.date,
        });
        set((state) => ({ maintenanceLogs: [newLog, ...state.maintenanceLogs] }));
        const vehicles = await api.getVehicles(token);
        set({ vehicles });
    },
    updateMaintenanceLog: async (token, id, updates) => {
        const updated = await api.updateMaintenanceLogApi(token, id, updates);
        set((state) => ({
            maintenanceLogs: state.maintenanceLogs.map((l) => (l.id === id ? updated : l))
        }));
    },
    deleteMaintenanceLog: async (token, id) => {
        await api.deleteMaintenanceLogApi(token, id);
        set((state) => ({
            maintenanceLogs: state.maintenanceLogs.filter((l) => l.id !== id)
        }));
    },

    // ── Expense Logs (Placeholders) ──────────────────────────────────────────
    addExpenseLog: async (token, logData) => {
        const newLog: ExpenseLog = {
            ...logData as any,
            id: `e${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        set((state) => ({ expenseLogs: [newLog, ...state.expenseLogs] }));
    },
    updateExpenseLog: async (token, id, updates) => {
        set((state) => ({
            expenseLogs: state.expenseLogs.map((l) => (l.id === id ? { ...l, ...updates } : l))
        }));
    },
    deleteExpenseLog: async (token, id) => {
        set((state) => ({
            expenseLogs: state.expenseLogs.filter((l) => l.id !== id)
        }));
    },
}));
