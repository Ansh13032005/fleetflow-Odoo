'use client';

import { useState, useMemo } from 'react';
import { useFleetStore } from '@/store/useFleetStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Trip, TripStatus, VehicleStatus, DriverStatus } from '@/types';
import {
    Plus, X, AlertTriangle, CheckCircle2, Clock, XCircle,
    Truck, Users, MapPin, Weight, Search, ChevronDown,
    Zap, Flag, RotateCcw, Trash2, ArrowRight, PackageCheck,
    Info
} from 'lucide-react';

// ─── Trip Status Config ───────────────────────────────────────────────────────
const statusConfig: Record<TripStatus, { label: string; classes: string; icon: React.ElementType; dotColor: string }> = {
    [TripStatus.DRAFT]: { label: 'Draft', icon: Clock, classes: 'bg-neutral-100 dark:bg-neutral-700/40 text-neutral-600 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700', dotColor: 'bg-neutral-400 dark:bg-neutral-500' },
    [TripStatus.DISPATCHED]: { label: 'Dispatched', icon: Zap, classes: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/25', dotColor: 'bg-blue-500 dark:bg-blue-400' },
    [TripStatus.COMPLETED]: { label: 'Completed', icon: CheckCircle2, classes: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25', dotColor: 'bg-emerald-500 dark:bg-emerald-400' },
    [TripStatus.CANCELLED]: { label: 'Cancelled', icon: XCircle, classes: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/25', dotColor: 'bg-rose-500 dark:bg-rose-400' },
};

function StatusPill({ status }: { status: TripStatus }) {
    const cfg = statusConfig[status];
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border shadow-sm ${cfg.classes}`}>
            <Icon className="w-3.5 h-3.5" />{cfg.label}
        </span>
    );
}

// ─── Lifecycle Step Bar ───────────────────────────────────────────────────────
const lifeCycleSteps: TripStatus[] = [TripStatus.DRAFT, TripStatus.DISPATCHED, TripStatus.COMPLETED];
function LifecycleBar({ status }: { status: TripStatus }) {
    if (status === TripStatus.CANCELLED) {
        return (
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-bold">
                <XCircle className="w-3.5 h-3.5" /> Trip Cancelled
            </div>
        );
    }
    const current = lifeCycleSteps.indexOf(status);
    return (
        <div className="flex items-center gap-1">
            {lifeCycleSteps.map((step, i) => {
                const done = i <= current;
                const cfg = statusConfig[step];
                return (
                    <div key={step} className="flex items-center gap-1">
                        <div className={`h-2 w-8 rounded-full transition-colors shadow-inner ${done ? cfg.dotColor : 'bg-neutral-200 dark:bg-neutral-700'}`} />
                        {i < lifeCycleSteps.length - 1 && <div className="w-1" />}
                    </div>
                );
            })}
            <span className="ml-2 text-[10px] font-bold uppercase text-neutral-500 dark:text-neutral-400">{statusConfig[status].label}</span>
        </div>
    );
}

// ─── Create / Edit Trip Modal ─────────────────────────────────────────────────

function TripModal({ trip, onClose }: { trip?: Trip; onClose: () => void }) {
    const { token } = useAuthStore();
    const { vehicles, drivers, createTrip } = useFleetStore();

    const availableVehicles = vehicles.filter((v) => v.status === VehicleStatus.AVAILABLE);
    const availableDrivers = drivers.filter(
        (d) => d.status === DriverStatus.ON_DUTY && new Date(d.licenseExpiry) > new Date()
    );

    const [form, setForm] = useState({
        startLocation: trip?.startLocation ?? '',
        endLocation: trip?.endLocation ?? '',
        cargoWeight: trip?.cargoWeight ?? 0,
        vehicleId: trip?.vehicleId ?? '',
        driverId: trip?.driverId ?? '',
    });

    const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);
    const capacityExceeded = selectedVehicle ? form.cargoWeight > selectedVehicle.maxLoadCapacity : false;
    const capacityPct = selectedVehicle ? Math.min((form.cargoWeight / selectedVehicle.maxLoadCapacity) * 100, 100) : 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        if (capacityExceeded) return; // Backend also validates; block submit for better UX
        createTrip(token, {
            startLocation: form.startLocation,
            endLocation: form.endLocation,
            cargoWeight: form.cargoWeight,
            vehicleId: form.vehicleId || undefined,
            driverId: form.driverId || undefined,
            status: TripStatus.DRAFT,
        });
        onClose();
    };

    const inputClass = "w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors text-sm font-medium shadow-sm";
    const labelClass = "block text-xs font-bold text-neutral-700 dark:text-neutral-400 mb-1.5";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 dark:bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-xl shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl"><PackageCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
                        <h2 className="text-base font-bold text-neutral-900 dark:text-white">Create New Trip</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Locations */}
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className={labelClass}>
                                <MapPin className="w-3.5 h-3.5 inline mr-1 text-neutral-400 dark:text-neutral-500" />Start Location
                            </label>
                            <input required className={inputClass} placeholder="e.g. Mumbai Warehouse"
                                value={form.startLocation} onChange={(e) => setForm({ ...form, startLocation: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>
                                <Flag className="w-3.5 h-3.5 inline mr-1 text-neutral-400 dark:text-neutral-500" />End Location
                            </label>
                            <input required className={inputClass} placeholder="e.g. Pune Distribution Hub"
                                value={form.endLocation} onChange={(e) => setForm({ ...form, endLocation: e.target.value })} />
                        </div>
                    </div>

                    {/* Cargo Weight */}
                    <div>
                        <label className={labelClass}>
                            <Weight className="w-3.5 h-3.5 inline mr-1 text-neutral-400 dark:text-neutral-500" />Cargo Weight (kg)
                        </label>
                        <input required type="number" min={1} className={`${inputClass} ${capacityExceeded ? 'border-rose-500 focus:ring-rose-500/50 focus:border-rose-500' : ''}`}
                            placeholder="e.g. 450"
                            value={form.cargoWeight || ''}
                            onChange={(e) => setForm({ ...form, cargoWeight: Number(e.target.value) })} />

                        {/* Capacity Gauge */}
                        {selectedVehicle && form.cargoWeight > 0 && (
                            <div className="mt-3 space-y-2">
                                <div className="h-2.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className={`h-full rounded-full transition-all ${capacityExceeded ? 'bg-rose-500' : capacityPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min(capacityPct, 100)}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wide">
                                    <span className={capacityExceeded ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-500 dark:text-neutral-400'}>
                                        {form.cargoWeight} kg / {selectedVehicle.maxLoadCapacity} kg capacity
                                    </span>
                                    {capacityExceeded
                                        ? <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> OVERLOAD</span>
                                        : <span className="text-neutral-500 dark:text-neutral-400">{Math.round(capacityPct)}% used</span>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Vehicle Select */}
                    <div>
                        <label className={labelClass}>
                            <Truck className="w-3.5 h-3.5 inline mr-1 text-neutral-400 dark:text-neutral-500" />Assign Vehicle
                            <span className="ml-1 text-neutral-500 dark:text-neutral-600 text-[10px] font-normal">(only available vehicles shown)</span>
                        </label>
                        <div className="relative">
                            <select className={`${inputClass} appearance-none cursor-pointer`}
                                value={form.vehicleId}
                                onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
                                <option value="">— Select a vehicle —</option>
                                {availableVehicles.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.nameModel} ({v.licensePlate}) · Max {v.maxLoadCapacity} kg
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                        </div>
                        {availableVehicles.length === 0 && (
                            <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4" /> No available vehicles. Check Vehicle Registry.
                            </p>
                        )}
                    </div>

                    {/* Driver Select */}
                    <div>
                        <label className={labelClass}>
                            <Users className="w-3.5 h-3.5 inline mr-1 text-neutral-400 dark:text-neutral-500" />Assign Driver
                            <span className="ml-1 text-neutral-500 dark:text-neutral-600 text-[10px] font-normal">(on-duty + valid license only)</span>
                        </label>
                        <div className="relative">
                            <select className={`${inputClass} appearance-none cursor-pointer`}
                                value={form.driverId}
                                onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
                                <option value="">— Select a driver —</option>
                                {availableDrivers.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.firstName} {d.lastName} · Safety: {d.safetyScore}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                        </div>
                        {availableDrivers.length === 0 && (
                            <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4" /> No eligible drivers available.
                            </p>
                        )}
                    </div>

                    {/* Overload error banner */}
                    {capacityExceeded && (
                        <div className="flex items-start gap-3 px-5 py-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 rounded-xl text-rose-800 dark:text-rose-400 text-sm shadow-sm">
                            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
                            <span className="font-medium">Cargo weight exceeds vehicle capacity. <strong>This trip cannot be dispatched</strong> until the weight is reduced or a larger vehicle is selected.</span>
                        </div>
                    )}

                    <div className="flex gap-3 pt-3">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-bold transition-colors shadow-sm">
                            Cancel
                        </button>
                        <button type="submit" disabled={capacityExceeded}
                            className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 text-sm font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                            Save as Draft
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Complete Trip Modal ──────────────────────────────────────────────────────
function CompleteModal({ trip, onClose }: { trip: Trip; onClose: () => void }) {
    const { token } = useAuthStore();
    const { vehicles, completeTrip } = useFleetStore();
    const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
    const [odometer, setOdometer] = useState(vehicle?.odometer ?? 0);
    const [fuelLiters, setFuelLiters] = useState<number>(0);
    const [fuelCost, setFuelCost] = useState<number>(0);

    const inputClass = "w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl px-4 py-3 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-medium shadow-sm";

    const handleComplete = () => {
        if (!token) return;
        completeTrip(token, trip.id, {
            finalOdometer: odometer,
            fuelLiters: fuelLiters > 0 ? fuelLiters : undefined,
            fuelCost: fuelCost > 0 ? fuelCost : undefined,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 dark:bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10"><CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /></div>
                    <div>
                        <h3 className="font-bold text-neutral-900 dark:text-white text-lg">Complete Trip</h3>
                        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-1">{trip.startLocation ?? '—'} → {trip.endLocation ?? '—'}</p>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-400 mb-2">Final Odometer Reading (km)</label>
                    <input type="number" min={vehicle?.odometer ?? 0}
                        className={inputClass}
                        value={odometer || ''} onChange={(e) => setOdometer(Number(e.target.value) || 0)} />
                    {vehicle && <p className="text-xs font-medium text-neutral-500 mt-2">Previous reading: <span className="font-mono">{vehicle.odometer.toLocaleString()} km</span></p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-400 mb-2">Fuel Liters</label>
                        <input type="number" min={0} step={0.1} placeholder="0"
                            className={inputClass}
                            value={fuelLiters || ''} onChange={(e) => setFuelLiters(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-400 mb-2">Fuel Cost (₹)</label>
                        <input type="number" min={0} step={0.01} placeholder="0"
                            className={inputClass}
                            value={fuelCost || ''} onChange={(e) => setFuelCost(parseFloat(e.target.value) || 0)} />
                    </div>
                </div>
                <div className="flex items-start gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-xs text-emerald-800 dark:text-emerald-400 font-medium">
                    <Info className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    Completing will set vehicle and driver back to <strong className="mx-1">Available</strong> / <strong>On Duty</strong>, update odometer, and save fuel to expenses if provided.
                </div>
                <div className="flex gap-3 pt-2">
                    <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-bold transition-colors shadow-sm">Cancel</button>
                    <button onClick={handleComplete}
                        className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 text-sm font-bold transition-colors shadow-sm">
                        Mark Complete
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Trip Card ────────────────────────────────────────────────────────────────
function TripCard({ trip, onDispatch, onComplete, onCancel, onDelete }: {
    trip: Trip;
    onDispatch: (t: Trip) => void;
    onComplete: (t: Trip) => void;
    onCancel: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    const { vehicles, drivers } = useFleetStore();
    const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
    const driver = drivers.find((d) => d.id === trip.driverId);

    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-sm flex flex-col group">
            {/* Card Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-transparent shrink-0">
                        <Truck className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap mb-1">
                            <span className="font-bold text-neutral-900 dark:text-white text-sm truncate">
                                {trip.startLocation ?? '—'}
                            </span>
                            <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
                            <span className="font-bold text-neutral-900 dark:text-white text-sm truncate">
                                {trip.endLocation ?? '—'}
                            </span>
                        </div>
                        <p className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 tracking-wider font-mono">ID: {trip.id}</p>
                    </div>
                </div>
                <StatusPill status={trip.status} />
            </div>

            {/* Card Body */}
            <div className="px-6 py-5 grid grid-cols-2 gap-y-6 gap-x-4 text-sm flex-1">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Cargo Weight</p>
                    <p className="text-neutral-900 dark:text-white font-bold text-lg">{trip.cargoWeight.toLocaleString()} <span className="text-sm font-medium text-neutral-500">kg</span></p>
                    {vehicle && (
                        <p className={`text-xs font-semibold ${trip.cargoWeight > vehicle.maxLoadCapacity ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
                            {trip.cargoWeight > vehicle.maxLoadCapacity
                                ? `⚠ Exceeds ${vehicle.maxLoadCapacity} kg max`
                                : `${Math.round((trip.cargoWeight / vehicle.maxLoadCapacity) * 100)}% of capacity`}
                        </p>
                    )}
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Assigned Vehicle</p>
                    {vehicle
                        ? <p className="text-neutral-900 dark:text-white font-bold truncate text-base">{vehicle.nameModel}</p>
                        : <p className="text-neutral-400 italic text-sm font-medium">Not assigned</p>}
                    {vehicle && <p className="text-xs font-mono font-medium text-neutral-500">{vehicle.licensePlate}</p>}
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Driver</p>
                    {driver
                        ? <p className="text-neutral-900 dark:text-white font-bold text-base">{driver.firstName} {driver.lastName}</p>
                        : <p className="text-neutral-400 italic text-sm font-medium">Not assigned</p>}
                    {driver && <p className="text-xs font-medium text-neutral-500">Safety Score: <span className="font-bold text-emerald-600 dark:text-emerald-400">{driver.safetyScore}/100</span></p>}
                </div>
                <div className="space-y-1.5 flex flex-col justify-end">
                    <p className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Progress</p>
                    <LifecycleBar status={trip.status} />
                </div>
            </div>

            {/* Card Actions */}
            {(trip.status === TripStatus.DRAFT || trip.status === TripStatus.DISPATCHED) && (
                <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center gap-3 flex-wrap bg-neutral-50/50 dark:bg-neutral-950/30">
                    {trip.status === TripStatus.DRAFT && (
                        <button onClick={() => onDispatch(trip)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-xs font-bold transition-colors border border-blue-200 dark:border-blue-500/20 shadow-sm">
                            <Zap className="w-4 h-4" /> Dispatch Trip
                        </button>
                    )}
                    {trip.status === TripStatus.DISPATCHED && (
                        <button onClick={() => onComplete(trip)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-xs font-bold transition-colors border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
                            <CheckCircle2 className="w-4 h-4" /> Mark Complete
                        </button>
                    )}
                    <button onClick={() => onCancel(trip.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-xs font-bold transition-colors border border-rose-200 dark:border-rose-500/20 shadow-sm">
                        <RotateCcw className="w-4 h-4" /> Cancel Try
                    </button>
                    <button onClick={() => onDelete(trip.id)}
                        className="ml-auto flex items-center gap-1.5 p-2 rounded-xl text-neutral-400 dark:text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TripDispatcherPage() {
    const { token } = useAuthStore();
    const { trips, dispatchTrip, cancelTrip, deleteTrip } = useFleetStore();
    const [showModal, setShowModal] = useState(false);
    const [completeTrip, setCompleteTrip] = useState<Trip | null>(null);
    const [filterStatus, setFilterStatus] = useState<TripStatus | 'ALL'>('ALL');
    const [search, setSearch] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const filtered = useMemo(() => {
        return trips.filter((t) => {
            const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
            const matchSearch =
                (t.startLocation ?? '').toLowerCase().includes(search.toLowerCase()) ||
                (t.endLocation ?? '').toLowerCase().includes(search.toLowerCase()) ||
                t.id.toLowerCase().includes(search.toLowerCase());
            return matchStatus && matchSearch;
        });
    }, [trips, filterStatus, search]);

    const handleDispatch = (trip: Trip) => {
        if (!token) return;
        setErrorMsg(null);
        dispatchTrip(token, trip.id).then(result => {
            if (!result.success) {
                setErrorMsg(result.error ?? 'Dispatch failed.');
                setTimeout(() => setErrorMsg(null), 5000);
            } else {
                setSuccessMsg(`✅ Trip dispatched successfully! Vehicle & Driver are now ON TRIP.`);
                setTimeout(() => setSuccessMsg(null), 4000);
            }
        });
    };

    const handleCancel = (tripId: string) => {
        if (token) cancelTrip(token, tripId);
        setSuccessMsg('Trip cancelled. Resources have been released.');
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    // Summary counts
    const counts = Object.values(TripStatus).reduce((acc, s) => {
        acc[s] = trips.filter((t) => t.status === s).length;
        return acc;
    }, {} as Record<TripStatus, number>);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Trip Dispatcher</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5 font-medium">Manage the full lifecycle of all cargo trips.</p>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm shrink-0">
                    <Plus className="w-4 h-4" /> New Trip
                </button>
            </div>

            {/* Toast Notifications */}
            {errorMsg && (
                <div className="flex items-start gap-3 px-5 py-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl text-rose-800 dark:text-rose-400 text-sm font-medium shadow-sm animate-in fade-in slide-in-from-top-2">
                    <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span>{errorMsg}</span>
                    <button onClick={() => setErrorMsg(null)} className="ml-auto shrink-0 p-1 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-md"><X className="w-4 h-4" /></button>
                </div>
            )}
            {successMsg && (
                <div className="flex items-start gap-3 px-5 py-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl text-emerald-800 dark:text-emerald-400 text-sm font-medium shadow-sm animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{successMsg}</span>
                    <button onClick={() => setSuccessMsg(null)} className="ml-auto shrink-0 p-1 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-md"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Status Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.values(TripStatus).map((s) => {
                    const cfg = statusConfig[s];
                    const Icon = cfg.icon;
                    const active = filterStatus === s;
                    return (
                        <button key={s} onClick={() => setFilterStatus(active ? 'ALL' : s)}
                            className={`flex items-center gap-3 px-5 py-4 rounded-2xl border text-left transition-all shadow-sm ${active ? cfg.classes + ' scale-[1.02] ring-2 ring-emerald-500/20' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-200'}`}>
                            <Icon className="w-5 h-5 shrink-0 mb-auto mt-0.5" />
                            <div>
                                <p className="text-2xl font-black leading-none text-neutral-900 dark:text-white">{counts[s]}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest mt-1.5">{cfg.label}</p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Search + Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                    <input className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl pl-11 pr-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-medium transition-colors shadow-sm"
                        placeholder="Search by location or trip ID..."
                        value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="relative">
                    <select className="w-full sm:w-auto bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl px-5 pr-11 py-3 text-sm font-bold text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer shadow-sm transition-colors"
                        value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as TripStatus | 'ALL')}>
                        <option value="ALL">All Trip Statuses ({trips.length})</option>
                        {Object.values(TripStatus).map((s) => (
                            <option key={s} value={s}>{statusConfig[s].label} ({counts[s]})</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
                </div>
            </div>

            {/* Rule Info Banner */}
            <div className="flex items-start gap-4 px-5 py-4 bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/15 rounded-2xl text-blue-800 dark:text-blue-400/80 text-sm font-medium shadow-sm">
                <Info className="w-5 h-5 shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="leading-relaxed">
                    <strong className="text-blue-900 dark:text-blue-300">Dispatch Rules:</strong> Trips are blocked if (1) cargo exceeds vehicle max load, (2) driver license is expired, or (3) vehicle/driver is not available. All checks run at dispatch time automatically.
                </span>
            </div>

            {/* Trip Cards Grid */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl text-center shadow-sm">
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-full mb-4">
                        <PackageCheck className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
                    </div>
                    <p className="text-neutral-900 dark:text-white font-bold text-lg">No trips found</p>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1 font-medium">Adjust your filters or create a new trip using the button above.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {filtered.map((trip) => (
                        <TripCard
                            key={trip.id}
                            trip={trip}
                            onDispatch={handleDispatch}
                            onComplete={(t) => setCompleteTrip(t)}
                            onCancel={handleCancel}
                            onDelete={(id) => { if (token) deleteTrip(token, id); }}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            {showModal && <TripModal onClose={() => setShowModal(false)} />}
            {completeTrip && <CompleteModal trip={completeTrip} onClose={() => setCompleteTrip(null)} />}
        </div>
    );
}
