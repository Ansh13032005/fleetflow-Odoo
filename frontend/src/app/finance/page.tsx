'use client';

import { useFleetStore } from '@/store/useFleetStore';
import { IndianRupee, Fuel, Wrench, TrendingDown, BarChart3, Download, FileText, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

function fmt(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }

// ─── Quick Access Card ──────────────────────────────────────────────────────
function QuickAccessCard({
    title,
    description,
    href,
    icon: Icon,
    accent,
}: {
    title: string;
    description: string;
    href: string;
    icon: React.ElementType;
    accent: string;
}) {
    return (
        <Link href={href}
            className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-purple-300 dark:hover:border-purple-700 transition-all shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-none flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${accent}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors" />
            </div>
            <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{title}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{description}</p>
            </div>
        </Link>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function FinanceOverview() {
    const { vehicles, expenseLogs, maintenanceLogs } = useFleetStore();

    const totalFuel = expenseLogs.reduce((s, l) => s + l.fuelCost, 0);
    const totalMaint = maintenanceLogs.reduce((s, l) => s + l.cost, 0);
    const totalOp = totalFuel + totalMaint;
    const totalLitres = expenseLogs.reduce((s, l) => s + l.fuelLiters, 0);
    const totalKm = expenseLogs.reduce((s, l) => s + (l.distanceKm ?? 0), 0);
    const fleetKmL = totalLitres > 0 && totalKm > 0 ? Math.round((totalKm / totalLitres) * 100) / 100 : null;

    const kpis = [
        { label: 'Total Fuel Cost', value: fmt(totalFuel), icon: Fuel, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
        { label: 'Total Maintenance', value: fmt(totalMaint), icon: Wrench, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
        { label: 'Total Op Cost', value: fmt(totalOp), icon: IndianRupee, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
        { label: 'Fleet Efficiency', value: fleetKmL ? `${fleetKmL} km/L` : '—', icon: TrendingDown, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Financial Overview</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5">Key expenditure metrics. Drill into Expenses, Analytics, or Reports for details.</p>
                </div>
                <Link href="/finance/reports" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-medium transition-colors">
                    <Download className="w-4 h-4" /> Export Reports
                </Link>
            </div>

            {/* KPI Grid */}
            <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-500 mb-4">Key Metrics</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {kpis.map((k) => (
                        <div key={k.label} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-sm dark:shadow-none">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-500">{k.label}</p>
                                <div className={`p-2 rounded-xl ${k.bg}`}><k.icon className={`w-4 h-4 ${k.color}`} /></div>
                            </div>
                            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Quick Access */}
            <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-500 mb-4">Quick Access</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <QuickAccessCard
                        title="Expenses"
                        description="Fuel ledger, cost logs, and per-vehicle breakdown"
                        href="/finance/expenses"
                        icon={Fuel}
                        accent="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    />
                    <QuickAccessCard
                        title="Analytics"
                        description="Cost distribution, efficiency, and km/L analysis"
                        href="/finance/analytics"
                        icon={BarChart3}
                        accent="bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400"
                    />
                    <QuickAccessCard
                        title="Reports"
                        description="Download CSV reports for audit and analysis"
                        href="/finance/reports"
                        icon={FileText}
                        accent="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    />
                </div>
            </section>
        </div>
    );
}
