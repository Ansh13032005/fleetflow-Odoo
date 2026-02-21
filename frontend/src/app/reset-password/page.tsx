'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { KeySquare, Moon, Sun, ArrowRight, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const { theme, toggleTheme } = useThemeStore();

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [matched, setMatched] = useState(true);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirm) {
            setMatched(false);
            return;
        }
        setMatched(true);
        setIsLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoading(false);

        // Redirect to login
        router.push('/login?reset=success');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-300 relative overflow-hidden">

            <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-purple-100/50 dark:from-purple-900/10 to-transparent pointer-events-none" />

            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-white dark:bg-neutral-800 shadow-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:scale-105 active:scale-95 transition-all"
            >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-500" />}
            </button>

            <div className="w-full max-w-xl relative z-10">
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-12 shadow-2xl dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">

                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="bg-purple-500 p-3.5 rounded-2xl shadow-lg shadow-purple-500/30 mb-6">
                            <KeySquare className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3">Install New Credentials</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                            Create a strong, secure password for <span className="text-neutral-900 dark:text-white font-bold">{email || 'your account'}</span>.
                        </p>
                    </div>

                    <form onSubmit={handleReset} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 ml-1">New System Password</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={password} onChange={e => { setPassword(e.target.value); setMatched(true); }}
                                placeholder="••••••••"
                                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-4 py-3.5 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 ml-1">Verify Password</label>
                            <input
                                type="password"
                                required
                                value={confirm} onChange={e => { setConfirm(e.target.value); setMatched(true); }}
                                placeholder="••••••••"
                                className={`w-full bg-neutral-50 dark:bg-neutral-950 border ${!matched ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-neutral-300 dark:border-neutral-800'} rounded-xl px-4 py-3.5 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium`}
                            />
                            {!matched && (
                                <p className="text-rose-500 text-xs font-semibold mt-2 flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Passwords do not match
                                </p>
                            )}
                        </div>

                        <ul className="space-y-2.5 bg-neutral-50 dark:bg-neutral-800/50 px-5 py-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                            {[
                                { text: 'Minimum 8 characters length', passed: password.length >= 8 },
                                { text: 'Contains at least one number', passed: /\d/.test(password) }
                            ].map((req, i) => (
                                <li key={i} className="flex items-center gap-2 text-xs font-medium">
                                    <CheckCircle2 className={`w-4 h-4 ${req.passed ? 'text-emerald-500' : 'text-neutral-400 dark:text-neutral-600'}`} />
                                    <span className={req.passed ? 'text-neutral-900 dark:text-neutral-200' : 'text-neutral-500'}>{req.text}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-purple-500 hover:bg-purple-600 dark:hover:bg-purple-400 text-white dark:text-neutral-950 font-bold py-4 rounded-xl mt-6 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Applying Changes...
                                </>
                            ) : (
                                <>
                                    Finalize Configuration <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="mt-8 text-center text-sm text-neutral-500 font-medium">
                    <Link href="/login" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                        Cancel Recovery Request
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-neutral-50 dark:bg-neutral-950" />}>
            <ResetPasswordForm />
        </Suspense>
    );
}
