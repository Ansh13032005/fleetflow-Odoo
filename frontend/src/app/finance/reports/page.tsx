'use client';

import { useFleetStore } from '@/store/useFleetStore';
import { Download, FileText, IndianRupee, Fuel, Wrench, Users, FileDown } from 'lucide-react';
import { TripStatus } from '@/types';
import { exportCSV, exportPDF } from '@/lib/export';

function fmt(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }

export default function FinanceReportsPage() {
    const { vehicles, drivers, trips, expenseLogs, maintenanceLogs } = useFleetStore();
    const today = new Date().toISOString().split('T')[0];

    const costRows = vehicles.map((v) => ({
        Vehicle: v.nameModel,
        Plate: v.licensePlate,
        Status: v.status,
        'Fuel Cost (INR)': expenseLogs.filter((l) => l.vehicleId === v.id).reduce((s, l) => s + l.fuelCost, 0),
        'Maintenance Cost (INR)': maintenanceLogs.filter((l) => l.vehicleId === v.id).reduce((s, l) => s + l.cost, 0),
        'Total Op Cost (INR)': expenseLogs.filter((l) => l.vehicleId === v.id).reduce((s, l) => s + l.fuelCost, 0) + maintenanceLogs.filter((l) => l.vehicleId === v.id).reduce((s, l) => s + l.cost, 0),
        'Odometer (km)': v.odometer,
    }));
    const costHeaders = ['Vehicle', 'Plate', 'Status', 'Fuel Cost (INR)', 'Maintenance Cost (INR)', 'Total Op Cost (INR)', 'Odometer (km)'];

    const fuelRows = expenseLogs.map((l) => {
        const v = vehicles.find((v) => v.id === l.vehicleId);
        return {
            Vehicle: v?.nameModel ?? l.vehicleId,
            Plate: v?.licensePlate ?? '',
            Date: l.date,
            'Litres': l.fuelLiters,
            'Fuel Cost (INR)': l.fuelCost,
            'Distance (km)': l.distanceKm ?? '',
            'km/L': l.distanceKm && l.fuelLiters ? Math.round((l.distanceKm / l.fuelLiters) * 100) / 100 : '',
            Notes: l.notes ?? '',
        };
    });
    const fuelHeaders = ['Vehicle', 'Plate', 'Date', 'Litres', 'Fuel Cost (INR)', 'Distance (km)', 'km/L', 'Notes'];

    const maintRows = maintenanceLogs.map((l) => {
        const v = vehicles.find((v) => v.id === l.vehicleId);
        return {
            Vehicle: v?.nameModel ?? l.vehicleId,
            Plate: v?.licensePlate ?? '',
            Date: l.date,
            Description: l.description,
            'Cost (INR)': l.cost,
        };
    });
    const maintHeaders = ['Vehicle', 'Plate', 'Date', 'Description', 'Cost (INR)'];

    const driverRows = drivers.map((d) => {
        const dTrips = trips.filter((t) => t.driverId === d.id);
        const comp = dTrips.filter((t) => t.status === TripStatus.COMPLETED).length;
        return {
            Driver: `${d.firstName} ${d.lastName}`,
            Status: d.status,
            'Safety Score': d.safetyScore,
            'License Expiry': d.licenseExpiry,
            'Total Trips': dTrips.length,
            'Completed Trips': comp,
            'Completion Rate (%)': dTrips.length > 0 ? Math.round((comp / dTrips.length) * 100) : 0,
        };
    });
    const driverHeaders = ['Driver', 'Status', 'Safety Score', 'License Expiry', 'Total Trips', 'Completed Trips', 'Completion Rate (%)'];

    const reports = [
        {
            title: 'Operational Cost Report',
            description: 'Per-vehicle fuel and maintenance costs with fleet totals.',
            icon: IndianRupee,
            color: 'text-purple-400 bg-purple-500/10',
            rows: costRows,
            headers: costHeaders,
            filename: `fleetflow_cost_report_${today}`,
        },
        {
            title: 'Fuel Consumption Report',
            description: 'All fuel log entries with efficiency metrics.',
            icon: Fuel,
            color: 'text-amber-400 bg-amber-500/10',
            rows: fuelRows,
            headers: fuelHeaders,
            filename: `fleetflow_fuel_report_${today}`,
        },
        {
            title: 'Maintenance Expenditure Report',
            description: 'All service log entries with cost breakdown.',
            icon: Wrench,
            color: 'text-blue-400 bg-blue-500/10',
            rows: maintRows,
            headers: maintHeaders,
            filename: `fleetflow_maintenance_report_${today}`,
        },
        {
            title: 'Driver Performance Report',
            description: 'Driver trip completion rates and safety scores.',
            icon: Users,
            color: 'text-emerald-400 bg-emerald-500/10',
            rows: driverRows,
            headers: driverHeaders,
            filename: `fleetflow_driver_report_${today}`,
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Financial Reports</h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">Download CSV or PDF reports for external analysis and audit trails.</p>
            </div>

            {/* Summary totals */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm dark:shadow-none">
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 uppercase tracking-wider mb-1">Total Fuel Spend</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{fmt(expenseLogs.reduce((s, l) => s + l.fuelCost, 0))}</p>
                </div>
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm dark:shadow-none">
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 uppercase tracking-wider mb-1">Total Maintenance</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{fmt(maintenanceLogs.reduce((s, l) => s + l.cost, 0))}</p>
                </div>
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm dark:shadow-none">
                    <p className="text-xs text-neutral-500 dark:text-neutral-500 uppercase tracking-wider mb-1">Grand Total</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{fmt(expenseLogs.reduce((s, l) => s + l.fuelCost, 0) + maintenanceLogs.reduce((s, l) => s + l.cost, 0))}</p>
                </div>
            </div>

            {/* Report cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reports.map((r) => (
                    <div key={r.title} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors group shadow-sm dark:shadow-none">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${r.color.split(' ')[1]}`}>
                                <r.icon className={`w-5 h-5 ${r.color.split(' ')[0]}`} />
                            </div>
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => { exportCSV(r.rows, `${r.filename}.csv`, r.headers); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white text-xs font-medium transition-colors"
                                >
                                    <Download className="w-3.5 h-3.5" /> CSV
                                </button>
                                <button
                                    onClick={() => { exportPDF(r.title, r.headers, r.rows, r.filename); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white text-xs font-medium transition-colors"
                                >
                                    <FileDown className="w-3.5 h-3.5" /> PDF
                                </button>
                            </div>
                        </div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">{r.title}</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{r.description}</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                onClick={() => { exportCSV(r.rows, `${r.filename}.csv`, r.headers); }}
                                className="flex items-center gap-2 text-sm font-medium transition-colors text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            >
                                <FileText className="w-4 h-4" /> Export CSV
                            </button>
                            <button
                                onClick={() => { exportPDF(r.title, r.headers, r.rows, r.filename); }}
                                className="flex items-center gap-2 text-sm font-medium transition-colors text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            >
                                <FileDown className="w-4 h-4" /> Export PDF
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
