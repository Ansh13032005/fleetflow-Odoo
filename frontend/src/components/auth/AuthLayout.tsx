'use client';

import Link from 'next/link';
import { useThemeStore } from '@/store/useThemeStore';
import { Truck, ShieldCheck, TrendingUp, Moon, Sun } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    /** Left panel title lines */
    title?: React.ReactNode;
    /** Left panel subtitle */
    subtitle?: string;
    /** Cards for left panel (2 max) */
    cards?: { title: string; description: string; icon: React.ElementType }[];
}

export default function AuthLayout({ children, title, subtitle, cards }: AuthLayoutProps) {
    const { theme, toggleTheme } = useThemeStore();

    return (
        <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-emerald-500/30 transition-colors duration-300">
            <button
                onClick={toggleTheme}
                type="button"
                className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-white dark:bg-neutral-800 shadow-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:scale-105 active:scale-95 transition-all"
            >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-500" />}
            </button>

            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-white dark:bg-neutral-950 flex-col justify-between p-12 lg:p-24 border-r border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
                <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.3),rgba(255,255,255,0))]" />
                <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-emerald-100 to-transparent dark:from-emerald-900/10 dark:to-transparent" />

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3 mb-16 w-fit">
                        <div className="bg-emerald-500 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
                            <Truck className="w-8 h-8 text-white dark:text-neutral-950" />
                        </div>
                        <span className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Fleetflow.</span>
                    </Link>

                    {title ?? (
                        <h1 className="text-5xl font-mono font-bold tracking-tight mb-6 leading-tight text-neutral-900 dark:text-neutral-200">
                            Intelligent <br />
                            <span className="text-emerald-600 dark:text-emerald-400">Fleet Operations</span>
                            <br />
                            Built for Scale.
                        </h1>
                    )}

                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-md font-medium dark:font-light">
                        {subtitle ?? 'Optimize asset lifecycles, monitor driver safety, and track financial performance in one unified command center.'}
                    </p>
                </div>

                {cards && cards.length > 0 && (
                    <div className="relative z-10 grid grid-cols-2 gap-6 opacity-90 dark:opacity-80">
                        {cards.map((card, i) => {
                            const Icon = card.icon;
                            return (
                                <div
                                    key={i}
                                    className="flex items-start gap-4 p-5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 backdrop-blur-md shadow-sm"
                                >
                                    <Icon className="w-6 h-6 text-emerald-500 mt-1 shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">{card.title}</h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{card.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Right Panel - Form Content */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12 overflow-y-auto">
                <div className="w-full max-w-md relative z-10 transition-all">
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="bg-emerald-500 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
                                <Truck className="w-7 h-7 text-white dark:text-neutral-950" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Fleetflow.</span>
                        </Link>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
