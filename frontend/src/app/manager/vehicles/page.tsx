'use client';

import { useState, useEffect } from 'react';
import { useFleetStore } from '@/store/useFleetStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Vehicle, VehicleStatus } from '@/types';
import {
    Truck, Plus, Pencil, Trash2, X, CheckCircle2,
    AlertTriangle, Wrench, Ban, Search, ChevronDown, Loader2
} from 'lucide-react';

// ─── Status Pill ──────────────────────────────────────────────────────────────
const statusConfig: Record<VehicleStatus, { label: string; classes: string; icon: React.ElementType }> = {
    [VehicleStatus.AVAILABLE]: { label: 'Available', classes: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25', icon: CheckCircle2 },
    [VehicleStatus.ON_TRIP]: { label: 'On Trip', classes: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/25', icon: Truck },
    [VehicleStatus.IN_SHOP]: { label: 'In Shop', classes: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/25', icon: Wrench },
    [VehicleStatus.OUT_OF_SERVICE]: { label: 'Out of Service', classes: 'bg-neutral-100 dark:bg-neutral-700/40 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700', icon: Ban },
};

function StatusPill({ status }: { status: VehicleStatus }) {
    const cfg = statusConfig[status];
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.classes}`}>
            <Icon className="w-3.5 h-3.5" />
            {cfg.label}
        </span>
    );
}

// ─── Empty Form State ─────────────────────────────────────────────────────────
const emptyForm = { nameModel: '', licensePlate: '', maxLoadCapacity: 0, odometer: 0, status: VehicleStatus.AVAILABLE };

// ─── Modal ────────────────────────────────────────────────────────────────────
function VehicleModal({
    vehicle,
    onClose,
    onSave,
}: {
    vehicle: Vehicle | null;
    onClose: () => void;
    onSave: (data: typeof emptyForm) => void;
}) {
    const [form, setForm] = useState(
        vehicle
            ? { nameModel: vehicle.nameModel, licensePlate: vehicle.licensePlate, maxLoadCapacity: vehicle.maxLoadCapacity, odometer: vehicle.odometer, status: vehicle.status }
            : emptyForm
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(form);
    };

    const inputClass = "w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors text-sm font-medium shadow-sm";
    const labelClass = "block text-xs font-semibold text-neutral-700 dark:text-neutral-400 mb-1.5";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 dark:bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                    <h2 className="text-base font-bold text-neutral-900 dark:text-white">{vehicle ? 'Edit Vehicle' : 'Register New Vehicle'}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="col-span-2">
                            <label className={labelClass}>Name / Model</label>
                            <input required className={inputClass} placeholder="e.g. Ford Transit Van-05"
                                value={form.nameModel} onChange={(e) => setForm({ ...form, nameModel: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>License Plate (ID)</label>
                            <input required className={inputClass} placeholder="KA-01-AB-1234"
                                value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>Status</label>
                            <div className="relative">
                                <select className={`${inputClass} appearance-none cursor-pointer`}
                                    value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as VehicleStatus })}>
                                    {Object.values(VehicleStatus).map((s) => <option key={s} value={s}>{statusConfig[s].label}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Max Load Capacity (kg)</label>
                            <input required type="number" min={1} className={inputClass} placeholder="500"
                                value={form.maxLoadCapacity || ''} onChange={(e) => setForm({ ...form, maxLoadCapacity: Number(e.target.value) })} />
                        </div>
                        <div>
                            <label className={labelClass}>Odometer (km)</label>
                            <input required type="number" min={0} className={inputClass} placeholder="54200"
                                value={form.odometer || ''} onChange={(e) => setForm({ ...form, odometer: Number(e.target.value) })} />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-3">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-bold transition-colors shadow-sm">
                            Cancel
                        </button>
                        <button type="submit"
                            className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 text-sm font-bold transition-colors shadow-sm">
                            {vehicle ? 'Save Changes' : 'Register Vehicle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function VehicleRegistryPage() {
    const { token } = useAuthStore();
    const { vehicles, fetchVehicles, addVehicle, updateVehicle, deleteVehicle, isLoading, error } = useFleetStore();

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<VehicleStatus | 'ALL'>('ALL');
    const [modalVehicle, setModalVehicle] = useState<Vehicle | null | undefined>(undefined);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (token) fetchVehicles(token);
    }, [token, fetchVehicles]);

    const filtered = vehicles.filter((v) => {
        const matchSearch = v.nameModel.toLowerCase().includes(search.toLowerCase()) || v.licensePlate.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'ALL' || v.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const handleSave = async (data: typeof emptyForm) => {
        if (!token) return;
        if (modalVehicle) {
            await updateVehicle(token, modalVehicle.id, data);
        } else {
            await addVehicle(token, data);
        }
        setModalVehicle(undefined);
    };

    const toggleRetired = async (v: Vehicle) => {
        if (!token) return;
        await updateVehicle(token, v.id, {
            status: v.status === VehicleStatus.OUT_OF_SERVICE ? VehicleStatus.AVAILABLE : VehicleStatus.OUT_OF_SERVICE,
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Vehicle Registry</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5 font-medium">Manage all physical fleet assets.</p>
                </div>
                <button
                    onClick={() => setModalVehicle(null)}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Vehicle
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 text-rose-600 dark:text-rose-400 text-sm font-medium">
                    Error loading vehicles: {error}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                    <input
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm transition-colors font-medium shadow-sm"
                        placeholder="Search by name or plate..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative shrink-0">
                    <select
                        className="w-full sm:w-auto bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl px-4 pr-10 py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer transition-colors shadow-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as VehicleStatus | 'ALL')}
                    >
                        <option value="ALL">All Statuses</option>
                        {Object.values(VehicleStatus).map((s) => (
                            <option key={s} value={s}>{statusConfig[s].label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
                </div>
            </div>

            {/* Summary Pills */}
            <div className="flex flex-wrap gap-2">
                {Object.values(VehicleStatus).map((s) => {
                    const count = vehicles.filter((v) => v.status === s).length;
                    const cfg = statusConfig[s];
                    const isActive = filterStatus === s;
                    return (
                        <button key={s}
                            onClick={() => setFilterStatus(isActive ? 'ALL' : s)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all shadow-sm ${isActive ? cfg.classes : 'border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-700'}`}>
                            <cfg.icon className="w-3.5 h-3.5" />
                            {cfg.label}: <span>{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 bg-neutral-50/50 dark:bg-neutral-900">
                                <th className="text-left px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Vehicle</th>
                                <th className="text-left px-6 py-4 font-bold uppercase text-[10px] tracking-wider">License Plate</th>
                                <th className="text-left px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Max Load</th>
                                <th className="text-left px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Odometer</th>
                                <th className="text-left px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Status</th>
                                <th className="text-center px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Out of Service</th>
                                <th className="text-right px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-16">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-2" />
                                        <p className="text-neutral-500 font-medium">Syncing fleet registry...</p>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-16 text-neutral-500 font-medium">
                                        <Truck className="w-8 h-8 mx-auto mb-3 opacity-30 text-neutral-400 dark:text-neutral-500" />
                                        No vehicles found matching criteria.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((v) => (
                                    <tr key={v.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center">
                                                    <Truck className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                                                </div>
                                                <span className="font-bold text-neutral-900 dark:text-white">{v.nameModel}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-medium text-neutral-600 dark:text-neutral-300">{v.licensePlate}</td>
                                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300 font-medium">{v.maxLoadCapacity.toLocaleString()} kg</td>
                                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300 font-medium">{v.odometer.toLocaleString()} km</td>
                                        <td className="px-6 py-4"><StatusPill status={v.status} /></td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => toggleRetired(v)}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${v.status === VehicleStatus.OUT_OF_SERVICE ? 'bg-rose-500' : 'bg-neutral-300 dark:bg-neutral-700'}`}
                                                title="Toggle Out of Service status"
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${v.status === VehicleStatus.OUT_OF_SERVICE ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setModalVehicle(v)}
                                                    className="p-2 rounded-lg text-neutral-400 dark:text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                                                    title="Edit Vehicle"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(v.id)}
                                                    className="p-2 rounded-lg text-neutral-400 dark:text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                                                    title="Delete Vehicle"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-50/50 dark:bg-neutral-900">
                    Showing {filtered.length} of {vehicles.length} assets
                </div>
            </div>

            {/* Delete confirm */}
            {deletingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 dark:bg-black/70 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10"><AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" /></div>
                            <h3 className="font-bold text-neutral-900 dark:text-white">Delete Vehicle?</h3>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">This action cannot be undone. All related logs will be preserved but this asset will be permanently removed.</p>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setDeletingId(null)}
                                className="flex-1 px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-bold transition-colors shadow-sm">
                                Cancel
                            </button>
                            <button onClick={async () => { if (token) { await deleteVehicle(token, deletingId); setDeletingId(null); } }}
                                className="flex-1 px-4 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 dark:hover:bg-rose-400 text-white dark:text-neutral-950 text-sm font-bold transition-colors shadow-sm">
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal */}
            {modalVehicle !== undefined && (
                <VehicleModal
                    vehicle={modalVehicle}
                    onClose={() => setModalVehicle(undefined)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}
