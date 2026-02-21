'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { getDashboardMetrics } from '@/services/api';
import { VehicleStatus } from '@/types';
import { Activity, Truck, AlertTriangle, ShieldCheck, PieChart, Info, Loader2 } from 'lucide-react';

export default function CommandCenterPage() {
    const { token } = useAuthStore();
    const [metrics, setMetrics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;
        const fetchMetrics = async () => {
            setIsLoading(true);
            try {
                const data = await getDashboardMetrics(token);
                setMetrics(data);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch metrics');
            } finally {
                setIsLoading(false);
            }
        };
        fetchMetrics();
    }, [token]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Command Center</h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">Real-time overview of fleet operations.</p>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            )}

            {error && (
                <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
                    <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {error}</div>
                </div>
            )}

            {!isLoading && metrics && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{metrics.ongoingTrips}</p>
                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-0.5">Active Trips</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                                <Truck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{metrics.activeFleet} / {metrics.totalFleet}</p>
                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-0.5">Fleet On Duty</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                                <PieChart className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{metrics.fleetUtilization}%</p>
                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-0.5">Fleet Utilization</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-4">
                            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                                <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{metrics.vehicleStatusBreakdown[VehicleStatus.IN_SHOP] || 0}</p>
                                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-0.5">Vehicles in Shop</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">Live Vehicle Status Breakdown</h2>
                        <div className="space-y-4">
                            {Object.values(VehicleStatus).map(status => (
                                <div key={status} className="flex items-center justify-between p-3 rounded-xl border border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-950/30">
                                    <span className="font-semibold text-sm text-neutral-700 dark:text-neutral-300">{status}</span>
                                    <span className="font-bold text-neutral-900 dark:text-white text-lg">{metrics.vehicleStatusBreakdown[status] || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
