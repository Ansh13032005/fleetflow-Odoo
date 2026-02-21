'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register as registerApi } from '@/services/api';
import { Role } from '@/types';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthMessage from '@/components/auth/AuthMessage';
import { Truck, ShieldCheck, Database, Loader2, ArrowRight, User, Mail, Building2, Lock, CheckCircle2 } from 'lucide-react';

const ROLE_OPTIONS: { value: Role; label: string; desc: string }[] = [
    { value: Role.MANAGER, label: 'Fleet Manager', desc: 'Vehicles, assets & scheduling' },
    { value: Role.DISPATCHER, label: 'Dispatcher', desc: 'Trips & driver assignment' },
    { value: Role.SAFETY_OFFICER, label: 'Safety Officer', desc: 'Compliance & driver safety' },
    { value: Role.FINANCIAL_ANALYST, label: 'Financial Analyst', desc: 'Fuel, maintenance & costs' },
];

const inputBase =
    'w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl pl-12 pr-4 py-3.5 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm font-medium';

export default function RegisterPage() {
    const router = useRouter();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [role, setRole] = useState<Role>(Role.MANAGER);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setIsLoading(true);
        try {
            await registerApi(email, password, firstName, lastName, role);
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            title={
                <>
                    <h1 className="text-5xl font-mono font-bold tracking-tight mb-6 leading-tight text-neutral-900 dark:text-neutral-200">
                        Modernize <br />
                        <span className="text-emerald-600 dark:text-emerald-400">Your Logistics</span>
                        <br />
                        Deploy in Minutes.
                    </h1>
                </>
            }
            subtitle="Create your organization's dedicated terminal to instantly unlock real-time tracking, AI-driven dispatch, and financial analytics."
            cards={[
                { title: 'Enterprise Grade', description: 'Bank-level security and compliance baked in.', icon: ShieldCheck },
                { title: 'Data Sovereignty', description: 'Complete control over your fleet operational data.', icon: Database },
            ]}
        >
            <div className="py-8 lg:py-0">
                    <div className="text-center lg:text-left mb-8">
                        Create your organization’s
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-1.5">Request Enrollment</h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Select your role and complete registration for secure access.</p>
                    </div>

                    {error && (
                        <AuthMessage variant="error" className="mb-6">{error}</AuthMessage>
                    )}

                    <form onSubmit={handleRegister} className="space-y-5">
                        {/* Personal Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">First Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Jane"
                                        className={inputBase}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Last Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Doe"
                                        className={inputBase}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Company / Organization</label>
                            <div className="relative group">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="text"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    placeholder="Acme Logistics Inc."
                                    className={inputBase}
                                />
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Role (RBAC)</label>
                            <div className="grid grid-cols-2 gap-2">
                                {ROLE_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setRole(opt.value)}
                                        className={`relative text-left px-3 py-2.5 rounded-xl border transition-all flex flex-col gap-0.5 ${role === opt.value
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 ring-1 ring-emerald-500/50'
                                            : 'border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                                            }`}
                                    >
                                        <span className={`font-medium text-sm ${role === opt.value ? 'text-emerald-700 dark:text-emerald-300' : 'text-neutral-900 dark:text-white'}`}>{opt.label}</span>
                                        <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{opt.desc}</span>
                                        {role === opt.value && <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-emerald-500" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Account Credentials */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="jane@acmelogistics.com"
                                    className={inputBase}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={inputBase}
                                />
                            </div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">Minimum 6 characters</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={`${inputBase} ${confirmPassword && password !== confirmPassword ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}`}
                                />
                            </div>
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-xs text-red-500 font-medium ml-1">Passwords do not match</p>
                            )}
                        </div>

                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed">
                                You&apos;ll be redirected to your role-specific dashboard. Prefer passwordless? Use Login with OTP after registration.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 font-bold py-4 rounded-xl mt-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Request Enrollment <ArrowRight className="w-5 h-5 ml-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-neutral-500 font-medium">
                        Already have an account?{' '}
                        <Link href="/login" className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold">
                            Sign in
                        </Link>
                    </p>
            </div>
        </AuthLayout>
    );
}
