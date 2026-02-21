'use client';

import { useState, useMemo } from 'react';
import { useFleetStore } from '@/store/useFleetStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ExpenseLog, TripStatus } from '@/types';
import {
    Fuel, Plus, X, Search, ChevronDown, Trash2, Pencil,
    IndianRupee, CarFront, CalendarDays, Droplets, AlertTriangle
} from 'lucide-react';

function fmt(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }
function r2(n: number) { return Math.round(n * 100) / 100; }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }

function ExpenseModal({ log, onClose }: { log?: ExpenseLog; onClose: () => void }) {
    const { token } = useAuthStore();
    const { vehicles, trips, addExpenseLog, updateExpenseLog } = useFleetStore();
    const completedTrips = trips.filter((t) => t.status === TripStatus.COMPLETED);
    const [form, setForm] = useState(log
        ? { vehicleId: log.vehicleId, tripId: log.tripId ?? '', fuelLiters: log.fuelLiters, fuelCost: log.fuelCost, distanceKm: log.distanceKm ?? 0, date: log.date, notes: log.notes ?? '' }
        : { vehicleId: '', tripId: '', fuelLiters: 0, fuelCost: 0, distanceKm: 0, date: new Date().toISOString().split('T')[0], notes: '' }
    );
    const pricePerL = form.fuelLiters > 0 ? r2(form.fuelCost / form.fuelLiters) : 0;
    const kmPerL = form.fuelLiters > 0 && form.distanceKm > 0 ? r2(form.distanceKm / form.fuelLiters) : 0;
    const inp = "w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm transition-colors";
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        const payload = { vehicleId: form.vehicleId, tripId: form.tripId || undefined, fuelLiters: form.fuelLiters, fuelCost: form.fuelCost, distanceKm: form.distanceKm || undefined, date: form.date, notes: form.notes || undefined };
        if (log) updateExpenseLog(token, log.id, payload); else addExpenseLog(token, payload);
        onClose();
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-purple-50 dark:bg-purple-500/10 rounded-lg"><Fuel className="w-4 h-4 text-purple-600 dark:text-purple-400" /></div>
                        <h2 className="text-base font-semibold text-neutral-900 dark:text-white">{log ? 'Edit Expense' : 'Record Fuel Expense'}</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Vehicle</label>
                        <div className="relative">
                            <select required className={`${inp} appearance-none`} value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
                                <option value="">— Select vehicle —</option>
                                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.nameModel} ({v.licensePlate})</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Link to Completed Trip <span className="text-neutral-500 dark:text-neutral-600">(optional)</span></label>
                        <div className="relative">
                            <select className={`${inp} appearance-none`} value={form.tripId} onChange={(e) => setForm({ ...form, tripId: e.target.value })}>
                                <option value="">— No trip link —</option>
                                {completedTrips.map((t) => <option key={t.id} value={t.id}>{t.startLocation} → {t.endLocation}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-1.5"><Droplets className="w-3 h-3 inline mr-1" />Litres Filled</label>
                            <input required type="number" min={0.1} step={0.1} className={inp} placeholder="45" value={form.fuelLiters || ''} onChange={(e) => setForm({ ...form, fuelLiters: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-1.5"><IndianRupee className="w-3 h-3 inline mr-1" />Total Cost (₹)</label>
                            <input required type="number" min={1} className={inp} placeholder="4725" value={form.fuelCost || ''} onChange={(e) => setForm({ ...form, fuelCost: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-1.5"><CarFront className="w-3 h-3 inline mr-1" />Distance (km)</label>
                            <input type="number" min={0} className={inp} placeholder="380" value={form.distanceKm || ''} onChange={(e) => setForm({ ...form, distanceKm: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-neutral-400 mb-1.5"><CalendarDays className="w-3 h-3 inline mr-1" />Date</label>
                            <input required type="date" className={inp} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-neutral-400 mb-1.5">Notes</label>
                        <input type="text" className={inp} placeholder="Optional note" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                    </div>
                    {(pricePerL > 0 || kmPerL > 0) && (
                        <div className="grid grid-cols-3 gap-3 p-3 bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 rounded-xl text-center">
                            <div><p className="text-xs text-neutral-500 mb-0.5">₹/Litre</p><p className="text-sm font-bold text-purple-400">₹{pricePerL}</p></div>
                            <div className="border-x border-neutral-800"><p className="text-xs text-neutral-500 mb-0.5">km/L</p><p className={`text-sm font-bold ${kmPerL >= 12 ? 'text-emerald-400' : kmPerL >= 8 ? 'text-amber-400' : 'text-rose-400'}`}>{kmPerL > 0 ? kmPerL : '—'}</p></div>
                            <div><p className="text-xs text-neutral-500 mb-0.5">₹/km</p><p className="text-sm font-bold text-neutral-300">{form.distanceKm > 0 ? `₹${r2(form.fuelCost / form.distanceKm)}` : '—'}</p></div>
                        </div>
                    )}
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white text-sm font-semibold transition-colors">Save Record</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function FinanceExpensesPage() {
    const { token } = useAuthStore();
    const { vehicles, expenseLogs, deleteExpenseLog } = useFleetStore();
    const [showModal, setShowModal] = useState(false);
    const [editLog, setEditLog] = useState<ExpenseLog | undefined>();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [filterVehicle, setFilterVehicle] = useState('ALL');

    const filtered = useMemo(() => expenseLogs.filter((l) => {
        const v = vehicles.find((v) => v.id === l.vehicleId);
        const matchSearch = (l.notes ?? '').toLowerCase().includes(search.toLowerCase()) || (v?.nameModel ?? '').toLowerCase().includes(search.toLowerCase());
        return matchSearch && (filterVehicle === 'ALL' || l.vehicleId === filterVehicle);
    }), [expenseLogs, vehicles, search, filterVehicle]);

    const totalFuel = filtered.reduce((s, l) => s + l.fuelCost, 0);
    const totalLitres = filtered.reduce((s, l) => s + l.fuelLiters, 0);
    const totalKm = filtered.reduce((s, l) => s + (l.distanceKm ?? 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Fuel Expense Ledger</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">Record and audit all fleet fuel expenditures.</p>
                </div>
                <button onClick={() => { setEditLog(undefined); setShowModal(true); }}
                    className="flex items-center gap-2 bg-purple-500 hover:bg-purple-400 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-[0_0_15px_rgba(168,85,247,0.2)] shrink-0">
                    <Plus className="w-4 h-4" /> Record Expense
                </button>
            </div>

            {/* Summary KPIs */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm dark:shadow-none">
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 uppercase font-semibold tracking-wider mb-2">Total Fuel Spend</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{fmt(totalFuel)}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">{r2(totalLitres)} litres filled</p>
                </div>
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm dark:shadow-none">
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 uppercase font-semibold tracking-wider mb-2">Fleet km/L</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalLitres > 0 && totalKm > 0 ? `${r2(totalKm / totalLitres)} km/L` : '—'}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">{totalKm.toLocaleString()} km tracked</p>
                </div>
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm dark:shadow-none">
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 uppercase font-semibold tracking-wider mb-2">Records</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{filtered.length}</p>
                    <p className="text-xs text-neutral-500 mt-1">of {expenseLogs.length} total</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                        placeholder="Search notes or vehicle…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="relative">
                    <select className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 pr-9 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 appearance-none cursor-pointer"
                        value={filterVehicle} onChange={(e) => setFilterVehicle(e.target.value)}>
                        <option value="ALL">All Vehicles</option>
                        {vehicles.map((v) => <option key={v.id} value={v.id}>{v.nameModel}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500">
                                <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Vehicle</th>
                                <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Date</th>
                                <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Litres</th>
                                <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Cost</th>
                                <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Dist.</th>
                                <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">km/L</th>
                                <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Notes</th>
                                <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60">
                            {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-14 text-neutral-600 dark:text-neutral-500"><Fuel className="w-8 h-8 mx-auto mb-3 opacity-40" />No records found.</td></tr>}
                            {filtered.map((log) => {
                                const v = vehicles.find((v) => v.id === log.vehicleId);
                                const kml = log.distanceKm && log.fuelLiters ? r2(log.distanceKm / log.fuelLiters) : null;
                                return (
                                    <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors group">
                                        <td className="px-6 py-4"><p className="font-medium text-neutral-900 dark:text-white">{v?.nameModel ?? '—'}</p><p className="text-xs font-mono text-neutral-500 dark:text-neutral-500">{v?.licensePlate}</p></td>
                                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300 whitespace-nowrap">{fmtDate(log.date)}</td>
                                        <td className="px-6 py-4 text-right text-blue-600 dark:text-blue-400 font-semibold">{log.fuelLiters} L</td>
                                        <td className="px-6 py-4 text-right text-amber-600 dark:text-amber-400 font-semibold">{fmt(log.fuelCost)}</td>
                                        <td className="px-6 py-4 text-right text-neutral-600 dark:text-neutral-300">{log.distanceKm ? `${log.distanceKm} km` : <span className="text-neutral-500 dark:text-neutral-600">—</span>}</td>
                                        <td className="px-6 py-4 text-right">
                                            {kml !== null ? <span className={`font-semibold ${kml >= 12 ? 'text-emerald-600 dark:text-emerald-400' : kml >= 8 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>{kml}</span> : <span className="text-neutral-500 dark:text-neutral-600">—</span>}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400 max-w-[160px] truncate">{log.notes ?? '—'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => { setEditLog(log); setShowModal(true); }} className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"><Pencil className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => setDeletingId(log.id)} className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        {filtered.length > 0 && (
                            <tfoot>
                                <tr className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40">
                                    <td colSpan={2} className="px-6 py-3 text-xs text-neutral-500 dark:text-neutral-500">{filtered.length} records</td>
                                    <td className="px-6 py-3 text-right font-bold text-blue-600 dark:text-blue-400">{r2(totalLitres)} L</td>
                                    <td className="px-6 py-3 text-right font-bold text-amber-600 dark:text-amber-400">{fmt(totalFuel)}</td>
                                    <td colSpan={4} />
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {/* Delete confirm */}
            {deletingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
                        <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10"><AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" /></div><h3 className="font-semibold text-neutral-900 dark:text-white">Delete Expense?</h3></div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">This removes the fuel record permanently. Cost totals update automatically.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeletingId(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium">Cancel</button>
                            <button onClick={() => { if (token && deletingId) deleteExpenseLog(token, deletingId); setDeletingId(null); }} className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-sm font-semibold">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {showModal && <ExpenseModal log={editLog} onClose={() => { setShowModal(false); setEditLog(undefined); }} />}
        </div>
    );
}
