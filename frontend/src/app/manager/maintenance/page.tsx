'use client';

import { useState, useMemo, useEffect } from 'react';
import { useFleetStore } from '@/store/useFleetStore';
import { useAuthStore } from '@/store/useAuthStore';
import { MaintenanceLog, VehicleStatus } from '@/types';
import {
    Wrench, Plus, X, AlertTriangle, CheckCircle2, Trash2, Pencil,
    Search, ChevronDown, Info, IndianRupee,
    CalendarDays, ShieldAlert
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Log Modal ────────────────────────────────────────────────────────────────
const emptyForm = { vehicleId: '', description: '', cost: 0, date: new Date().toISOString().split('T')[0] };

function LogModal({
    log,
    onClose,
}: {
    log?: MaintenanceLog;
    onClose: () => void;
}) {
    const { token } = useAuthStore();
    const { vehicles, addMaintenanceLog, updateMaintenanceLog } = useFleetStore();

    const [form, setForm] = useState(
        log
            ? { vehicleId: log.vehicleId, description: log.description, cost: log.cost, date: log.date }
            : emptyForm
    );

    const selectedVehicle = vehicles.find((v) => v.id === form.vehicleId);
    const willSendToShop = selectedVehicle && selectedVehicle.status !== VehicleStatus.IN_SHOP && !log;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        if (log) {
            updateMaintenanceLog(token, log.id, form);
        } else {
            addMaintenanceLog(token, form);
        }
        onClose();
    };

    const inputClass = "w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors text-sm";
    const labelClass = "block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                            <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                            {log ? 'Edit Service Log' : 'Log New Service'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Vehicle selector */}
                    <div>
                        <label className={labelClass}>Vehicle</label>
                        <div className="relative">
                            <select
                                required
                                className={`${inputClass} appearance-none`}
                                value={form.vehicleId}
                                onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                            >
                                <option value="">— Select vehicle —</option>
                                {vehicles
                                    .filter((v) => v.status !== VehicleStatus.OUT_OF_SERVICE)
                                    .map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {v.nameModel} ({v.licensePlate}) {v.status === VehicleStatus.IN_SHOP ? '· Already In Shop' : ''}
                                        </option>
                                    ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* Auto-shop warning */}
                    {willSendToShop && (
                        <div className="flex items-start gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-400 text-xs">
                            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>
                                <strong>Auto-Logic Active:</strong> Saving this log will immediately set <strong>{selectedVehicle.nameModel}</strong> status to{' '}
                                <span className="font-mono bg-amber-500/20 px-1 rounded">IN SHOP</span> and remove it from the Dispatcher pool.
                            </span>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className={labelClass}>Service Description</label>
                        <textarea
                            required
                            rows={3}
                            className={`${inputClass} resize-none`}
                            placeholder="e.g. Full engine oil change, filter replacement, and inspection"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    {/* Cost + Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>
                                <IndianRupee className="w-3 h-3 inline mr-1 text-neutral-500" />
                                Cost (₹)
                            </label>
                            <input
                                required
                                type="number"
                                min={0}
                                className={inputClass}
                                placeholder="4500"
                                value={form.cost || ''}
                                onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>
                                <CalendarDays className="w-3 h-3 inline mr-1 text-neutral-500" />
                                Service Date
                            </label>
                            <input
                                required
                                type="date"
                                className={inputClass}
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium transition-colors">
                            Cancel
                        </button>
                        <button type="submit"
                            className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-sm font-semibold transition-colors">
                            {log ? 'Update Log' : 'Log Service'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MaintenancePage() {
    const { token } = useAuthStore();
    const { vehicles, maintenanceLogs, fetchVehicles, fetchMaintenanceLogs, deleteMaintenanceLog, releaseFromShop } = useFleetStore();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (token) {
            fetchVehicles(token);
            fetchMaintenanceLogs(token);
        }
    }, [token, fetchVehicles, fetchMaintenanceLogs]);
    const [editLog, setEditLog] = useState<MaintenanceLog | undefined>(undefined);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filterVehicle, setFilterVehicle] = useState('ALL');

    const inShopVehicles = vehicles.filter((v) => v.status === VehicleStatus.IN_SHOP);

    const filteredLogs = useMemo(() => {
        return maintenanceLogs.filter((log) => {
            const vehicle = vehicles.find((v) => v.id === log.vehicleId);
            const matchSearch =
                log.description.toLowerCase().includes(search.toLowerCase()) ||
                (vehicle?.nameModel ?? '').toLowerCase().includes(search.toLowerCase()) ||
                (vehicle?.licensePlate ?? '').toLowerCase().includes(search.toLowerCase());
            const matchVehicle = filterVehicle === 'ALL' || log.vehicleId === filterVehicle;
            return matchSearch && matchVehicle;
        });
    }, [maintenanceLogs, vehicles, search, filterVehicle]);

    // Per-vehicle totals
    const vehicleTotals = useMemo(() => {
        const totals: Record<string, number> = {};
        maintenanceLogs.forEach((log) => {
            totals[log.vehicleId] = (totals[log.vehicleId] ?? 0) + log.cost;
        });
        return totals;
    }, [maintenanceLogs]);

    const grandTotal = maintenanceLogs.reduce((s, l) => s + l.cost, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Maintenance & Service Logs</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">Preventative and reactive vehicle health tracking.</p>
                </div>
                <button
                    onClick={() => { setEditLog(undefined); setShowModal(true); }}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] shrink-0"
                >
                    <Plus className="w-4 h-4" /> Log Service
                </button>
            </div>

            {/* In-Shop Banner */}
            {inShopVehicles.length > 0 && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-amber-400">
                        <Wrench className="w-4 h-4" />
                        <span className="text-sm font-semibold">{inShopVehicles.length} vehicle{inShopVehicles.length > 1 ? 's' : ''} currently In Service Shop</span>
                        <span className="text-xs text-amber-500/70 ml-1">— hidden from Dispatcher</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {inShopVehicles.map((v) => (
                            <div key={v.id} className="flex items-center gap-3 bg-white dark:bg-neutral-900 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-2.5 shadow-sm dark:shadow-none">
                                <div>
                                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{v.nameModel}</p>
                                    <p className="text-xs text-neutral-500">{v.licensePlate}</p>
                                </div>
                                <button
                                    onClick={() => { if (token) releaseFromShop(token, v.id); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-lg text-xs font-medium hover:bg-emerald-50/20 transition-colors"
                                    title="Mark service as done and return to Available"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Release
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-1 shadow-sm dark:shadow-none">
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 uppercase tracking-wider font-semibold">Total Logs</p>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">{maintenanceLogs.length}</p>
                    <p className="text-xs text-neutral-500">across {Object.keys(vehicleTotals).length} vehicles</p>
                </div>
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-1 shadow-sm dark:shadow-none">
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 uppercase tracking-wider font-semibold">Total Maintenance Cost</p>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(grandTotal)}</p>
                    <p className="text-xs text-neutral-500">lifetime spending</p>
                </div>
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-1 shadow-sm dark:shadow-none">
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 uppercase tracking-wider font-semibold">Vehicles In Shop</p>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">{inShopVehicles.length}</p>
                    <p className="text-xs text-neutral-500">removed from dispatch pool</p>
                </div>
            </div>

            {/* Auto-logic info banner */}
            <div className="flex items-start gap-3 px-4 py-3 bg-blue-500/5 border border-blue-500/15 rounded-xl text-blue-400/80 text-xs">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                    <strong>Auto-Logic:</strong> Logging a service entry for any vehicle immediately changes its status to <span className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1 rounded">IN SHOP</span>, hiding it from the Trip Dispatcher selection pool. Click <strong>Release</strong> once servicing is complete to restore availability.
                </span>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm transition-colors"
                        placeholder="Search by description or vehicle…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <select
                        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 pr-9 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none cursor-pointer"
                        value={filterVehicle}
                        onChange={(e) => setFilterVehicle(e.target.value)}
                    >
                        <option value="ALL">All Vehicles</option>
                        {vehicles.map((v) => (
                            <option key={v.id} value={v.id}>{v.nameModel} ({v.licensePlate})</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500">
                                <th className="text-left px-6 py-3.5 font-semibold uppercase text-xs tracking-wider">Vehicle</th>
                                <th className="text-left px-6 py-3.5 font-semibold uppercase text-xs tracking-wider">Description</th>
                                <th className="text-left px-6 py-3.5 font-semibold uppercase text-xs tracking-wider">Date</th>
                                <th className="text-left px-6 py-3.5 font-semibold uppercase text-xs tracking-wider">Cost</th>
                                <th className="text-left px-6 py-3.5 font-semibold uppercase text-xs tracking-wider">Vehicle State</th>
                                <th className="text-right px-6 py-3.5 font-semibold uppercase text-xs tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60">
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-16">
                                        <Wrench className="w-8 h-8 mx-auto mb-3 text-neutral-400 dark:text-neutral-700" />
                                        <p className="text-neutral-500 dark:text-neutral-500">No service logs found.</p>
                                        <button
                                            onClick={() => setShowModal(true)}
                                            className="mt-3 text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1 mx-auto transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Log a service
                                        </button>
                                    </td>
                                </tr>
                            )}
                            {filteredLogs.map((log) => {
                                const vehicle = vehicles.find((v) => v.id === log.vehicleId);
                                return (
                                    <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-neutral-900 dark:text-white">{vehicle?.nameModel ?? '—'}</p>
                                                <p className="text-xs text-neutral-500 font-mono mt-0.5">{vehicle?.licensePlate}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="text-neutral-600 dark:text-neutral-200 line-clamp-2">{log.description}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                                                <CalendarDays className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-600" />
                                                {formatDate(log.date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(log.cost)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {vehicle?.status === VehicleStatus.IN_SHOP ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-amber-500/10 text-amber-400 border-amber-500/25">
                                                    <Wrench className="w-3 h-3" /> In Shop
                                                </span>
                                            ) : vehicle?.status === VehicleStatus.AVAILABLE ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/25">
                                                    <CheckCircle2 className="w-3 h-3" /> Available
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-neutral-700/40 text-neutral-400 border-neutral-700">
                                                    {vehicle?.status?.replace('_', ' ') ?? '—'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setEditLog(log); setShowModal(true); }}
                                                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(log.id)}
                                                    className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        {/* Footer with total */}
                        {filteredLogs.length > 0 && (
                            <tfoot>
                                <tr className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40">
                                    <td colSpan={3} className="px-6 py-3 text-xs text-neutral-500">
                                        Showing {filteredLogs.length} of {maintenanceLogs.length} logs
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="text-sm font-bold text-amber-400">
                                            {formatCurrency(filteredLogs.reduce((s, l) => s + l.cost, 0))}
                                        </span>
                                        <span className="text-xs text-neutral-500 ml-1">total</span>
                                    </td>
                                    <td colSpan={2} />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {/* Per-vehicle cost breakdown */}
            {Object.keys(vehicleTotals).length > 0 && (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm dark:shadow-none">
                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        Cost Breakdown by Vehicle
                    </h2>
                    <div className="space-y-3">
                        {Object.entries(vehicleTotals)
                            .sort(([, a], [, b]) => b - a)
                            .map(([vehicleId, total]) => {
                                const vehicle = vehicles.find((v) => v.id === vehicleId);
                                const pct = grandTotal > 0 ? (total / grandTotal) * 100 : 0;
                                return (
                                    <div key={vehicleId}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-neutral-600 dark:text-neutral-300">{vehicle?.nameModel ?? vehicleId}</span>
                                            <span className="font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(total)}</span>
                                        </div>
                                        <div className="h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-500 rounded-full transition-all"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* Delete confirm */}
            {deletingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10"><AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" /></div>
                            <h3 className="font-semibold text-neutral-900 dark:text-white">Delete Log Entry?</h3>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">This will permanently remove the service record. The vehicle&apos;s current status will not be changed.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeletingId(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium transition-colors">Cancel</button>
                            <button onClick={() => { if (token && deletingId) deleteMaintenanceLog(token, deletingId); setDeletingId(null); }}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-sm font-semibold transition-colors">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Log Modal */}
            {showModal && (
                <LogModal
                    log={editLog}
                    onClose={() => { setShowModal(false); setEditLog(undefined); }}
                />
            )}
        </div>
    );
}
