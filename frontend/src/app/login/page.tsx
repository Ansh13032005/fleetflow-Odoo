'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { login } from '@/services/api';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthMessage from '@/components/auth/AuthMessage';
import { Truck, ShieldCheck, TrendingUp, Loader2, Lock, Mail, ChevronRight } from 'lucide-react';
import { Role } from '@/types';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [sessionMessage, setSessionMessage] = useState('');

    useEffect(() => {
        const expired = searchParams.get('expired');
        const reset = searchParams.get('reset');
        const verified = searchParams.get('verified');
        const registered = searchParams.get('registered');
        if (expired) setSessionMessage('Your session expired. Please sign in again.');
        else if (reset) setSessionMessage('Password reset successful. Please sign in.');
        else if (verified) setSessionMessage('Email verified. You can now sign in.');
        else if (registered) setSessionMessage('Account created. Verify your email, then sign in.');
        else setSessionMessage('');
    }, [searchParams]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const data = await login(email, password);
            setAuth(data.user, data.access_token);

            // Redirect based on role (must match backend Role enum)
            const role = data.user.role;
            if (role === Role.MANAGER) router.push('/manager');
            else if (role === Role.DISPATCHER) router.push('/dispatcher');
            else if (role === Role.SAFETY_OFFICER) router.push('/safety-officer');
            else if (role === Role.FINANCIAL_ANALYST) router.push('/finance');
            else router.push('/manager');

        } catch (err: any) {
            setError(err.message || 'Invalid email or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title={
                <h1 className="text-5xl font-mono font-bold tracking-tight mb-6 leading-tight text-neutral-900 dark:text-neutral-200">
                    Intelligent <br />
                    <span className="text-emerald-600 dark:text-emerald-400">Fleet Operations</span>
                    <br />
                    Built for Scale.
                </h1>
            }
            subtitle="Optimize asset lifecycles, monitor driver safety, and track financial performance all in one unified command center."
            cards={[
                { title: 'Safety First', description: 'Automated compliance tracking & driver monitoring.', icon: ShieldCheck },
                { title: 'Cost Control', description: 'Granular expense tracking and ROI analytics.', icon: TrendingUp },
            ]}
        >
            <div>
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
                        <div className="bg-emerald-500 p-2.5 rounded-xl">
                            <Truck className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Fleetflow.</span>
                    </div>

                    <div className="text-center lg:text-left mb-10">
                        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2">Welcome Back</h2>
                        <p className="text-neutral-500 dark:text-neutral-400 font-medium font-sans">Login to your fleet cockpit to manage operations.</p>
                    </div>

                    {sessionMessage && (
                        <AuthMessage variant="info" className="mb-6">{sessionMessage}</AuthMessage>
                    )}
                    {error && (
                        <AuthMessage variant="error" className="mb-6">{error}</AuthMessage>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@fleetflow.com"
                                    required
                                    className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl pl-12 pr-4 py-3.5 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Password</label>
                                <Link href="/forgot-password" className="text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:underline">
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl pl-12 pr-4 py-3.5 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm font-medium"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 font-bold py-4 rounded-xl mt-6 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In <ChevronRight className="w-4 h-4 ml-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 flex items-center gap-4">
                        <div className="h-px flex-1 bg-neutral-200 dark:border-neutral-800"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">OR</span>
                        <div className="h-px flex-1 bg-neutral-200 dark:border-neutral-800"></div>
                    </div>

                    <p className="mt-8 text-center text-sm text-neutral-500 font-medium">
                        System authorized for registered personnel only.{` `}
                        <Link href="/register" className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold">
                            Request Enrollment
                        </Link>
                    </p>

                    <p className="mt-4 text-center">
                        <Link href="/otp" className="text-xs text-neutral-400 hover:text-emerald-500 font-bold transition-colors">
                            Login with OTP instead
                        </Link>
                    </p>
                </div>
        </AuthLayout>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-neutral-50 dark:bg-neutral-900" />}>
            <LoginForm />
        </Suspense>
    );
}
