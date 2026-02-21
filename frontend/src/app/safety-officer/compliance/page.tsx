'use client';

import { useMemo } from 'react';
import { useFleetStore } from '@/store/useFleetStore';
import { DriverStatus, TripStatus } from '@/types';
import {
    CalendarDays, ShieldX, ShieldCheck, AlertTriangle,
    CheckCircle2, Ban, Clock, FileText
} from 'lucide-react';

function daysUntil(d: string) { return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }

export default function CompliancePage() {
    const { drivers, trips } = useFleetStore();

    const enriched = useMemo(() => drivers.map((d) => {
        const dt = trips.filter((t) => t.driverId === d.id);
        const comp = dt.filter((t) => t.status === TripStatus.COMPLETED).length;
        const rate = dt.length > 0 ? Math.round((comp / dt.length) * 100) : 0;
        const expired = new Date(d.licenseExpiry) < new Date();
        const days = daysUntil(d.licenseExpiry);
        const riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = expired ? 'CRITICAL'
            : days <= 30 ? 'HIGH' : days <= 90 ? 'MEDIUM' : 'LOW';
        return { ...d, completionRate: rate, totalTrips: dt.length, expired, daysLeft: days, riskLevel };
    }), [drivers, trips]);

    const critical = enriched.filter((d) => d.riskLevel === 'CRITICAL');
    const high = enriched.filter((d) => d.riskLevel === 'HIGH');
    const medium = enriched.filter((d) => d.riskLevel === 'MEDIUM');
    const low = enriched.filter((d) => d.riskLevel === 'LOW');
    const suspended = enriched.filter((d) => d.status === DriverStatus.SUSPENDED);

    const riskConfig = {
        CRITICAL: { title: 'Critical', border: 'border-rose-500/40', bg: 'bg-rose-500/10', text: 'text-rose-400', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30', icon: ShieldX },
        HIGH: { title: 'High Risk', border: 'border-orange-500/40', bg: 'bg-orange-500/10', text: 'text-orange-400', badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30', icon: AlertTriangle },
        MEDIUM: { title: 'Medium Risk', border: 'border-amber-500/30', bg: 'bg-amber-500/5', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Clock },
        LOW: { title: 'Compliant', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25', icon: ShieldCheck },
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Compliance & License Tracker</h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">Driver license validity, suspension status, and compliance risk levels.</p>
            </div>

            {/* Risk summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Critical (Expired)', value: critical.length, ...riskConfig.CRITICAL },
                    { label: 'High Risk (≤30 days)', value: high.length, ...riskConfig.HIGH },
                    { label: 'Medium (≤90 days)', value: medium.length, ...riskConfig.MEDIUM },
                    { label: 'Fully Compliant', value: low.length, ...riskConfig.LOW },
                ].map((k) => (
                    <div key={k.label} className={`bg-white dark:bg-neutral-900 border ${k.border} rounded-2xl p-5 shadow-sm dark:shadow-none`}>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 leading-tight">{k.label}</p>
                            <div className={`p-2 rounded-xl ${k.bg}`}><k.icon className={`w-4 h-4 ${k.text}`} /></div>
                        </div>
                        <p className={`text-3xl font-bold ${k.text}`}>{k.value}</p>
                    </div>
                ))}
            </div>

            {/* Critical section */}
            {critical.length > 0 && (
                <div className="bg-rose-500/5 border border-rose-500/25 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-rose-500/20 bg-rose-500/10">
                        <ShieldX className="w-4 h-4 text-rose-400" />
                        <h2 className="text-sm font-semibold text-rose-300">⛔ Expired Licenses — Immediate Action Required</h2>
                    </div>
                    <div className="divide-y divide-rose-500/10">
                        {critical.map((d) => (
                            <div key={d.id} className="flex items-center justify-between px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-sm">
                                        {d.firstName[0]}{d.lastName[0]}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{d.firstName} {d.lastName}</p>
                                        <p className="text-xs text-rose-400 mt-0.5">Expired: {fmtDate(d.licenseExpiry)} · {Math.abs(d.daysLeft)} days ago</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${d.status === DriverStatus.ON_DUTY ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : d.status === DriverStatus.SUSPENDED ? 'bg-rose-500/10 text-rose-400 border-rose-500/25' : 'bg-neutral-700/40 text-neutral-400 border-neutral-700'}`}>
                                        {d.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs bg-rose-500/20 text-rose-300 px-3 py-1 rounded-lg border border-rose-500/30 font-semibold">BLOCKED</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All drivers compliance table */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                    <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Full Compliance Register</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500">
                                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider">Driver</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider">License Expiry</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider">Days Left</th>
                                <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider">Risk Level</th>
                                <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider">Duty Status</th>
                                <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider">Dispatchable?</th>
                                <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider">Safety Score</th>
                                <th className="text-center px-6 py-3 text-xs font-semibold uppercase tracking-wider">Completion</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60">
                            {enriched.sort((a, b) => a.daysLeft - b.daysLeft).map((d) => {
                                const rcfg = riskConfig[d.riskLevel];
                                const dispatchable = !d.expired && d.status === DriverStatus.ON_DUTY;
                                return (
                                    <tr key={d.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-600 to-amber-400 flex items-center justify-center text-neutral-950 text-xs font-bold">
                                                    {d.firstName[0]}{d.lastName[0]}
                                                </div>
                                                <span className="font-medium text-neutral-900 dark:text-white">{d.firstName} {d.lastName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`flex items-center gap-1.5 text-sm ${d.expired ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-neutral-600 dark:text-neutral-300'}`}>
                                                <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                                                {fmtDate(d.licenseExpiry)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-sm font-semibold ${d.expired ? 'text-rose-600 dark:text-rose-400' : d.daysLeft <= 30 ? 'text-orange-600 dark:text-orange-400' : d.daysLeft <= 90 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                {d.expired ? `−${Math.abs(d.daysLeft)} days` : `+${d.daysLeft} days`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${rcfg.badge}`}>
                                                {rcfg.title}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${d.status === DriverStatus.ON_DUTY ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : d.status === DriverStatus.SUSPENDED ? 'bg-rose-500/10 text-rose-400 border-rose-500/25' : 'bg-neutral-700/40 text-neutral-400 border-neutral-700'}`}>
                                                {d.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {dispatchable
                                                ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                                                : <Ban className="w-4 h-4 text-rose-400 mx-auto" />}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-bold ${d.safetyScore >= 90 ? 'text-emerald-600 dark:text-emerald-400' : d.safetyScore >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>{d.safetyScore}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-medium ${d.completionRate >= 80 ? 'text-emerald-400' : d.completionRate >= 60 ? 'text-amber-400' : 'text-neutral-500'}`}>
                                                {d.totalTrips > 0 ? `${d.completionRate}%` : '—'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Suspended drivers panel */}
            {suspended.length > 0 && (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-2 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                        <Ban className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Suspended Drivers ({suspended.length})</h2>
                    </div>
                    <div className="divide-y divide-neutral-200 dark:divide-neutral-800/60">
                        {suspended.map((d) => (
                            <div key={d.id} className="px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 text-xs font-bold">{d.firstName[0]}{d.lastName[0]}</div>
                                    <div>
                                        <p className="font-medium text-neutral-900 dark:text-white">{d.firstName} {d.lastName}</p>
                                        <p className="text-xs text-neutral-500">Safety Score: {d.safetyScore} · {d.totalTrips} trips total</p>
                                    </div>
                                </div>
                                <span className="text-xs text-rose-400 border border-rose-500/25 bg-rose-500/10 px-3 py-1 rounded-full font-medium">Suspended</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
