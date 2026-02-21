'use client';

import { useEffect, useMemo, useState } from 'react';
import { useFleetStore } from '@/store/useFleetStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Trip, TripStatus, VehicleStatus, DriverStatus } from '@/types';
import { Zap, Clock, CheckCircle2, XCircle, Plus, X, AlertTriangle, Truck, ArrowRight, Search, ChevronDown, PackageCheck, Info, RotateCcw, Trash2, Loader2 } from 'lucide-react';

const statusConfig: Record<TripStatus, { label: string; classes: string; icon: React.ElementType }> = {
    [TripStatus.DRAFT]: { label: 'Draft', icon: Clock, classes: 'bg-neutral-700/40 text-neutral-300 border-neutral-700' },
    [TripStatus.DISPATCHED]: { label: 'Dispatched', icon: Zap, classes: 'bg-blue-500/10 text-blue-400 border-blue-500/25' },
    [TripStatus.COMPLETED]: { label: 'Completed', icon: CheckCircle2, classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' },
    [TripStatus.CANCELLED]: { label: 'Cancelled', icon: XCircle, classes: 'bg-rose-500/10 text-rose-400 border-rose-500/25' },
};

function StatusPill({ status }: { status: TripStatus }) {
    const cfg = statusConfig[status];
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.classes}`}>
            <Icon className="w-3 h-3" /> {cfg.label}
        </span>
    );
}

function TripModal({ onClose }: { onClose: () => void }) {
    const { token } = useAuthStore();
    const { vehicles, drivers, availableVehicles, validDrivers, createTrip, fetchSelectionResources, isLoading } = useFleetStore();
    const [form, setForm] = useState({ startLocation: '', endLocation: '', cargoWeight: 0, vehicleId: '', driverId: '' });

    useEffect(() => {
        if (token) fetchSelectionResources(token);
    }, [token, fetchSelectionResources]);

    // Fallback to filtering local state if specialized sync hasn't finished
    const vList = availableVehicles.length > 0 ? availableVehicles : vehicles.filter(v => v.status === VehicleStatus.AVAILABLE);
    const dList = validDrivers.length > 0 ? validDrivers : drivers.filter(d => d.status === DriverStatus.ON_DUTY && new Date(d.licenseExpiry) > new Date());

    const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId) || availableVehicles.find(v => v.id === form.vehicleId);
    const overload = selectedVehicle && form.cargoWeight > selectedVehicle.maxLoadCapacity;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        const res = await createTrip(token, {
            startLocation: form.startLocation,
            endLocation: form.endLocation,
            cargoWeight: form.cargoWeight,
            vehicleId: form.vehicleId || undefined,
            driverId: form.driverId || undefined,
            status: TripStatus.DRAFT
        });
        if (res.success) onClose();
    };

    const inp = "w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-colors disabled:opacity-50";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                )}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg"><PackageCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
                        <h2 className="text-base font-semibold text-neutral-900 dark:text-white">Create New Trip</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Start Location</label>
                            <input required className={inp} placeholder="Origin" value={form.startLocation} onChange={(e) => setForm({ ...form, startLocation: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-1.5">End Location</label>
                            <input required className={inp} placeholder="Destination" value={form.endLocation} onChange={(e) => setForm({ ...form, endLocation: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1.5">Cargo Weight (kg)</label>
                        <input required type="number" min={1} className={`${inp} ${overload ? 'border-rose-500 text-rose-500' : ''}`} value={form.cargoWeight || ''} onChange={(e) => setForm({ ...form, cargoWeight: Number(e.target.value) })} />
                        {overload && <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Exceeds vehicle capacity of {selectedVehicle?.maxLoadCapacity} kg</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1.5">Vehicle <span className="text-neutral-600">(available only)</span></label>
                        <div className="relative text-white">
                            <select required className={`${inp} appearance-none`} value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
                                <option value="">— Select vehicle —</option>
                                {vList.map((v: any) => <option key={v.id} value={v.id}>{v.nameModel} · {v.licensePlate} · {v.maxLoadCapacity} kg</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1.5">Driver <span className="text-neutral-600">(on-duty + valid license)</span></label>
                        <div className="relative text-white">
                            <select required className={`${inp} appearance-none`} value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
                                <option value="">— Select driver —</option>
                                {dList.map((d: any) => <option key={d.id} value={d.id}>{d.firstName} {d.lastName} · Safety: {d.safetyScore}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium transition-colors">Cancel</button>
                        <button type="submit" disabled={overload || !form.vehicleId || !form.driverId || isLoading} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:bg-neutral-700 disabled:text-neutral-500 text-white text-sm font-semibold transition-colors">Create Draft</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Complete Trip Modal (Phase 4: final odometer, fuel liters, fuel cost) ─────
function CompleteModal({ trip, onClose }: { trip: Trip; onClose: () => void }) {
    const { token } = useAuthStore();
    const { vehicles, completeTrip } = useFleetStore();
    const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
    const [odometer, setOdometer] = useState(vehicle?.odometer ?? 0);
    const [fuelLiters, setFuelLiters] = useState<number>(0);
    const [fuelCost, setFuelCost] = useState<number>(0);
    const inp = 'w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-colors';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10"><CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
                    <div>
                        <h3 className="font-bold text-neutral-900 dark:text-white text-base">Complete Trip</h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{trip.startLocation ?? '—'} → {trip.endLocation ?? '—'}</p>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">Final Odometer (km)</label>
                    <input type="number" min={vehicle?.odometer ?? 0} className={inp} value={odometer || ''} onChange={(e) => setOdometer(Number(e.target.value) || 0)} />
                    {vehicle && <p className="text-[10px] text-neutral-500 mt-1">Previous: {vehicle.odometer?.toLocaleString()} km</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1.5">Fuel Liters</label>
                        <input type="number" min={0} step={0.1} placeholder="0" className={inp} value={fuelLiters || ''} onChange={(e) => setFuelLiters(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1.5">Fuel Cost (₹)</label>
                        <input type="number" min={0} step={0.01} placeholder="0" className={inp} value={fuelCost || ''} onChange={(e) => setFuelCost(parseFloat(e.target.value) || 0)} />
                    </div>
                </div>
                <div className="flex items-start gap-2 px-3 py-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs text-emerald-700 dark:text-emerald-400">
                    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>Vehicle and driver will be set back to Available / On Duty. Fuel data is saved to expenses.</span>
                </div>
                <div className="flex gap-3 pt-1">
                    <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-semibold">Cancel</button>
                    <button type="button" onClick={handleComplete} className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold">Mark Complete</button>
                </div>
            </div>
        </div>
    );
}

export default function DispatcherTripsPage() {
    const { token } = useAuthStore();
    const { trips, vehicles, drivers, fetchTrips, fetchVehicles, fetchDrivers, dispatchTrip, cancelTrip, deleteTrip, isLoading, error } = useFleetStore();
    const [tripToComplete, setTripToComplete] = useState<Trip | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState<TripStatus | 'ALL'>('ALL');
    const [search, setSearch] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        if (token) {
            fetchTrips(token);
            fetchVehicles(token);
            fetchDrivers(token);
        }
    }, [token, fetchTrips, fetchVehicles, fetchDrivers]);

    const filtered = useMemo(() => trips.filter((t) => {
        const matchStatus = filter === 'ALL' || t.status === filter;
        const matchSearch = (t.startLocation ?? '').toLowerCase().includes(search.toLowerCase()) || (t.endLocation ?? '').toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    }), [trips, filter, search]);

    const counts = Object.values(TripStatus).reduce((acc, s) => { acc[s] = trips.filter((t) => t.status === s).length; return acc; }, {} as Record<TripStatus, number>);

    const handleDispatch = async (tripId: string) => {
        if (!token) return;
        const result = await dispatchTrip(token, tripId);
        if (!result.success) { setErrorMsg(result.error ?? 'Failed'); setTimeout(() => setErrorMsg(null), 5000); }
        else { setSuccessMsg('Trip dispatched!'); setTimeout(() => setSuccessMsg(null), 3000); }
    };

    const handleCancel = async (tripId: string) => {
        if (!token) return;
        await cancelTrip(token, tripId);
        setSuccessMsg('Trip cancelled');
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const handleDelete = async (tripId: string) => {
        if (!token) return;
        if (confirm('Are you sure you want to delete this trip record?')) {
            await deleteTrip(token, tripId);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Trip Dispatcher</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">Create and dispatch cargo trips to available fleet assets.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)] shrink-0">
                    <Plus className="w-4 h-4" /> New Trip
                </button>
            </div>
            {(errorMsg || error) && <div className="flex items-start gap-3 px-5 py-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /><span>{errorMsg || error}</span><button onClick={() => setErrorMsg(null)} className="ml-auto"><X className="w-4 h-4" /></button></div>}
            {successMsg && <div className="flex items-center gap-3 px-5 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm"><CheckCircle2 className="w-4 h-4 shrink-0" /><span>{successMsg}</span></div>}

            {/* Status pills filter */}
            <div className="flex flex-wrap gap-2">
                {(['ALL', ...Object.values(TripStatus)] as const).map((s) => (
                    <button key={s} onClick={() => setFilter(s as TripStatus | 'ALL')}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === s ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/25' : 'border-neutral-300 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>
                        {s === 'ALL' ? `All (${trips.length})` : `${statusConfig[s as TripStatus].label} (${counts[s as TripStatus] || 0})`}
                    </button>
                ))}
                <div className="relative ml-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
                    <input className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-9 pr-4 py-1.5 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-600 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Search locations…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-2 px-4 py-2.5 bg-blue-500/5 border border-blue-500/15 rounded-xl text-blue-400/80 text-xs">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span><strong>Dispatch Rules:</strong> Cargo must not exceed vehicle capacity. Driver must have valid license and be On Duty.</span>
            </div>

            {/* Trip list */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 relative min-h-[200px]">
                {isLoading && trips.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                )}
                {filtered.length === 0 && !isLoading && (
                    <div className="col-span-2 flex flex-col items-center py-20 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm dark:shadow-none">
                        <PackageCheck className="w-10 h-10 text-neutral-700 mb-3" />
                        <p className="text-neutral-500 dark:text-neutral-500">No trips match the current filter.</p>
                    </div>
                )}
                {filtered.map((trip) => {
                    const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
                    const driver = drivers.find((d) => d.id === trip.driverId);
                    return (
                        <div key={trip.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-sm dark:shadow-none">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800/60">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 shrink-0"><Truck className="w-4 h-4 text-neutral-500 dark:text-neutral-400" /></div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap text-sm font-medium text-neutral-900 dark:text-white">
                                            <span className="truncate">{trip.startLocation ?? '—'}</span>
                                            <ArrowRight className="w-3 h-3 text-neutral-500 shrink-0" />
                                            <span className="truncate">{trip.endLocation ?? '—'}</span>
                                        </div>
                                        <p className="text-[10px] font-mono text-neutral-500 mt-0.5 uppercase">{trip.id.split('-').pop()}</p>
                                    </div>
                                </div>
                                <StatusPill status={trip.status} />
                            </div>
                            <div className="px-5 py-4 grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-0.5">Cargo</p>
                                    <p className="text-white font-medium">{trip.cargoWeight} kg</p>
                                    {vehicle && <p className={`text-xs ${trip.cargoWeight > vehicle.maxLoadCapacity ? 'text-rose-400 font-bold' : 'text-neutral-500'}`}>{trip.cargoWeight > vehicle.maxLoadCapacity ? '⚠ Overload' : `${Math.round((trip.cargoWeight / vehicle.maxLoadCapacity) * 100)}% cap`}</p>}
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-0.5">Vehicle</p>
                                    {vehicle ? <><p className="text-white font-medium truncate">{vehicle.nameModel}</p><p className="text-xs text-neutral-500">{vehicle.licensePlate}</p></> : <p className="text-neutral-600 italic text-xs">Not assigned</p>}
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-0.5">Driver</p>
                                    {driver ? <p className="text-white font-medium">{driver.firstName} {driver.lastName} · Safety {driver.safetyScore}/100</p> : <p className="text-neutral-600 italic text-xs">Not assigned</p>}
                                </div>
                            </div>
                            {(trip.status === TripStatus.DRAFT || trip.status === TripStatus.DISPATCHED) && (
                                <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800/60 flex items-center gap-2 flex-wrap bg-neutral-50 dark:bg-neutral-950/30">
                                    {trip.status === TripStatus.DRAFT && (
                                        <button onClick={() => handleDispatch(trip.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 text-xs font-semibold border border-blue-200 dark:border-blue-500/20 transition-colors">
                                            <Zap className="w-3.5 h-3.5" /> Dispatch
                                        </button>
                                    )}
                                    {trip.status === TripStatus.DISPATCHED && (
                                        <button onClick={() => setTripToComplete(trip)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold border border-emerald-200 dark:border-emerald-500/20 transition-colors">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Complete Trip
                                        </button>
                                    )}
                                    <button onClick={() => handleCancel(trip.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-semibold border border-rose-200 dark:border-rose-500/20 transition-colors">
                                        <RotateCcw className="w-3.5 h-3.5" /> Cancel
                                    </button>
                                    <button onClick={() => handleDelete(trip.id)} className="ml-auto p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {showModal && <TripModal onClose={() => setShowModal(false)} />}
            {tripToComplete && <CompleteModal trip={tripToComplete} onClose={() => setTripToComplete(null)} />}
        </div>
    );
}
