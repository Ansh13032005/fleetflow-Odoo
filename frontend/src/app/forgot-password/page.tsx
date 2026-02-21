'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { KeyRound, Moon, Sun, ArrowRight, ShieldAlert, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { theme, toggleTheme } = useThemeStore();

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoading(false);
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-300 relative overflow-hidden">

            <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-purple-100/50 dark:from-purple-900/10 to-transparent pointer-events-none" />

            {/* Theme Toggle Button */}
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
                            <KeyRound className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3">Reset Authentication</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                            Enter the email associated with your profile, and we&apos;ll send you an authorization link to reset your credentials.
                        </p>
                    </div>

                    {!submitted ? (
                        <form onSubmit={handleResetRequest} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 ml-1">Working Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="agent@fleetflow.com"
                                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-4 py-3.5 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-purple-500 hover:bg-purple-600 dark:hover:bg-purple-400 text-white dark:text-neutral-950 font-bold py-4 rounded-xl mt-6 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Locating Credentials...
                                    </>
                                ) : (
                                    <>
                                        Send Recovery Link <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center">
                            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-5 mb-8">
                                <ShieldAlert className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300 mb-2">Instructions Sent</h3>
                                <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed">
                                    If an active terminal account exists for <strong>{email}</strong>, you will receive an authorization reset node shortly.
                                </p>
                            </div>

                            {/* Demo Hack: In a real app this would happen via email link, but we provide it here for demo purposes */}
                            <button
                                onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}
                                className="w-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 font-bold py-4 rounded-xl transition-all"
                            >
                                [DEMO] Simulate Email Click
                            </button>
                        </div>
                    )}

                </div>

                <p className="mt-8 text-center text-sm text-neutral-500 font-medium">
                    <Link href="/login" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
                        ← Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
