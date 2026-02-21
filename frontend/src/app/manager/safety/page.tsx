'use client';

import { useMemo, useState } from 'react';
import { useFleetStore } from '@/store/useFleetStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Driver, DriverStatus, TripStatus } from '@/types';
import {
    ShieldCheck, ShieldX, AlertTriangle,
    CheckCircle2, Ban, Search, ChevronDown, CalendarDays,
    TrendingUp, Users, X, Pencil, Info, Award, Clock, MapPin
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isExpired(expiry: string) { return new Date(expiry) < new Date(); }
function daysUntilExpiry(expiry: string) {
    return Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

const statusConfig: Record<DriverStatus, { label: string; classes: string; icon: React.ElementType }> = {
    [DriverStatus.ON_DUTY]: { label: 'On Duty', classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25', icon: CheckCircle2 },
    [DriverStatus.OFF_DUTY]: { label: 'Off Duty', classes: 'bg-neutral-700/40 text-neutral-400 border-neutral-700', icon: Ban },
    [DriverStatus.ON_TRIP]: { label: 'On Trip', classes: 'bg-blue-500/10 text-blue-400 border-blue-500/25', icon: MapPin },
    [DriverStatus.SUSPENDED]: { label: 'Suspended', classes: 'bg-rose-500/10 text-rose-400 border-rose-500/25', icon: ShieldX },
};

function StatusPill({ status }: { status: DriverStatus }) {
    const cfg = statusConfig[status];
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.classes}`}>
            <Icon className="w-3 h-3" />{cfg.label}
        </span>
    );
}

function SafetyGauge({ score }: { score: number }) {
    const color = score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';
    const r = 28;
    const circumference = 2 * Math.PI * r;
    const filled = (score / 100) * circumference;
    return (
        <div className="relative w-16 h-16 shrink-0">
            <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                <circle cx="32" cy="32" r={r} fill="none" stroke="#262626" strokeWidth="6" />
                <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6"
                    strokeDasharray={`${filled} ${circumference - filled}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">{score}</span>
            </div>
        </div>
    );
}

// ─── Driver Detail Panel ──────────────────────────────────────────────────────
function DriverDetailPanel({ driver, onClose }: { driver: Driver; onClose: () => void }) {
    const { token } = useAuthStore();
    const { trips, updateDriver } = useFleetStore();
    const driverTrips = trips.filter((t) => t.driverId === driver.id);
    const completed = driverTrips.filter((t) => t.status === TripStatus.COMPLETED).length;
    const cancelled = driverTrips.filter((t) => t.status === TripStatus.CANCELLED).length;
    const total = driverTrips.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const expired = isExpired(driver.licenseExpiry);
    const days = daysUntilExpiry(driver.licenseExpiry);

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-700 to-emerald-400 flex items-center justify-center text-neutral-950 font-bold text-lg">
                            {driver.firstName[0]}{driver.lastName[0]}
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">{driver.firstName} {driver.lastName}</h2>
                            <StatusPill status={driver.status} />
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* License */}
                    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${expired ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/25 text-rose-600 dark:text-rose-400' : days <= 90 ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/25 text-amber-600 dark:text-amber-400' : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'}`}>
                        <CalendarDays className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium">{expired ? '⛔ License EXPIRED' : days <= 90 ? `⚠ Expires in ${days} days` : `✓ License valid until ${new Date(driver.licenseExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`}</p>
                            {expired && <p className="text-xs opacity-70 mt-0.5">Driver is blocked from trip assignments until renewed.</p>}
                        </div>
                    </div>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Total Trips', value: total, icon: Clock, color: 'text-blue-400' },
                            { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-emerald-400' },
                            { label: 'Cancelled', value: cancelled, icon: X, color: 'text-rose-400' },
                            { label: 'Completion %', value: `${completionRate}%`, icon: TrendingUp, color: completionRate >= 80 ? 'text-emerald-400' : completionRate >= 60 ? 'text-amber-400' : 'text-rose-400' },
                        ].map((m) => (
                            <div key={m.label} className="bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex items-center gap-3">
                                <m.icon className={`w-5 h-5 ${m.color} shrink-0`} />
                                <div>
                                    <p className="text-xs text-neutral-500">{m.label}</p>
                                    <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Safety score */}
                    <div className="flex items-center gap-4 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
                        <SafetyGauge score={driver.safetyScore} />
                        <div className="flex-1">
                            <p className="text-xs text-neutral-500 mb-1">Safety Score</p>
                            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${driver.safetyScore >= 90 ? 'bg-emerald-500' : driver.safetyScore >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                    style={{ width: `${driver.safetyScore}%` }} />
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                {driver.safetyScore >= 90 ? '🏆 Excellent — Top performer' : driver.safetyScore >= 70 ? '⚠ Average — Needs improvement' : '🚨 Critical — Review required'}
                            </p>
                        </div>
                    </div>

                    {/* Quick status toggle */}
                    <div>
                        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">Update Status</p>
                        <div className="flex gap-2">
                            {Object.values(DriverStatus).map((s) => {
                                const cfg = statusConfig[s];
                                return (
                                    <button key={s}
                                        onClick={() => token && updateDriver(token, driver.id, { status: s })}
                                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${driver.status === s ? cfg.classes : 'border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-900 dark:hover:text-neutral-300'}`}>
                                        {cfg.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SafetyPage() {
    const { drivers, trips } = useFleetStore();
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<DriverStatus | 'ALL'>('ALL');
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

    // Enrich drivers with trip stats
    const enrichedDrivers = useMemo(() => {
        return drivers.map((d) => {
            const dTrips = trips.filter((t) => t.driverId === d.id);
            const completed = dTrips.filter((t) => t.status === TripStatus.COMPLETED).length;
            const total = dTrips.length;
            const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
            const expired = isExpired(d.licenseExpiry);
            const days = daysUntilExpiry(d.licenseExpiry);
            return { ...d, total, completed, completionRate, expired, daysLeft: days };
        });
    }, [drivers, trips]);

    const filtered = enrichedDrivers.filter((d) => {
        const name = `${d.firstName} ${d.lastName}`.toLowerCase();
        const matchSearch = name.includes(search.toLowerCase());
        const matchStatus = filterStatus === 'ALL' || d.status === filterStatus;
        return matchSearch && matchStatus;
    });

    // Fleet-level stats
    const expiredCount = enrichedDrivers.filter((d) => d.expired).length;
    const soonCount = enrichedDrivers.filter((d) => !d.expired && d.daysLeft <= 90).length;
    const suspendedCount = enrichedDrivers.filter((d) => d.status === DriverStatus.SUSPENDED).length;
    const avgSafety = drivers.length > 0 ? Math.round(drivers.reduce((s, d) => s + d.safetyScore, 0) / drivers.length) : 0;

    const scoredRanking = [...enrichedDrivers].sort((a, b) => b.safetyScore - a.safetyScore);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Driver Safety & Performance</h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">Human resource and compliance monitoring for your entire driver pool.</p>
            </div>

            {/* Alert banners */}
            {expiredCount > 0 && (
                <div className="flex items-center gap-3 px-5 py-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-sm">
                    <ShieldX className="w-4 h-4 shrink-0" />
                    <span><strong>{expiredCount} driver{expiredCount > 1 ? 's' : ''}</strong> with expired licenses — blocked from trip assignments until renewed.</span>
                </div>
            )}
            {soonCount > 0 && (
                <div className="flex items-center gap-3 px-5 py-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-400 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span><strong>{soonCount} driver{soonCount > 1 ? 's' : ''}</strong> with licenses expiring within 90 days — schedule renewals.</span>
                </div>
            )}

            {/* KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Drivers', value: drivers.length, icon: Users, color: 'text-blue-400 bg-blue-500/10' },
                    { label: 'Fleet Avg Safety', value: `${avgSafety}/100`, icon: ShieldCheck, color: 'text-emerald-400 bg-emerald-500/10' },
                    { label: 'Expired Licenses', value: expiredCount, icon: ShieldX, color: 'text-rose-400 bg-rose-500/10' },
                    { label: 'Suspended', value: suspendedCount, icon: Ban, color: 'text-neutral-300 bg-neutral-700/40' },
                ].map((kpi) => (
                    <div key={kpi.label} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-sm dark:shadow-none">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{kpi.label}</p>
                            <div className={`p-2 rounded-xl ${kpi.color.split(' ')[1]}`}>
                                <kpi.icon className={`w-4 h-4 ${kpi.color.split(' ')[0]}`} />
                            </div>
                        </div>
                        <p className={`text-3xl font-bold ${kpi.color.split(' ')[0]}`}>{kpi.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* Main Driver Table */}
                <div className="xl:col-span-2 space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <input className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                                placeholder="Search driver name…" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <div className="relative">
                            <select className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 pr-9 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 focus:outline-none appearance-none cursor-pointer"
                                value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as DriverStatus | 'ALL')}>
                                <option value="ALL">All Statuses</option>
                                {Object.values(DriverStatus).map((s) => <option key={s} value={s}>{statusConfig[s].label}</option>)}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500">
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Driver</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">License</th>
                                        <th className="text-center px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Safety</th>
                                        <th className="text-center px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Trips</th>
                                        <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Status</th>
                                        <th className="text-right px-5 py-3.5 text-xs font-semibold uppercase tracking-wider">Detail</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60">
                                    {filtered.length === 0 && (
                                        <tr><td colSpan={6} className="text-center py-14 text-neutral-500">
                                            <Users className="w-8 h-8 mx-auto mb-3 opacity-30" /> No drivers found.
                                        </td></tr>
                                    )}
                                    {filtered.map((d) => (
                                        <tr key={d.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors group">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-700 to-emerald-400 flex items-center justify-center text-neutral-950 text-xs font-bold shrink-0">
                                                        {d.firstName[0]}{d.lastName[0]}
                                                    </div>
                                                    <p className="font-medium text-neutral-900 dark:text-white">{d.firstName} {d.lastName}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {d.expired ? (
                                                    <span className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/25 px-2 py-1 rounded-lg font-medium">EXPIRED</span>
                                                ) : d.daysLeft <= 90 ? (
                                                    <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2 py-1 rounded-lg font-medium">{d.daysLeft}d left</span>
                                                ) : (
                                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{new Date(d.licenseExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className={`text-sm font-bold ${d.safetyScore >= 90 ? 'text-emerald-600 dark:text-emerald-400' : d.safetyScore >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                    {d.safetyScore}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-1 text-xs">
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{d.completed}</span>
                                                    <span className="text-neutral-600 dark:text-neutral-600">/</span>
                                                    <span className="text-neutral-500 dark:text-neutral-400">{d.total}</span>
                                                </div>
                                                {d.total > 0 && (
                                                    <div className="h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full mt-1.5 w-16 mx-auto">
                                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${d.completionRate}%` }} />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-4"><StatusPill status={d.status} /></td>
                                            <td className="px-5 py-4 text-right">
                                                <button onClick={() => setSelectedDriver(d)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Safety Leaderboard */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
                        <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Safety Leaderboard</h2>
                    </div>
                    <div className="divide-y divide-neutral-200 dark:divide-neutral-800/60">
                        {scoredRanking.map((d, i) => (
                            <div key={d.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors cursor-pointer"
                                onClick={() => setSelectedDriver(d)}>
                                <span className={`text-xs font-bold w-5 text-center ${i === 0 ? 'text-amber-600 dark:text-amber-400' : i === 1 ? 'text-neutral-500 dark:text-neutral-300' : i === 2 ? 'text-orange-600 dark:text-orange-500' : 'text-neutral-600 dark:text-neutral-600'}`}>
                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                </span>
                                <SafetyGauge score={d.safetyScore} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{d.firstName} {d.lastName}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <StatusPill status={d.status} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="px-5 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/30">
                        <div className="flex items-start gap-2 text-xs text-neutral-500">
                            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span>Click any driver to view detailed profile and trip history. Safety scores affect dispatch priority.</span>
                        </div>
                    </div>
                </div>
            </div>

            {selectedDriver && <DriverDetailPanel driver={selectedDriver} onClose={() => setSelectedDriver(null)} />}
        </div>
    );
}
