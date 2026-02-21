'use client';

import { useMemo } from 'react';
import { useFleetStore } from '@/store/useFleetStore';
import { TripStatus, VehicleStatus, DriverStatus } from '@/types';
import {
    BarChart3, IndianRupee, Fuel, Truck, Users,
    Download, CheckCircle2, Zap, ArrowDownRight, ArrowUpRight, FileDown
} from 'lucide-react';
import { exportCSV, exportPDF } from '@/lib/export';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function round2(n: number) { return Math.round(n * 100) / 100; }
function formatCurrency(n: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

// ─── Mini Horizontal Bar ──────────────────────────────────────────────────────
function HBar({ value, max, color = 'bg-emerald-500' }: { value: number; max: number; color?: string }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden flex-1">
            <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
    const { vehicles, drivers, trips, expenseLogs, maintenanceLogs } = useFleetStore();

    // ── Fleet Overview ───────────────────────────────────────────────────────────
    const activeFleet = vehicles.filter((v) => v.status !== VehicleStatus.OUT_OF_SERVICE).length;
    const onTrip = vehicles.filter((v) => v.status === VehicleStatus.ON_TRIP).length;
    const utilization = activeFleet > 0 ? round2((onTrip / activeFleet) * 100) : 0;
    const completedTrips = trips.filter((t) => t.status === TripStatus.COMPLETED).length;
    const cancelledTrips = trips.filter((t) => t.status === TripStatus.CANCELLED).length;
    const totalTrips = trips.length;
    const tripCompletionRate = totalTrips > 0 ? round2((completedTrips / totalTrips) * 100) : 0;

    // ── Fuel Metrics ──────────────────────────────────────────────────────────────
    const totalFuelLiters = expenseLogs.reduce((s, l) => s + l.fuelLiters, 0);
    const totalFuelCost = expenseLogs.reduce((s, l) => s + l.fuelCost, 0);
    const totalKm = expenseLogs.reduce((s, l) => s + (l.distanceKm ?? 0), 0);
    const fleetKmPerL = totalFuelLiters > 0 && totalKm > 0 ? round2(totalKm / totalFuelLiters) : null;

    // ── Financial Metrics ─────────────────────────────────────────────────────────
    const totalMaintenance = maintenanceLogs.reduce((s, l) => s + l.cost, 0);
    const totalOpCost = totalFuelCost + totalMaintenance;

    // ── Per-Vehicle Analytics ─────────────────────────────────────────────────────
    const vehicleAnalytics = useMemo(() => {
        return vehicles.map((v) => {
            const vExpenses = expenseLogs.filter((l) => l.vehicleId === v.id);
            const vMaintenance = maintenanceLogs.filter((l) => l.vehicleId === v.id);
            const fuel = vExpenses.reduce((s, l) => s + l.fuelCost, 0);
            const maintenance = vMaintenance.reduce((s, l) => s + l.cost, 0);
            const litres = vExpenses.reduce((s, l) => s + l.fuelLiters, 0);
            const km = vExpenses.reduce((s, l) => s + (l.distanceKm ?? 0), 0);
            const kmPerL = litres > 0 && km > 0 ? round2(km / litres) : null;
            const tripsDone = trips.filter((t) => t.vehicleId === v.id && t.status === TripStatus.COMPLETED).length;
            return { ...v, fuel, maintenance, total: fuel + maintenance, litres, km, kmPerL, tripsDone };
        }).sort((a, b) => b.total - a.total);
    }, [vehicles, expenseLogs, maintenanceLogs, trips]);

    const maxOpCost = vehicleAnalytics[0]?.total ?? 1;

    // ── Driver Analytics ──────────────────────────────────────────────────────────
    const driverAnalytics = useMemo(() => {
        return drivers.map((d) => {
            const dTrips = trips.filter((t) => t.driverId === d.id);
            const completed = dTrips.filter((t) => t.status === TripStatus.COMPLETED).length;
            const rate = dTrips.length > 0 ? round2((completed / dTrips.length) * 100) : 0;
            const expired = new Date(d.licenseExpiry) < new Date();
            return { ...d, totalTrips: dTrips.length, completedTrips: completed, completionRate: rate, expired };
        }).sort((a, b) => b.completionRate - a.completionRate);
    }, [drivers, trips]);

    const vehicleHeaders = ['Vehicle', 'Plate', 'Status', 'Trips Completed', 'Fuel Cost (INR)', 'Maintenance Cost (INR)', 'Total Op Cost (INR)', 'km/L Efficiency', 'Odometer (km)'];
    const vehicleReportRows = vehicleAnalytics.map((v) => ({
        'Vehicle': v.nameModel,
        'Plate': v.licensePlate,
        'Status': v.status,
        'Trips Completed': v.tripsDone,
        'Fuel Cost (INR)': v.fuel,
        'Maintenance Cost (INR)': v.maintenance,
        'Total Op Cost (INR)': v.total,
        'km/L Efficiency': v.kmPerL ?? 'N/A',
        'Odometer (km)': v.odometer,
    }));
    const driverHeaders = ['Driver', 'Status', 'Safety Score', 'License Expiry', 'License Expired', 'Total Trips', 'Completed Trips', 'Completion Rate (%)'];
    const driverReportRows = driverAnalytics.map((d) => ({
        'Driver': `${d.firstName} ${d.lastName}`,
        'Status': d.status,
        'Safety Score': d.safetyScore,
        'License Expiry': d.licenseExpiry,
        'License Expired': d.expired ? 'YES' : 'NO',
        'Total Trips': d.totalTrips,
        'Completed Trips': d.completedTrips,
        'Completion Rate (%)': d.completionRate,
    }));
    const dateStr = new Date().toISOString().split('T')[0];

    const exportVehicleReport = () => {
        exportCSV(vehicleReportRows, `fleetflow_vehicles_${dateStr}.csv`, vehicleHeaders);
    };
    const exportVehiclePDF = () => {
        exportPDF('Vehicle Operational Report', vehicleHeaders, vehicleReportRows, `fleetflow_vehicles_${dateStr}`);
    };

    const exportDriverReport = () => {
        exportCSV(driverReportRows, `fleetflow_drivers_${dateStr}.csv`, driverHeaders);
    };
    const exportDriverPDF = () => {
        exportPDF('Driver Performance Report', driverHeaders, driverReportRows, `fleetflow_drivers_${dateStr}`);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Operational Analytics</h1>
                    <p className="text-neutral-400 text-sm mt-0.5">Data-driven insights for fleet performance and financial health.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={exportVehicleReport}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-sm font-medium transition-colors">
                        <Download className="w-4 h-4" /> Vehicle CSV
                    </button>
                    <button onClick={exportVehiclePDF}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-sm font-medium transition-colors">
                        <FileDown className="w-4 h-4" /> Vehicle PDF
                    </button>
                    <button onClick={exportDriverReport}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-sm font-medium transition-colors">
                        <Download className="w-4 h-4" /> Driver CSV
                    </button>
                    <button onClick={exportDriverPDF}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-sm font-medium transition-colors">
                        <FileDown className="w-4 h-4" /> Driver PDF
                    </button>
                </div>
            </div>

            {/* Top-level KPI grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                {[
                    { label: 'Fleet Utilization', value: `${utilization}%`, icon: Truck, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', trend: utilization > 50 },
                    { label: 'Trip Completion', value: `${tripCompletionRate}%`, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', trend: tripCompletionRate > 70 },
                    { label: 'Total Trips', value: totalTrips, icon: Zap, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10', trend: null },
                    { label: 'Fleet km/L', value: fleetKmPerL ? `${fleetKmPerL}` : '—', icon: Fuel, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10', trend: fleetKmPerL ? fleetKmPerL > 10 : null },
                    { label: 'Total Fuel Cost', value: formatCurrency(totalFuelCost), icon: IndianRupee, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', trend: false },
                    { label: 'Total Op Cost', value: formatCurrency(totalOpCost), icon: BarChart3, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', trend: false },
                ].map((kpi) => (
                    <div key={kpi.label} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-sm dark:shadow-none">
                        <div className="flex items-center justify-between mb-2">
                            <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                                <kpi.icon className={`w-3.5 h-3.5 ${kpi.color}`} />
                            </div>
                            {kpi.trend !== null && (
                                kpi.trend
                                    ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                                    : <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                            )}
                        </div>
                        <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
                        <p className="text-xs text-neutral-500 mt-0.5 leading-tight">{kpi.label}</p>
                    </div>
                ))}
            </div>

            {/* Two column section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Vehicle Operational Cost */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Vehicle Operational Cost</h2>
                        </div>
                        <span className="text-xs text-neutral-500">Fuel + Maintenance</span>
                    </div>
                    <div className="p-4 space-y-4">
                        {vehicleAnalytics.map((v) => (
                            <div key={v.id}>
                                <div className="flex items-center justify-between text-sm mb-1.5">
                                    <div className="min-w-0 flex-1 mr-4">
                                        <p className="font-medium text-neutral-900 dark:text-white truncate">{v.nameModel}</p>
                                        <p className="text-xs text-neutral-500">{v.tripsDone} trips · {v.kmPerL ? `${v.kmPerL} km/L` : 'no fuel data'}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-semibold text-neutral-700 dark:text-neutral-200">{formatCurrency(v.total)}</p>
                                        <p className="text-xs text-neutral-500">{formatCurrency(v.fuel)} fuel</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <HBar value={v.fuel} max={maxOpCost} color="bg-amber-500" />
                                    <HBar value={v.maintenance} max={maxOpCost} color="bg-blue-500" />
                                </div>
                            </div>
                        ))}
                        <div className="flex items-center gap-4 pt-2 text-xs text-neutral-500">
                            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-amber-500 rounded-full inline-block" />Fuel</span>
                            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-blue-500 rounded-full inline-block" />Maintenance</span>
                        </div>
                    </div>
                </div>

                {/* Fuel Efficiency */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center gap-2">
                            <Fuel className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Fuel Efficiency Ranking</h2>
                        </div>
                        <span className="text-xs text-neutral-500">km / Litre</span>
                    </div>
                    <div className="p-4 space-y-4">
                        {vehicleAnalytics
                            .filter((v) => v.kmPerL !== null)
                            .sort((a, b) => (b.kmPerL ?? 0) - (a.kmPerL ?? 0))
                            .map((v, i) => {
                                const kml = v.kmPerL!;
                                const color = kml >= 14 ? 'text-emerald-400 bg-emerald-500' : kml >= 10 ? 'text-amber-400 bg-amber-500' : 'text-rose-400 bg-rose-500';
                                const textColor = color.split(' ')[0];
                                const barColor = color.split(' ')[1];
                                return (
                                    <div key={v.id}>
                                        <div className="flex items-center justify-between text-sm mb-1.5">
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <span className="text-neutral-600 text-xs w-4 text-right shrink-0">#{i + 1}</span>
                                                <p className="font-medium text-neutral-900 dark:text-white truncate">{v.nameModel}</p>
                                            </div>
                                            <div className="text-right shrink-0 ml-4">
                                                <span className={`font-bold text-base ${textColor}`}>{kml}</span>
                                                <span className="text-neutral-500 text-xs"> km/L</span>
                                            </div>
                                        </div>
                                        <HBar value={kml} max={20} color={barColor} />
                                    </div>
                                );
                            })}
                        {vehicleAnalytics.filter((v) => v.kmPerL !== null).length === 0 && (
                            <div className="flex flex-col items-center py-8 text-neutral-600 dark:text-neutral-500">
                                <Fuel className="w-8 h-8 mb-2" />
                                <p className="text-sm">No fuel data recorded yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Driver Performance Table */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Driver Performance Report</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={exportDriverReport} className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                            <Download className="w-3.5 h-3.5" /> CSV
                        </button>
                        <button onClick={exportDriverPDF} className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                            <FileDown className="w-3.5 h-3.5" /> PDF
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500">
                                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider">Driver</th>
                                <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider">Safety</th>
                                <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider">Status</th>
                                <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider">Total Trips</th>
                                <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider">Completed</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider">Completion Rate</th>
                                <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider">License</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60">
                            {driverAnalytics.map((d) => (
                                <tr key={d.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-700 to-emerald-400 flex items-center justify-center text-neutral-950 text-xs font-bold shrink-0">
                                                {d.firstName[0]}{d.lastName[0]}
                                            </div>
                                            <span className="font-medium text-neutral-900 dark:text-white">{d.firstName} {d.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`font-bold ${d.safetyScore >= 90 ? 'text-emerald-600 dark:text-emerald-400' : d.safetyScore >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                            {d.safetyScore}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${d.status === DriverStatus.ON_DUTY ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' :
                                            d.status === DriverStatus.SUSPENDED ? 'bg-rose-500/10 text-rose-400 border-rose-500/25' :
                                                'bg-neutral-700/40 text-neutral-400 border-neutral-700'}`}>
                                            {d.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center text-neutral-600 dark:text-neutral-300">{d.totalTrips}</td>
                                    <td className="px-6 py-4 text-center text-emerald-600 dark:text-emerald-400 font-medium">{d.completedTrips}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <HBar value={d.completionRate} max={100}
                                                color={d.completionRate >= 80 ? 'bg-emerald-500' : d.completionRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'} />
                                            <span className={`text-xs font-semibold w-10 text-right ${d.completionRate >= 80 ? 'text-emerald-600 dark:text-emerald-400' : d.completionRate >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                {d.completionRate}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {d.expired ? (
                                            <span className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2 py-0.5 rounded-lg">EXPIRED</span>
                                        ) : (
                                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                {new Date(d.licenseExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary footer */}
                <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 flex flex-wrap gap-6 text-sm">
                    <div>
                        <span className="text-neutral-500 dark:text-neutral-500">Avg Safety Score </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {drivers.length > 0 ? Math.round(drivers.reduce((s, d) => s + d.safetyScore, 0) / drivers.length) : '—'}/100
                        </span>
                    </div>
                    <div>
                        <span className="text-neutral-500">Fleet Completion Rate </span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{tripCompletionRate}%</span>
                    </div>
                    <div>
                        <span className="text-neutral-500">Cancelled Trips </span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">{cancelledTrips}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <button onClick={exportVehicleReport} className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                            <Download className="w-3.5 h-3.5" /> Vehicle CSV
                        </button>
                        <button onClick={exportVehiclePDF} className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                            <FileDown className="w-3.5 h-3.5" /> Vehicle PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
