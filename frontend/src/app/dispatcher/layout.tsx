'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { Role } from '@/types';
import { Route, Truck, Users, LogOut, Bell, LayoutGrid, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
    { label: 'Overview', icon: LayoutGrid, href: '/dispatcher' },
    { label: 'Trip Dispatcher', icon: Route, href: '/dispatcher/trips' },
    { label: 'Vehicles', icon: Truck, href: '/dispatcher/vehicles' },
    { label: 'Drivers', icon: Users, href: '/dispatcher/drivers' },
];

export default function DispatcherLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const { isAllowed } = useRoleGuard(Role.DISPATCHER);

    if (!isAllowed) return null;

    const pageLabel = navItems.find((i) => i.href === pathname)?.label || 'Overview';

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-200 font-sans flex text-sm transition-colors duration-300">

            <aside className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col shrink-0 transition-colors duration-300">
                <div className="h-16 flex items-center gap-3 px-5 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="bg-blue-500 p-1.5 rounded-lg shrink-0">
                        <Route className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-neutral-900 dark:text-white tracking-tight text-base">Fleetflow.</span>
                </div>

                <div className="px-5 py-3 border-b border-neutral-200 dark:border-neutral-800">
                    <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">Dispatcher</span>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-200'}`}>
                                <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300'}`} />
                                <span className="whitespace-nowrap">{item.label}</span>
                                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
                    <button onClick={() => { logout(); router.push('/login'); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors group">
                        <LogOut className="w-[18px] h-[18px] shrink-0" />
                        <span className="whitespace-nowrap">Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-neutral-500">Dispatcher</span>
                        <span className="text-neutral-400 dark:text-neutral-600">/</span>
                        <span className="text-neutral-900 dark:text-neutral-100 font-medium">{pageLabel}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button className="relative p-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-neutral-950" />
                        </button>
                        <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800" />
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-neutral-900 dark:text-white leading-none">{user?.email?.split('@')[0]}</p>
                                <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wider">Dispatcher</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-blue-400 dark:from-blue-600 dark:to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                {user?.email?.[0]?.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-auto bg-neutral-50 dark:bg-neutral-950 p-8 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </div>
            </main>
        </div>
    );
}
