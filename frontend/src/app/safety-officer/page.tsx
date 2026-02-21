'use client';

import { useMemo } from 'react';
import { useFleetStore } from '@/store/useFleetStore';
import { DriverStatus, TripStatus } from '@/types';
import { ShieldCheck, ShieldX, AlertTriangle, Users, Ban, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

function daysUntil(d: string) { return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000); }

// ─── KPI Card ──────────────────────────────────────────────────────────────
function KpiCard({
    title,
    value,
    icon: Icon,
    color,
    bg,
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    bg: string;
}) {
    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-500">{title}</p>
                <div className={`p-2 rounded-xl ${bg}`}><Icon className={`w-4 h-4 ${color}`} /></div>
            </div>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
    );
}

// ─── Quick Access Card ──────────────────────────────────────────────────────
function QuickAccessCard({
    title,
    description,
    href,
    icon: Icon,
    count,
    accent,
}: {
    title: string;
    description: string;
    href: string;
    icon: React.ElementType;
    count?: string | number;
    accent: string;
}) {
    return (
        <Link href={href}
            className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-amber-300 dark:hover:border-amber-700 transition-all shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${accent}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors" />
            </div>
            <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{title}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{description}</p>
                {count !== undefined && (
                    <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mt-2">{count}</p>
                )}
            </div>
        </Link>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function SafetyOverview() {
    const { drivers, trips } = useFleetStore();

    const enriched = useMemo(() => drivers.map((d) => {
        const dTrips = trips.filter((t) => t.driverId === d.id);
        const completed = dTrips.filter((t) => t.status === TripStatus.COMPLETED).length;
        const rate = dTrips.length > 0 ? Math.round((completed / dTrips.length) * 100) : 0;
        const expired = new Date(d.licenseExpiry) < new Date();
        const days = daysUntil(d.licenseExpiry);
        return { ...d, completionRate: rate, totalTrips: dTrips.length, expired, daysLeft: days };
    }), [drivers, trips]);

    const avgScore = drivers.length > 0 ? Math.round(drivers.reduce((s, d) => s + d.safetyScore, 0) / drivers.length) : 0;
    const expiredCount = enriched.filter((d) => d.expired).length;
    const soonCount = enriched.filter((d) => !d.expired && d.daysLeft <= 90).length;
    const suspendedCount = drivers.filter((d) => d.status === DriverStatus.SUSPENDED).length;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Safety Overview</h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">Key compliance metrics. Drill into Driver Safety or Compliance for full details.</p>
            </div>

            {/* Alerts */}
            {expiredCount > 0 && (
                <div className="flex items-center justify-between gap-4 px-5 py-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 rounded-xl text-rose-800 dark:text-rose-400 text-sm">
                    <div className="flex items-center gap-3">
                        <ShieldX className="w-4 h-4 shrink-0" />
                        <strong>{expiredCount} driver{expiredCount > 1 ? 's' : ''}</strong> with expired licenses — blocked from dispatch.
                    </div>
                    <Link href="/safety-officer/compliance" className="text-xs font-semibold hover:underline flex items-center gap-1 shrink-0">
                        View compliance <ArrowUpRight className="w-3 h-3" />
                    </Link>
                </div>
            )}
            {soonCount > 0 && (
                <div className="flex items-center justify-between gap-4 px-5 py-3.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 rounded-xl text-amber-800 dark:text-amber-400 text-sm">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <strong>{soonCount} driver{soonCount > 1 ? 's' : ''}</strong> with licenses expiring within 90 days.
                    </div>
                    <Link href="/safety-officer/compliance" className="text-xs font-semibold hover:underline flex items-center gap-1 shrink-0">
                        View compliance <ArrowUpRight className="w-3 h-3" />
                    </Link>
                </div>
            )}

            {/* KPI Grid */}
            <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-500 mb-4">Key Metrics</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <KpiCard
                        title="Total Drivers"
                        value={drivers.length}
                        icon={Users}
                        color="text-blue-600 dark:text-blue-400"
                        bg="bg-blue-50 dark:bg-blue-500/10"
                    />
                    <KpiCard
                        title="Avg Safety Score"
                        value={`${avgScore}/100`}
                        icon={ShieldCheck}
                        color="text-emerald-600 dark:text-emerald-400"
                        bg="bg-emerald-50 dark:bg-emerald-500/10"
                    />
                    <KpiCard
                        title="Expired Licenses"
                        value={expiredCount}
                        icon={ShieldX}
                        color="text-rose-600 dark:text-rose-400"
                        bg="bg-rose-50 dark:bg-rose-500/10"
                    />
                    <KpiCard
                        title="Suspended"
                        value={suspendedCount}
                        icon={Ban}
                        color="text-neutral-600 dark:text-neutral-400"
                        bg="bg-neutral-100 dark:bg-neutral-700/40"
                    />
                </div>
            </section>

            {/* Quick Access */}
            <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-500 mb-4">Quick Access</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <QuickAccessCard
                        title="Driver Safety"
                        description="Safety scores, license status, and trip completion"
                        href="/safety-officer/drivers"
                        icon={Users}
                        count={`${drivers.length} drivers`}
                        accent="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    />
                    <QuickAccessCard
                        title="Compliance Register"
                        description="License validity, risk levels, and compliance status"
                        href="/safety-officer/compliance"
                        icon={ShieldCheck}
                        count={`${expiredCount} expired · ${soonCount} expiring soon`}
                        accent="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    />
                </div>
            </section>
        </div>
    );
}
