'use client';

import { useEffect } from 'react';
import { useFleetStore } from '@/store/useFleetStore';
import { useAuthStore } from '@/store/useAuthStore';
import { TripStatus, VehicleStatus, DriverStatus } from '@/types';
import { Zap, Truck, Users, AlertTriangle, Route, ArrowUpRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

// ─── KPI Card ──────────────────────────────────────────────────────────────
function KpiCard({
    title,
    value,
    sub,
    icon: Icon,
    color,
    bg,
}: {
    title: string;
    value: string | number;
    sub?: string;
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
            {sub && <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{sub}</p>}
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
            className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${accent}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
            </div>
            <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{description}</p>
                {count !== undefined && (
                    <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mt-2">{count}</p>
                )}
            </div>
        </Link>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function DispatcherOverview() {
    const { token } = useAuthStore();
    const { vehicles, drivers, trips, fetchVehicles, fetchDrivers, isLoading, error } = useFleetStore();

    useEffect(() => {
        if (token) {
            fetchVehicles(token);
            fetchDrivers(token);
        }
    }, [token, fetchVehicles, fetchDrivers]);

    const available = vehicles.filter((v) => v.status === VehicleStatus.AVAILABLE).length;
    const onTrip = vehicles.filter((v) => v.status === VehicleStatus.ON_TRIP).length;
    const inShop = vehicles.filter((v) => v.status === VehicleStatus.IN_SHOP).length;
    const onDuty = drivers.filter((d) => d.status === DriverStatus.ON_DUTY).length;
    const draftTrips = trips.filter((t) => t.status === TripStatus.DRAFT);
    const activeTrips = trips.filter((t) => t.status === TripStatus.DISPATCHED);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Dispatcher Overview</h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">Real-time snapshot of fleet assets. Use the sections below to dispatch trips or view details.</p>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 text-rose-600 dark:text-rose-400 text-sm font-medium">
                    Error syncing fleet data: {error}
                </div>
            )}

            {/* KPI Grid */}
            <section className="relative min-h-[140px]">
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-500 mb-4">Key Metrics</h2>
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-2xl z-10">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                ) : null}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <KpiCard
                        title="Available Vehicles"
                        value={available}
                        sub="Ready for dispatch"
                        icon={Truck}
                        color="text-emerald-600 dark:text-emerald-400"
                        bg="bg-emerald-50 dark:bg-emerald-500/10"
                    />
                    <KpiCard
                        title="Vehicles On Trip"
                        value={onTrip}
                        sub="Currently en route"
                        icon={Route}
                        color="text-blue-600 dark:text-blue-400"
                        bg="bg-blue-50 dark:bg-blue-500/10"
                    />
                    <KpiCard
                        title="In Shop"
                        value={inShop}
                        sub="Under maintenance"
                        icon={AlertTriangle}
                        color="text-amber-600 dark:text-amber-400"
                        bg="bg-amber-50 dark:bg-amber-500/10"
                    />
                    <KpiCard
                        title="On-Duty Drivers"
                        value={onDuty}
                        sub={`of ${drivers.length} total`}
                        icon={Users}
                        color="text-purple-600 dark:text-purple-400"
                        bg="bg-purple-50 dark:bg-purple-500/10"
                    />
                </div>
            </section>

            {/* Quick Access */}
            <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-500 mb-4">Quick Access</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <QuickAccessCard
                        title="Trip Dispatcher"
                        description="Create drafts, dispatch trips, and track active cargo"
                        href="/dispatcher/trips"
                        icon={Zap}
                        count={`${draftTrips.length} drafts · ${activeTrips.length} active`}
                        accent="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    />
                    <QuickAccessCard
                        title="Vehicles"
                        description="View fleet availability and status"
                        href="/dispatcher/vehicles"
                        icon={Truck}
                        count={`${vehicles.length} total`}
                        accent="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    />
                    <QuickAccessCard
                        title="Drivers"
                        description="Check driver status and license validity"
                        href="/dispatcher/drivers"
                        icon={Users}
                        count={`${onDuty} on duty`}
                        accent="bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400"
                    />
                </div>
            </section>
        </div>
    );
}
