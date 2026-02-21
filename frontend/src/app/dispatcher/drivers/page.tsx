'use client';

import { useFleetStore } from '@/store/useFleetStore';
import { DriverStatus } from '@/types';
import { CheckCircle2, Ban, ShieldX, CalendarDays } from 'lucide-react';

export default function DispatcherDriversPage() {
    const { drivers } = useFleetStore();
    const now = new Date();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Available Drivers</h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">View-only: driver status and license validity for dispatch planning.</p>
            </div>
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500">
                            <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Driver</th>
                            <th className="text-center px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Status</th>
                            <th className="text-center px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Safety Score</th>
                            <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">License Expiry</th>
                            <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider">Dispatchable?</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60">
                        {drivers.map((d) => {
                            const expired = new Date(d.licenseExpiry) < now;
                            const dispatchable = d.status === DriverStatus.ON_DUTY && !expired;
                            return (
                                <tr key={d.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white text-xs font-bold">{d.firstName[0]}{d.lastName[0]}</div>
                                            <span className="font-medium text-neutral-900 dark:text-white">{d.firstName} {d.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${d.status === DriverStatus.ON_DUTY ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : d.status === DriverStatus.SUSPENDED ? 'bg-rose-500/10 text-rose-400 border-rose-500/25' : 'bg-neutral-700/40 text-neutral-400 border-neutral-700'}`}>
                                            {d.status === DriverStatus.ON_DUTY ? <CheckCircle2 className="w-3 h-3" /> : d.status === DriverStatus.SUSPENDED ? <ShieldX className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                                            {d.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`font-bold ${d.safetyScore >= 90 ? 'text-emerald-600 dark:text-emerald-400' : d.safetyScore >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>{d.safetyScore}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`flex items-center gap-1.5 ${expired ? 'text-rose-400' : 'text-neutral-400'}`}>
                                            <CalendarDays className="w-3.5 h-3.5" />
                                            {new Date(d.licenseExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            {expired && <span className="text-xs font-bold ml-1">EXPIRED</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {dispatchable
                                            ? <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Yes</span>
                                            : <span className="text-xs font-semibold text-rose-400 flex items-center gap-1"><ShieldX className="w-3.5 h-3.5" /> No</span>}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
