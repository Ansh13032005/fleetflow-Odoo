'use client';

import { useFleetStore } from '@/store/useFleetStore';
import { TripStatus, VehicleStatus } from '@/types';
import { BarChart3, TrendingUp, Fuel, Wrench, Truck, ArrowUpRight, ArrowDownRight, IndianRupee, Download, FileDown } from 'lucide-react';
import { exportCSV, exportPDF } from '@/lib/export';

function fmt(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }
function r2(n: number) { return Math.round(n * 100) / 100; }

function HBar({ value, max, color = 'bg-purple-500' }: { value: number; max: number; color?: string }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden flex-1"><div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} /></div>;
}

export default function FinanceAnalyticsPage() {
    const { vehicles, trips, expenseLogs, maintenanceLogs } = useFleetStore();

    const totalFuel = expenseLogs.reduce((s, l) => s + l.fuelCost, 0);
    const totalMaint = maintenanceLogs.reduce((s, l) => s + l.cost, 0);
    const totalOp = totalFuel + totalMaint;
    const totalLitres = expenseLogs.reduce((s, l) => s + l.fuelLiters, 0);
    const totalKm = expenseLogs.reduce((s, l) => s + (l.distanceKm ?? 0), 0);
    const fleetKmL = totalLitres > 0 && totalKm > 0 ? r2(totalKm / totalLitres) : null;
    const pricePerL = totalLitres > 0 ? r2(totalFuel / totalLitres) : null;

    const completedTrips = trips.filter((t) => t.status === TripStatus.COMPLETED).length;
    const activeVehicles = vehicles.filter((v) => v.status !== VehicleStatus.OUT_OF_SERVICE).length;
    const utilization = activeVehicles > 0 ? r2((vehicles.filter((v) => v.status === VehicleStatus.ON_TRIP).length / activeVehicles) * 100) : 0;

    const vehicleStats = vehicles.map((v) => {
        const fuel = expenseLogs.filter((l) => l.vehicleId === v.id).reduce((s, l) => s + l.fuelCost, 0);
        const maint = maintenanceLogs.filter((l) => l.vehicleId === v.id).reduce((s, l) => s + l.cost, 0);
        const litres = expenseLogs.filter((l) => l.vehicleId === v.id).reduce((s, l) => s + l.fuelLiters, 0);
        const km = expenseLogs.filter((l) => l.vehicleId === v.id).reduce((s, l) => s + (l.distanceKm ?? 0), 0);
        const kml = litres > 0 && km > 0 ? r2(km / litres) : null;
        const tripsComp = trips.filter((t) => t.vehicleId === v.id && t.status === TripStatus.COMPLETED).length;
        return { ...v, fuel, maint, total: fuel + maint, litres, km, kml, tripsComp };
    }).sort((a, b) => b.total - a.total);

    const maxCost = vehicleStats[0]?.total ?? 1;

    const exportHeaders = ['Vehicle', 'Plate', 'Fuel (INR)', 'Maint (INR)', 'Total (INR)', 'Litres', 'Distance (km)', 'km/L', 'Trips Done'];
    const exportRows = vehicleStats.map((v) => ({
        Vehicle: v.nameModel,
        Plate: v.licensePlate,
        'Fuel (INR)': v.fuel,
        'Maint (INR)': v.maint,
        'Total (INR)': v.total,
        Litres: v.litres,
        'Distance (km)': v.km,
        'km/L': v.kml ?? '—',
        'Trips Done': v.tripsComp,
    }));
    const dateStr = new Date().toISOString().split('T')[0];
    const onExportCSV = () => exportCSV(exportRows, `fleetflow_finance_analytics_${dateStr}.csv`, exportHeaders);
    const onExportPDF = () => exportPDF('Financial Analytics — Per-Vehicle', exportHeaders, exportRows, `fleetflow_finance_analytics_${dateStr}`);

    // Cost distribution
    const fuelPct = totalOp > 0 ? r2((totalFuel / totalOp) * 100) : 0;
    const maintPct = totalOp > 0 ? r2((totalMaint / totalOp) * 100) : 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Financial Analytics</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">Deep-dive into fleet operational expenditure, efficiency, and cost distribution.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onExportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium transition-colors">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button onClick={onExportPDF} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium transition-colors">
                        <FileDown className="w-4 h-4" /> Export PDF
                    </button>
                </div>
            </div>

            {/* Top KPI row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                    { label: 'Total Op Cost', value: fmt(totalOp), color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', icon: IndianRupee, trend: false },
                    { label: 'Total Fuel Cost', value: fmt(totalFuel), color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', icon: Fuel, trend: false },
                    { label: 'Total Maint Cost', value: fmt(totalMaint), color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', icon: Wrench, trend: false },
                    { label: 'Fleet km/L', value: fleetKmL ? `${fleetKmL}` : '—', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', icon: TrendingUp, trend: true },
                    { label: '₹ per Litre', value: pricePerL ? `₹${pricePerL}` : '—', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10', icon: Fuel, trend: null },
                    { label: 'Fleet Utilization', value: `${utilization}%`, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', icon: Truck, trend: utilization > 50 },
                ].map((k) => (
                    <div key={k.label} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-sm dark:shadow-none">
                        <div className="flex items-center justify-between mb-2">
                            <div className={`p-1.5 rounded-lg ${k.bg}`}><k.icon className={`w-3.5 h-3.5 ${k.color}`} /></div>
                            {k.trend === true ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> : k.trend === false ? <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" /> : null}
                        </div>
                        <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-0.5 leading-tight">{k.label}</p>
                    </div>
                ))}
            </div>

            {/* Cost distribution + vehicle breakdown */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Cost Distribution Donut-chart-style */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-5 shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" /><h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Cost Distribution</h2></div>

                    {/* Stacked bar */}
                    <div className="h-5 flex rounded-full overflow-hidden">
                        <div className="bg-amber-500 transition-all" style={{ width: `${fuelPct}%` }} title={`Fuel ${fuelPct}%`} />
                        <div className="bg-blue-500 transition-all" style={{ width: `${maintPct}%` }} title={`Maintenance ${maintPct}%`} />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-500 shrink-0" /><span className="text-neutral-600 dark:text-neutral-300">Fuel</span></div>
                            <div className="text-right"><p className="font-bold text-amber-600 dark:text-amber-400">{fmt(totalFuel)}</p><p className="text-xs text-neutral-500 dark:text-neutral-500">{fuelPct}% of total</p></div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-500 shrink-0" /><span className="text-neutral-600 dark:text-neutral-300">Maintenance</span></div>
                            <div className="text-right"><p className="font-bold text-blue-600 dark:text-blue-400">{fmt(totalMaint)}</p><p className="text-xs text-neutral-500 dark:text-neutral-500">{maintPct}% of total</p></div>
                        </div>
                        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-400 font-medium">Grand Total</span>
                            <span className="font-bold text-purple-600 dark:text-purple-400">{fmt(totalOp)}</span>
                        </div>
                    </div>

                    {/* Additional metrics */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3 text-center border border-neutral-200 dark:border-neutral-800">
                            <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-1">Trips Done</p>
                            <p className="text-lg font-bold text-neutral-900 dark:text-white">{completedTrips}</p>
                        </div>
                        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3 text-center border border-neutral-200 dark:border-neutral-800">
                            <p className="text-xs text-neutral-500 dark:text-neutral-500 mb-1">Avg/Trip</p>
                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{completedTrips > 0 ? fmt(totalOp / completedTrips) : '—'}</p>
                        </div>
                    </div>
                </div>

                {/* Per-vehicle breakdown */}
                <div className="xl:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" /><h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Per-Vehicle Cost Analysis</h2></div>
                        <span className="text-xs text-neutral-500 dark:text-neutral-500">Sorted by total cost</span>
                    </div>
                    <div className="p-5 space-y-5">
                        {vehicleStats.map((v) => (
                            <div key={v.id}>
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <div>
                                        <p className="font-medium text-neutral-900 dark:text-white">{v.nameModel} <span className="text-xs font-mono text-neutral-500 dark:text-neutral-500 ml-2">{v.licensePlate}</span></p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-500">{v.tripsComp} trips completed · {v.kml ? `${v.kml} km/L efficiency` : 'no fuel data'}</p>
                                    </div>
                                    <div className="text-right shrink-0 ml-4">
                                        <p className="font-bold text-purple-600 dark:text-purple-400">{fmt(v.total)}</p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-500">{fmt(v.fuel)} + {fmt(v.maint)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-neutral-600 w-12 text-right shrink-0">Fuel</span>
                                    <HBar value={v.fuel} max={maxCost} color="bg-amber-500" />
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-neutral-600 w-12 text-right shrink-0">Maint</span>
                                    <HBar value={v.maint} max={maxCost} color="bg-blue-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Efficiency table */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                    <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Fuel Efficiency & Cost-per-km</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500">
                                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider">Vehicle</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider">Litres</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider">Fuel Cost</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider">Distance</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider">km/L</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider">₹/km</th>
                                <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wider">Total Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60">
                            {vehicleStats.map((v) => {
                                const cpkm = v.km > 0 ? r2(v.fuel / v.km) : null;
                                return (
                                    <tr key={v.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                                        <td className="px-6 py-4"><p className="font-medium text-neutral-900 dark:text-white">{v.nameModel}</p><p className="text-xs font-mono text-neutral-500 dark:text-neutral-500">{v.licensePlate}</p></td>
                                        <td className="px-6 py-4 text-right text-neutral-600 dark:text-neutral-300">{v.litres > 0 ? `${v.litres} L` : <span className="text-neutral-500 dark:text-neutral-600">—</span>}</td>
                                        <td className="px-6 py-4 text-right text-amber-600 dark:text-amber-400 font-medium">{v.fuel > 0 ? fmt(v.fuel) : <span className="text-neutral-500 dark:text-neutral-600">—</span>}</td>
                                        <td className="px-6 py-4 text-right text-neutral-600 dark:text-neutral-300">{v.km > 0 ? `${v.km.toLocaleString()} km` : <span className="text-neutral-500 dark:text-neutral-600">—</span>}</td>
                                        <td className="px-6 py-4 text-right">
                                            {v.kml !== null ? <span className={`font-bold ${v.kml >= 12 ? 'text-emerald-600 dark:text-emerald-400' : v.kml >= 8 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>{v.kml}</span> : <span className="text-neutral-500 dark:text-neutral-600">—</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right text-neutral-600 dark:text-neutral-300">{cpkm !== null ? `₹${cpkm}` : <span className="text-neutral-500 dark:text-neutral-600">—</span>}</td>
                                        <td className="px-6 py-4 text-right font-bold text-purple-600 dark:text-purple-400">{fmt(v.total)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40">
                                <td className="px-6 py-3 font-semibold text-neutral-700 dark:text-neutral-300">Fleet Total</td>
                                <td className="px-6 py-3 text-right font-bold text-neutral-700 dark:text-neutral-300">{r2(totalLitres)} L</td>
                                <td className="px-6 py-3 text-right font-bold text-amber-600 dark:text-amber-400">{fmt(totalFuel)}</td>
                                <td className="px-6 py-3 text-right font-bold text-neutral-700 dark:text-neutral-300">{totalKm.toLocaleString()} km</td>
                                <td className="px-6 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{fleetKmL ?? '—'}</td>
                                <td className="px-6 py-3 text-right font-bold text-neutral-700 dark:text-neutral-300">{totalKm > 0 ? `₹${r2(totalFuel / totalKm)}` : '—'}</td>
                                <td className="px-6 py-3 text-right font-bold text-purple-600 dark:text-purple-400">{fmt(totalOp)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
