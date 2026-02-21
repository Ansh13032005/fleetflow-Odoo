'use client';

import { useMemo, useState } from 'react';
import { useFleetStore } from '@/store/useFleetStore';
import { Driver, DriverStatus, TripStatus } from '@/types';
import {
    ShieldX, Search, X, ChevronDown, CalendarDays, Info, Users
} from 'lucide-react';

function daysUntil(d: string) { return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); }

function SafetyGauge({ score }: { score: number }) {
    const color = score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444';
    const r = 30; const circ = 2 * Math.PI * r;
    return (
        <div className="relative w-20 h-20">
            <svg viewBox="0 0 68 68" className="w-full h-full -rotate-90">
                <circle cx="34" cy="34" r={r} fill="none" stroke="#262626" strokeWidth="7" />
                <circle cx="34" cy="34" r={r} fill="none" stroke={color} strokeWidth="7"
                    strokeDasharray={`${(score / 100) * circ} ${circ - (score / 100) * circ}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-neutral-900 dark:text-white leading-none">{score}</span>
                <span className="text-[10px] text-neutral-500 leading-none mt-0.5">/ 100</span>
            </div>
        </div>
    );
}

// ─── Detail Slide Panel ───────────────────────────────────────────────────────
function DriverPanel({ driver, onClose }: { driver: Driver; onClose: () => void }) {
    const { trips } = useFleetStore();
    const dTrips = trips.filter((t) => t.driverId === driver.id);
    const comp = dTrips.filter((t) => t.status === TripStatus.COMPLETED).length;
    const canc = dTrips.filter((t) => t.status === TripStatus.CANCELLED).length;
    const disp = dTrips.filter((t) => t.status === TripStatus.DISPATCHED).length;
    const rate = dTrips.length > 0 ? Math.round((comp / dTrips.length) * 100) : 0;
    const expired = new Date(driver.licenseExpiry) < new Date();
    const days = daysUntil(driver.licenseExpiry);

    const statusCfg: Record<string, { label: string; cls: string }> = {
        [DriverStatus.ON_DUTY]: { label: 'On Duty', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' },
        [DriverStatus.OFF_DUTY]: { label: 'Off Duty', cls: 'bg-neutral-700/40 text-neutral-400 border-neutral-700' },
        [DriverStatus.SUSPENDED]: { label: 'Suspended', cls: 'bg-rose-500/10 text-rose-400 border-rose-500/25' },
        [DriverStatus.ON_TRIP]: { label: 'On Trip', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/25' },
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-400 flex items-center justify-center text-neutral-950 font-bold text-xl">
                            {driver.firstName[0]}{driver.lastName[0]}
                        </div>
                        <div>
                            <p className="text-lg font-bold text-neutral-900 dark:text-white">{driver.firstName} {driver.lastName}</p>
                            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium inline-block mt-1 ${statusCfg[driver.status].cls}`}>
                                {statusCfg[driver.status].label}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Safety Score */}
                    <div className="flex items-center gap-6 p-4 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                        <SafetyGauge score={driver.safetyScore} />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
                                {driver.safetyScore >= 90 ? '🏆 Excellent Driver' : driver.safetyScore >= 70 ? '⚠ Average Performance' : '🚨 Requires Intervention'}
                            </p>
                            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all ${driver.safetyScore >= 90 ? 'bg-emerald-500' : driver.safetyScore >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                    style={{ width: `${driver.safetyScore}%` }} />
                            </div>
                            <div className="flex justify-between text-xs text-neutral-500 mt-1"><span>0</span><span>100</span></div>
                        </div>
                    </div>

                    {/* License */}
                    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${expired ? 'bg-rose-500/10 border-rose-500/25 text-rose-400' : days <= 90 ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'}`}>
                        <CalendarDays className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold">
                                {expired ? '⛔ License EXPIRED' : days <= 90 ? `⚠ Expires in ${days} days` : '✓ License Valid'}
                            </p>
                            <p className="text-xs opacity-80 mt-0.5">Expiry: {new Date(driver.licenseExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>

                    {/* Trip Stats */}
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { label: 'Total', value: dTrips.length, color: 'text-neutral-300' },
                            { label: 'Completed', value: comp, color: 'text-emerald-400' },
                            { label: 'Active', value: disp, color: 'text-blue-400' },
                            { label: 'Cancelled', value: canc, color: 'text-rose-400' },
                        ].map((s) => (
                            <div key={s.label} className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3 text-center border border-neutral-200 dark:border-neutral-800">
                                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                                <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Completion rate bar */}
                    {dTrips.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between text-sm mb-1.5">
                                <span className="text-neutral-600 dark:text-neutral-400 font-medium">Completion Rate</span>
                                <span className={`font-bold ${rate >= 80 ? 'text-emerald-400' : rate >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>{rate}%</span>
                            </div>
                            <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${rate >= 80 ? 'bg-emerald-500' : rate >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                    style={{ width: `${rate}%` }} />
                            </div>
                        </div>
                    )}

                    {/* Adjustment note */}
                    <div className="flex items-start gap-2 px-3 py-2.5 bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs text-neutral-500 dark:text-neutral-500">
                        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>Safety score adjustments require Management approval. Contact the Fleet Manager to modify scores.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SafetyDriversPage() {
    const { drivers, trips } = useFleetStore();
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<DriverStatus | 'ALL'>('ALL');
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

    const enriched = useMemo(() => drivers.map((d) => {
        const dt = trips.filter((t) => t.driverId === d.id);
        const comp = dt.filter((t) => t.status === TripStatus.COMPLETED).length;
        const rate = dt.length > 0 ? Math.round((comp / dt.length) * 100) : 0;
        const expired = new Date(d.licenseExpiry) < new Date();
        const days = daysUntil(d.licenseExpiry);
        return { ...d, totalTrips: dt.length, completed: comp, completionRate: rate, expired, daysLeft: days };
    }), [drivers, trips]);

    const filtered = enriched.filter((d) => {
        const name = `${d.firstName} ${d.lastName}`.toLowerCase();
        return name.includes(search.toLowerCase()) && (filterStatus === 'ALL' || d.status === filterStatus);
    });

    const scoreRanked = [...enriched].sort((a, b) => b.safetyScore - a.safetyScore);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Driver Safety Profiles</h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">Individual driver performance, safety scores, and license status.</p>
            </div>

            {/* Alerts */}
            {enriched.filter((d) => d.expired).length > 0 && (
                <div className="flex items-center gap-3 px-5 py-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-400 text-sm">
                    <ShieldX className="w-4 h-4 shrink-0" />
                    <strong>{enriched.filter((d) => d.expired).length}</strong>&nbsp;driver(s) with expired licenses — dispatch blocked.
                </div>
            )}

            {/* Top 3 performers leaderboard */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {scoreRanked.slice(0, 3).map((d, i) => (
                    <button key={d.id} onClick={() => setSelectedDriver(d)}
                        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex items-center gap-4 hover:border-amber-300 dark:hover:border-amber-500/30 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-all text-left group shadow-sm dark:shadow-none">
                        <div className="relative">
                            <SafetyGauge score={d.safetyScore} />
                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-900 dark:text-white">
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                            </div>
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-neutral-900 dark:text-white truncate">{d.firstName} {d.lastName}</p>
                            <p className="text-xs text-neutral-500 mt-0.5">{d.completionRate}% completion · {d.totalTrips} trips</p>
                            <span className={`text-xs font-medium ${d.safetyScore >= 90 ? 'text-emerald-400' : d.safetyScore >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
                                {d.safetyScore >= 90 ? '⭐ Top Performer' : d.safetyScore >= 70 ? 'Average' : '⚠ Review Needed'}
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                        placeholder="Search driver name…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="relative">
                    <select className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-4 pr-9 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 focus:outline-none appearance-none cursor-pointer"
                        value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as DriverStatus | 'ALL')}>
                        <option value="ALL">All Statuses</option>
                        <option value={DriverStatus.ON_DUTY}>On Duty</option>
                        <option value={DriverStatus.OFF_DUTY}>Off Duty</option>
                        <option value={DriverStatus.SUSPENDED}>Suspended</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                </div>
            </div>

            {/* Driver cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((d) => {
                    const statusCls = d.status === DriverStatus.ON_DUTY ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10'
                        : d.status === DriverStatus.SUSPENDED ? 'text-rose-400 border-rose-500/25 bg-rose-500/10'
                            : 'text-neutral-400 border-neutral-700 bg-neutral-700/40';

                    return (
                        <div key={d.id}>
                            <button onClick={() => setSelectedDriver(d)}
                                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 text-left hover:border-neutral-300 dark:hover:border-neutral-700 transition-all group shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none w-full">
                                {/* Top row */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-400 flex items-center justify-center text-neutral-950 font-bold">
                                            {d.firstName[0]}{d.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-neutral-900 dark:text-white">{d.firstName} {d.lastName}</p>
                                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${statusCls}`}>
                                                {d.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Score badge */}
                                    <div className={`text-lg font-bold px-3 py-1 rounded-xl border ${d.safetyScore >= 90 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : d.safetyScore >= 70 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' : 'text-rose-400 border-rose-500/30 bg-rose-500/10'}`}>
                                        {d.safetyScore}
                                    </div>
                                </div>

                                {/* Score bar */}
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs text-neutral-500 mb-1">
                                        <span>Safety Score</span><span>{d.safetyScore}/100</span>
                                    </div>
                                    <div className="h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${d.safetyScore >= 90 ? 'bg-emerald-500' : d.safetyScore >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                            style={{ width: `${d.safetyScore}%` }} />
                                    </div>
                                </div>

                                {/* Trip completion */}
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs text-neutral-500 mb-1">
                                        <span>Trip Completion</span><span>{d.totalTrips > 0 ? `${d.completionRate}%` : 'No trips'}</span>
                                    </div>
                                    {d.totalTrips > 0 && (
                                        <div className="h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${d.completionRate >= 80 ? 'bg-emerald-500' : d.completionRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                style={{ width: `${d.completionRate}%` }} />
                                        </div>
                                    )}
                                </div>

                                {/* License row */}
                                <div className={`flex items-center gap-1.5 text-xs font-medium ${d.expired ? 'text-rose-400' : d.daysLeft <= 90 ? 'text-amber-400' : 'text-neutral-500'}`}>
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    {d.expired ? '⛔ License Expired' : d.daysLeft <= 90 ? `License expires in ${d.daysLeft} days` : `License valid · ${new Date(d.licenseExpiry).toLocaleDateString('en-IN')}`}
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="flex flex-col items-center py-16 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm dark:shadow-none">
                    <Users className="w-10 h-10 text-neutral-400 dark:text-neutral-700 mb-3" />
                    <p className="text-neutral-500">No drivers match the filter.</p>
                </div>
            )}

            {selectedDriver && <DriverPanel driver={selectedDriver} onClose={() => setSelectedDriver(null)} />}
        </div>
    );
}
