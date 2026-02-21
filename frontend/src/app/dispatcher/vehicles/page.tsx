'use client';

import { useFleetStore } from '@/store/useFleetStore';
import { VehicleStatus } from '@/types';
import { Truck, CheckCircle2, Wrench, XCircle } from 'lucide-react';

const statusConfig: Record<VehicleStatus, { label: string; classes: string; icon: React.ElementType }> = {
    [VehicleStatus.AVAILABLE]: { label: 'Available', icon: CheckCircle2, classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' },
    [VehicleStatus.ON_TRIP]: { label: 'On Trip', icon: Truck, classes: 'bg-blue-500/10 text-blue-400 border-blue-500/25' },
    [VehicleStatus.IN_SHOP]: { label: 'In Shop', icon: Wrench, classes: 'bg-amber-500/10 text-amber-400 border-amber-500/25' },
    [VehicleStatus.OUT_OF_SERVICE]: { label: 'Out of Service', icon: XCircle, classes: 'bg-rose-500/10 text-rose-400 border-rose-500/25' },
};

export default function DispatcherVehiclesPage() {
    const { vehicles } = useFleetStore();
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Fleet Vehicles</h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">View-only: vehicle availability for dispatch planning.</p>
            </div>
            <div className="flex flex-wrap gap-3">
                {Object.values(VehicleStatus).map((s) => {
                    const cfg = statusConfig[s];
                    const count = vehicles.filter((v) => v.status === s).length;
                    return (
                        <span key={s} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${cfg.classes}`}>
                            <cfg.icon className="w-4 h-4" /> {cfg.label} <strong>{count}</strong>
                        </span>
                    );
                })}
            </div>
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500">
                            <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Vehicle</th>
                            <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Plate</th>
                            <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Max Load</th>
                            <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Odometer</th>
                            <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60">
                        {vehicles.map((v) => {
                            const cfg = statusConfig[v.status];
                            return (
                                <tr key={v.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-neutral-900 dark:text-white">{v.nameModel}</td>
                                    <td className="px-6 py-4 font-mono text-neutral-500 dark:text-neutral-400 text-xs">{v.licensePlate}</td>
                                    <td className="px-6 py-4 text-right text-neutral-600 dark:text-neutral-300">{v.maxLoadCapacity.toLocaleString()} kg</td>
                                    <td className="px-6 py-4 text-right text-neutral-600 dark:text-neutral-300">{v.odometer.toLocaleString()} km</td>
                                    <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.classes}`}><cfg.icon className="w-3 h-3" />{cfg.label}</span></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
