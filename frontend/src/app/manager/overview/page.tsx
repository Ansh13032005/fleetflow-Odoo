'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { getOperationalAnalytics } from '@/services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Download, Loader2, AlertTriangle, IndianRupee, TrendingUp, Droplets, Wrench, FileDown } from 'lucide-react';
import { exportCSV, exportPDF } from '@/lib/export';

function fmt(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }
function r2(n: number) { return Math.round(n * 100) / 100; }

export default function OverviewAnalyticsPage() {
    const { token } = useAuthStore();
    const [data, setData] = useState<{ vehicleMetrics: any[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;
        const fetchAnalytics = async () => {
            setIsLoading(true);
            try {
                const res = await getOperationalAnalytics(token);
                setData(res);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch analytics');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, [token]);

    const csvHeaders = ['Vehicle ID', 'Name/Model', 'License Plate', 'Odometer (km)', 'Km/Liter', 'Total Fuel Liters', 'Maintenance Cost (₹)', 'Fuel Cost (₹)', 'Total Operating Cost (₹)'];
    const csvData = useMemo(() => {
        if (!data) return [];
        return data.vehicleMetrics.map(v => ({
            'Vehicle ID': v.vehicleId,
            'Name/Model': v.name,
            'License Plate': v.plate,
            'Odometer (km)': v.odometer,
            'Km/Liter': r2(v.kmPerLiter),
            'Total Fuel Liters': r2(v.totalLiters),
            'Maintenance Cost (₹)': v.maintenanceTotal,
            'Fuel Cost (₹)': v.fuelTotal,
            'Total Operating Cost (₹)': v.totalOperatingCost
        }));
    }, [data]);
    const dateStr = new Date().toISOString().split('T')[0];
    const handleExportCSV = () => exportCSV(csvData, `fleet_operational_analytics_${dateStr}.csv`, csvHeaders);
    const handleExportPDF = () => exportPDF('Operational Analytics', csvHeaders, csvData, `fleet_operational_analytics_${dateStr}`);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Operational Analytics</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">Fleet efficiency and cost analysis from real trip and expense data.</p>
                </div>
                {!isLoading && (
                    <div className="flex flex-wrap gap-2 shrink-0">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
                        >
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 border border-neutral-700 text-neutral-300 hover:bg-neutral-800 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
                        >
                            <FileDown className="w-4 h-4" /> Export PDF
                        </button>
                    </div>
                )}
            </div>

            {isLoading && (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
            )}

            {error && (
                <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
                    <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {error}</div>
                </div>
            )}

            {!isLoading && data && (
                <>
                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Operating Cost per Vehicle */}
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-neutral-900 dark:text-white text-lg mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-500" /> Operating Cost per Vehicle
                            </h3>
                            <div className="h-72 w-full text-sm">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.vehicleMetrics} margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                                        <XAxis dataKey="plate" tick={{ fill: '#888' }} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis tickFormatter={(val) => `₹${val / 1000}k`} tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                                            formatter={(value: any) => fmt(Number(value) || 0)}
                                        />
                                        <Bar dataKey="totalOperatingCost" name="Operating Cost" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Fuel Efficiency Chart */}
                        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-neutral-900 dark:text-white text-lg mb-6 flex items-center gap-2">
                                <Droplets className="w-5 h-5 text-blue-500" /> Fuel Efficiency (Km/L)
                            </h3>
                            <div className="h-72 w-full text-sm">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.vehicleMetrics} margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                                        <XAxis dataKey="plate" tick={{ fill: '#888' }} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                                            formatter={(value: any) => r2(Number(value) || 0) + ' Km/L'}
                                        />
                                        <Bar dataKey="kmPerLiter" name="Km/L" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Data Table */}
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800/60 flex items-center gap-3">
                            <Wrench className="w-5 h-5 text-neutral-500" />
                            <h3 className="font-bold text-neutral-900 dark:text-white text-lg">Vehicle Performance Matrix</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-neutral-50 dark:bg-neutral-950/40 text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-800/60">
                                        <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider text-xs">Vehicle</th>
                                        <th className="px-6 py-4 text-right font-semibold uppercase tracking-wider text-xs">Dist (km)</th>
                                        <th className="px-6 py-4 text-right font-semibold uppercase tracking-wider text-xs">Fuel (L)</th>
                                        <th className="px-6 py-4 text-right font-semibold uppercase tracking-wider text-xs">Km/L</th>
                                        <th className="px-6 py-4 text-right font-semibold uppercase tracking-wider text-xs">Op. Cost</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60 text-neutral-900 dark:text-white">
                                    {data.vehicleMetrics.map((v, i) => (
                                        <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold">{v.name}</p>
                                                <p className="text-xs text-neutral-500 font-mono mt-0.5">{v.plate}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium">{v.odometer.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-medium">{r2(v.totalLiters)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`font-bold ${v.kmPerLiter >= 12 ? 'text-emerald-500' : v.kmPerLiter >= 8 ? 'text-amber-500' : 'text-rose-500'}`}>
                                                    {r2(v.kmPerLiter)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-amber-600 dark:text-amber-400">{fmt(v.totalOperatingCost)}</td>
                                        </tr>
                                    ))}
                                    {data.vehicleMetrics.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                                                No vehicle analytics data available yet. Build history through trips and expenses.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
