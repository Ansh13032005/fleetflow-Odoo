'use client';

import { useState, useMemo } from 'react';
import { useFleetStore } from '@/store/useFleetStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ExpenseLog, TripStatus } from '@/types';
import {
    Fuel, Plus, X, Trash2, Pencil, Search, ChevronDown,
    AlertTriangle, CalendarDays, IndianRupee, Droplets,
    TrendingUp, Car, FileText, Info
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}
function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function round2(n: number) { return Math.round(n * 100) / 100; }

// ─── Log Modal ────────────────────────────────────────────────────────────────
const emptyForm = {
    vehicleId: '',
    tripId: '',
    fuelLiters: 0,
    fuelCost: 0,
    distanceKm: 0,
    date: new Date().toISOString().split('T')[0],
    notes: '',
};

function ExpenseModal({ log, onClose }: { log?: ExpenseLog; onClose: () => void }) {
    const { token } = useAuthStore();
    const { vehicles, trips, addExpenseLog, updateExpenseLog } = useFleetStore();
    const completedTrips = trips.filter((t) => t.status === TripStatus.COMPLETED);

    const [form, setForm] = useState(
        log
            ? { vehicleId: log.vehicleId, tripId: log.tripId ?? '', fuelLiters: log.fuelLiters, fuelCost: log.fuelCost, distanceKm: log.distanceKm ?? 0, date: log.date, notes: log.notes ?? '' }
            : emptyForm
    );

    const pricePerLiter = form.fuelLiters > 0 ? round2(form.fuelCost / form.fuelLiters) : 0;
    const kmPerLiter = form.fuelLiters > 0 && form.distanceKm > 0 ? round2(form.distanceKm / form.fuelLiters) : 0;
    const costPerKm = form.distanceKm > 0 ? round2(form.fuelCost / form.distanceKm) : 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            vehicleId: form.vehicleId,
            tripId: form.tripId || undefined,
            fuelLiters: form.fuelLiters,
            fuelCost: form.fuelCost,
            distanceKm: form.distanceKm || undefined,
            date: form.date,
            notes: form.notes || undefined,
        };
        if (!token) return;
        if (log) { updateExpenseLog(token, log.id, payload); }
        else { addExpenseLog(token, payload); }
        onClose();
    };

    const inputClass = "w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors text-sm";
    const labelClass = "block text-xs font-medium text-neutral-400 mb-1.5";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-xl shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                            <Fuel className="w-4 h-4 text-blue-400" />
                        </div>
                        <h2 className="text-base font-semibold text-neutral-900 dark:text-white">{log ? 'Edit Expense Log' : 'Record Fuel & Expense'}</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Vehicle */}
                        <div className="col-span-2">
                            <label className={labelClass}>Vehicle</label>
                            <div className="relative">
                                <select required className={`${inputClass} appearance-none`}
                                    value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
                                    <option value="">— Select vehicle —</option>
                                    {vehicles.map((v) => <option key={v.id} value={v.id}>{v.nameModel} ({v.licensePlate})</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* Link to Trip (optional) */}
                        <div className="col-span-2">
                            <label className={labelClass}>Link to Completed Trip <span className="text-neutral-600">(optional)</span></label>
                            <div className="relative">
                                <select className={`${inputClass} appearance-none`}
                                    value={form.tripId} onChange={(e) => setForm({ ...form, tripId: e.target.value })}>
                                    <option value="">— No trip link —</option>
                                    {completedTrips.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.startLocation} → {t.endLocation} ({t.id})
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* Fuel Liters */}
                        <div>
                            <label className={labelClass}><Droplets className="w-3 h-3 inline mr-1 text-neutral-500" />Fuel Filled (Litres)</label>
                            <input required type="number" min={0.1} step={0.1} className={inputClass} placeholder="45"
                                value={form.fuelLiters || ''} onChange={(e) => setForm({ ...form, fuelLiters: parseFloat(e.target.value) || 0 })} />
                        </div>

                        {/* Fuel Cost */}
                        <div>
                            <label className={labelClass}><IndianRupee className="w-3 h-3 inline mr-1 text-neutral-500" />Total Fuel Cost (₹)</label>
                            <input required type="number" min={1} className={inputClass} placeholder="4725"
                                value={form.fuelCost || ''} onChange={(e) => setForm({ ...form, fuelCost: parseFloat(e.target.value) || 0 })} />
                        </div>

                        {/* Distance */}
                        <div>
                            <label className={labelClass}><Car className="w-3 h-3 inline mr-1 text-neutral-500" />Distance Covered (km) <span className="text-neutral-600">(optional)</span></label>
                            <input type="number" min={0} className={inputClass} placeholder="380"
                                value={form.distanceKm || ''} onChange={(e) => setForm({ ...form, distanceKm: parseFloat(e.target.value) || 0 })} />
                        </div>

                        {/* Date */}
                        <div>
                            <label className={labelClass}><CalendarDays className="w-3 h-3 inline mr-1 text-neutral-500" />Date</label>
                            <input required type="date" className={inputClass}
                                value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                        </div>

                        {/* Notes */}
                        <div className="col-span-2">
                            <label className={labelClass}><FileText className="w-3 h-3 inline mr-1 text-neutral-500" />Notes</label>
                            <input type="text" className={inputClass} placeholder="e.g. Highway run to Mysore"
                                value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                        </div>
                    </div>

                    {/* Live metrics preview */}
                    {(pricePerLiter > 0 || kmPerLiter > 0) && (
                        <div className="grid grid-cols-3 gap-3 p-3 bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                            <div className="text-center">
                                <p className="text-xs text-neutral-500 mb-0.5">₹/Litre</p>
                                <p className="text-sm font-bold text-blue-400">₹{pricePerLiter}</p>
                            </div>
                            <div className="text-center border-x border-neutral-200 dark:border-neutral-800">
                                <p className="text-xs text-neutral-500 mb-0.5">km/L Efficiency</p>
                                <p className={`text-sm font-bold ${kmPerLiter > 0 ? (kmPerLiter >= 12 ? 'text-emerald-400' : kmPerLiter >= 8 ? 'text-amber-400' : 'text-rose-400') : 'text-neutral-500'}`}>
                                    {kmPerLiter > 0 ? `${kmPerLiter} km/L` : '—'}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-neutral-500 mb-0.5">₹/km</p>
                                <p className="text-sm font-bold text-neutral-300">{costPerKm > 0 ? `₹${costPerKm}` : '—'}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-sm font-medium transition-colors">
                            Cancel
                        </button>
                        <button type="submit"
                            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold transition-colors">
                            {log ? 'Update Record' : 'Save Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ExpensesPage() {
    const { token } = useAuthStore();
    const { vehicles, expenseLogs, maintenanceLogs, deleteExpenseLog } = useFleetStore();
    const [showModal, setShowModal] = useState(false);
    const [editLog, setEditLog] = useState<ExpenseLog | undefined>(undefined);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filterVehicle, setFilterVehicle] = useState('ALL');

    // ── Computed Per-Vehicle Operational Cost ─────────────────────────────────
    const vehicleOperationalCosts = useMemo(() => {
        const result: Record<string, { fuelCost: number; maintenanceCost: number; totalLiters: number; totalKm: number }> = {};
        vehicles.forEach((v) => {
            result[v.id] = { fuelCost: 0, maintenanceCost: 0, totalLiters: 0, totalKm: 0 };
        });
        expenseLogs.forEach((l) => {
            if (result[l.vehicleId]) {
                result[l.vehicleId].fuelCost += l.fuelCost;
                result[l.vehicleId].totalLiters += l.fuelLiters;
                result[l.vehicleId].totalKm += l.distanceKm ?? 0;
            }
        });
        maintenanceLogs.forEach((l) => {
            if (result[l.vehicleId]) { result[l.vehicleId].maintenanceCost += l.cost; }
        });
        return result;
    }, [vehicles, expenseLogs, maintenanceLogs]);

    const grandFuelCost = expenseLogs.reduce((s, l) => s + l.fuelCost, 0);
    const grandFuelLiters = expenseLogs.reduce((s, l) => s + l.fuelLiters, 0);
    const grandTotalKm = expenseLogs.reduce((s, l) => s + (l.distanceKm ?? 0), 0);
    const fleetKmPerL = grandFuelLiters > 0 && grandTotalKm > 0 ? round2(grandTotalKm / grandFuelLiters) : null;

    // ── Filtered logs ─────────────────────────────────────────────────────────
    const filteredLogs = useMemo(() => {
        return expenseLogs.filter((log) => {
            const vehicle = vehicles.find((v) => v.id === log.vehicleId);
            const matchSearch =
                (log.notes ?? '').toLowerCase().includes(search.toLowerCase()) ||
                (vehicle?.nameModel ?? '').toLowerCase().includes(search.toLowerCase()) ||
                (vehicle?.licensePlate ?? '').toLowerCase().includes(search.toLowerCase());
            const matchVehicle = filterVehicle === 'ALL' || log.vehicleId === filterVehicle;
            return matchSearch && matchVehicle;
        });
    }, [expenseLogs, vehicles, search, filterVehicle]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Expense & Fuel Logs</h1>
                    <p className="text-neutral-400 text-sm mt-0.5">Financial tracking per asset — fuel, mileage, and operational cost.</p>
                </div>
                <button
                    onClick={() => { setEditLog(undefined); setShowModal(true); }}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] shrink-0"
                >
                    <Plus className="w-4 h-4" /> Record Fuel
                </button>
            </div>

            {/* Fleet KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Fuel Logs', value: expenseLogs.length, sub: 'all time', icon: Fuel, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Total Fuel Spend', value: formatCurrency(grandFuelCost), sub: `${round2(grandFuelLiters)} L filled`, icon: IndianRupee, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { label: 'Fleet km/L', value: fleetKmPerL ? `${fleetKmPerL} km/L` : '—', sub: `${grandTotalKm.toLocaleString()} km tracked`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Total Operational', value: formatCurrency(grandFuelCost + maintenanceLogs.reduce((s, l) => s + l.cost, 0)), sub: 'fuel + maintenance', icon: Car, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                ].map((kpi) => (
                    <div key={kpi.label} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-3 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-sm dark:shadow-none">
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">{kpi.label}</p>
                            <div className={`p-2 rounded-xl ${kpi.bg}`}><kpi.icon className={`w-4 h-4 ${kpi.color}`} /></div>
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                            <p className="text-xs text-neutral-500 mt-0.5">{kpi.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Per-vehicle Total Operational Cost table */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                    <IndianRupee className="w-4 h-4 text-purple-400" />
                    <h2 className="text-sm font-semibold text-white">Total Operational Cost per Vehicle</h2>
                    <span className="ml-auto text-xs text-neutral-500 flex items-center gap-1">
                        <Info className="w-3 h-3" /> Fuel + Maintenance
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500">
                                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider">Vehicle</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider">Fuel Cost</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider">Maintenance</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider">Total</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider">km/L</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/60">
                            {vehicles.map((v) => {
                                const oc = vehicleOperationalCosts[v.id] ?? { fuelCost: 0, maintenanceCost: 0, totalLiters: 0, totalKm: 0 };
                                const total = oc.fuelCost + oc.maintenanceCost;
                                const kml = oc.totalLiters > 0 && oc.totalKm > 0 ? round2(oc.totalKm / oc.totalLiters) : null;
                                return (
                                    <tr key={v.id} className="hover:bg-neutral-800/30 transition-colors">
                                        <td className="px-6 py-3.5">
                                            <p className="font-medium text-white">{v.nameModel}</p>
                                            <p className="text-xs text-neutral-500 font-mono">{v.licensePlate}</p>
                                        </td>
                                        <td className="px-6 py-3.5 text-right text-neutral-300">{formatCurrency(oc.fuelCost)}</td>
                                        <td className="px-6 py-3.5 text-right text-neutral-300">{formatCurrency(oc.maintenanceCost)}</td>
                                        <td className="px-6 py-3.5 text-right">
                                            <span className={`font-bold ${total > 0 ? 'text-purple-400' : 'text-neutral-600'}`}>
                                                {formatCurrency(total)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            {kml !== null ? (
                                                <span className={`font-semibold ${kml >= 12 ? 'text-emerald-400' : kml >= 8 ? 'text-amber-400' : 'text-rose-400'}`}>
                                                    {kml} km/L
                                                </span>
                                            ) : (
                                                <span className="text-neutral-600">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40">
                                <td className="px-6 py-3 font-semibold text-neutral-300">Fleet Total</td>
                                <td className="px-6 py-3 text-right font-semibold text-neutral-300">{formatCurrency(grandFuelCost)}</td>
                                <td className="px-6 py-3 text-right font-semibold text-neutral-300">{formatCurrency(maintenanceLogs.reduce((s, l) => s + l.cost, 0))}</td>
                                <td className="px-6 py-3 text-right font-bold text-purple-400">{formatCurrency(grandFuelCost + maintenanceLogs.reduce((s, l) => s + l.cost, 0))}</td>
                                <td className="px-6 py-3 text-right font-bold text-emerald-400">{fleetKmPerL ? `${fleetKmPerL} km/L` : '—'}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Fuel Log Records */}
            <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                            placeholder="Search by notes or vehicle…" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <div className="relative">
                        <select className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 pr-9 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                            value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)}>
                            <option value="ALL">All Vehicles</option>
                            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.nameModel}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500">
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Vehicle</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Date</th>
                                    <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Litres</th>
                                    <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Fuel Cost</th>
                                    <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Distance</th>
                                    <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">km/L</th>
                                    <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Notes</th>
                                    <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/60">
                                {filteredLogs.length === 0 && (
                                    <tr><td colSpan={8} className="text-center py-14">
                                        <Fuel className="w-8 h-8 mx-auto mb-3 text-neutral-700" />
                                        <p className="text-neutral-500">No fuel records found.</p>
                                    </td></tr>
                                )}
                                {filteredLogs.map((log) => {
                                    const vehicle = vehicles.find((v) => v.id === log.vehicleId);
                                    const kml = log.fuelLiters > 0 && log.distanceKm ? round2(log.distanceKm / log.fuelLiters) : null;
                                    return (
                                        <tr key={log.id} className="hover:bg-neutral-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-white">{vehicle?.nameModel ?? '—'}</p>
                                                <p className="text-xs font-mono text-neutral-500">{vehicle?.licensePlate}</p>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-300 whitespace-nowrap">{formatDate(log.date)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-blue-400 font-semibold">{log.fuelLiters} L</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-amber-400 font-semibold">{formatCurrency(log.fuelCost)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-neutral-300">
                                                {log.distanceKm ? `${log.distanceKm} km` : <span className="text-neutral-600">—</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {kml !== null ? (
                                                    <span className={`font-semibold ${kml >= 12 ? 'text-emerald-400' : kml >= 8 ? 'text-amber-400' : 'text-rose-400'}`}>
                                                        {kml}
                                                    </span>
                                                ) : <span className="text-neutral-600">—</span>}
                                            </td>
                                            <td className="px-6 py-4 text-neutral-400 max-w-[180px] truncate">{log.notes ?? '—'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => { setEditLog(log); setShowModal(true); }}
                                                        className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setDeletingId(log.id)}
                                                        className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            {filteredLogs.length > 0 && (
                                <tfoot>
                                    <tr className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40">
                                        <td colSpan={2} className="px-6 py-3 text-xs text-neutral-500">{filteredLogs.length} records</td>
                                        <td className="px-6 py-3 text-right font-bold text-blue-400">{round2(filteredLogs.reduce((s, l) => s + l.fuelLiters, 0))} L</td>
                                        <td className="px-6 py-3 text-right font-bold text-amber-400">{formatCurrency(filteredLogs.reduce((s, l) => s + l.fuelCost, 0))}</td>
                                        <td colSpan={4} />
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>

            {/* Delete Confirm */}
            {deletingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-rose-500/10"><AlertTriangle className="w-5 h-5 text-rose-400" /></div>
                            <h3 className="font-semibold text-white">Delete Expense Record?</h3>
                        </div>
                        <p className="text-sm text-neutral-400">This will remove the fuel entry. Operational cost totals will update automatically.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeletingId(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-sm font-medium transition-colors">Cancel</button>
                            <button onClick={() => { if (token && deletingId) deleteExpenseLog(token, deletingId); setDeletingId(null); }} className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-sm font-semibold transition-colors">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Log Modal */}
            {showModal && <ExpenseModal log={editLog} onClose={() => { setShowModal(false); setEditLog(undefined); }} />}
        </div>
    );
}
