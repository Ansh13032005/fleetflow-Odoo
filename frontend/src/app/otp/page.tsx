'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { verifyOtp, requestOtp } from '@/services/api';
import { Loader2, Moon, Sun, ArrowRight, ShieldCheck, MailOpen, Mail } from 'lucide-react';
import Link from 'next/link';
import { Role } from '@/types';

function OTPForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get('email') || '';
    const [email, setEmail] = useState(emailParam);
    const [emailSent, setEmailSent] = useState(!!emailParam);
    const [requestError, setRequestError] = useState('');
    const { theme, toggleTheme } = useThemeStore();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isResending, setIsResending] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6).split('');
        if (data.length > 0) {
            const newOtp = [...otp];
            data.forEach((char, idx) => {
                if (idx < 6) newOtp[idx] = char;
            });
            setOtp(newOtp);
            const focusIndex = Math.min(data.length, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) return;

        setIsLoading(true);
        setError('');

        try {
            const data = await verifyOtp(email, code);
            setAuth(data.user, data.access_token);

            // Redirect based on role (must match backend Role enum)
            const role = data.user.role;
            if (role === Role.MANAGER) router.push('/manager');
            else if (role === Role.DISPATCHER) router.push('/dispatcher');
            else if (role === Role.SAFETY_OFFICER) router.push('/safety-officer');
            else if (role === Role.FINANCIAL_ANALYST) router.push('/finance');
            else router.push('/manager');
        } catch (err: any) {
            setError(err.message || 'Invalid or expired code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const em = email.trim();
        if (!em) {
            setRequestError('Please enter your email address.');
            return;
        }
        setIsResending(true);
        setRequestError('');
        try {
            await requestOtp(em);
            setEmail(em);
            setEmailSent(true);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err: any) {
            setRequestError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setError('');
        try {
            await requestOtp(email);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err: any) {
            setError('Failed to resend code. Please try again later.');
        } finally {
            setIsResending(false);
        }
    };

    if (!emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-300 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-blue-100/50 dark:from-blue-900/10 to-transparent pointer-events-none" />
                <button onClick={toggleTheme} className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-white dark:bg-neutral-800 shadow-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:scale-105 active:scale-95 transition-all">
                    {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-500" />}
                </button>
                <div className="w-full max-w-lg relative z-10">
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="bg-blue-500 p-3.5 rounded-2xl shadow-lg shadow-blue-500/30 mb-6">
                                <Mail className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3">Login with OTP</h1>
                            <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                                Enter your email to receive a one-time login code.
                            </p>
                        </div>
                        {requestError && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium text-center">
                                {requestError}
                            </div>
                        )}
                        <form onSubmit={handleRequestOtp} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setRequestError(''); }}
                                    placeholder="you@fleetflow.com"
                                    className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-xl px-4 py-3.5 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-medium"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isResending}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                            >
                                {isResending ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : <>Send OTP <ArrowRight className="w-5 h-5" /></>}
                            </button>
                        </form>
                        <p className="mt-8 text-center text-sm text-neutral-500 font-medium">
                            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">← Back to Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-300 relative overflow-hidden">

            <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-blue-100/50 dark:from-blue-900/10 to-transparent pointer-events-none" />

            {/* Theme Toggle Button */}
            <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-white dark:bg-neutral-800 shadow-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:scale-105 active:scale-95 transition-all"
            >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-500" />}
            </button>

            <div className="w-full max-w-lg relative z-10">
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-12 shadow-2xl dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">

                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="bg-blue-500 p-3.5 rounded-2xl shadow-lg shadow-blue-500/30 mb-6">
                            <MailOpen className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3">Security Checkpoint</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                            To secure your terminal workspace, please enter the 6-digit authorization code sent to
                            <br /><span className="text-neutral-900 dark:text-white font-bold mt-1 inline-block">{email || 'your email'}</span>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleVerify} className="space-y-8">

                        <div className="flex justify-between gap-2 sm:gap-4" onPaste={handlePaste}>
                            {otp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    ref={(el) => { inputRefs.current[idx] = el; }}
                                    value={digit}
                                    onChange={(e) => handleChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                                />
                            ))}
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4 flex items-start gap-3 mt-4">
                            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
                                Code expires in 10 minutes. Do not share this authorization node with anyone outside your organization.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || otp.join('').length < 6}
                            className="w-full bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-400 text-white dark:text-neutral-950 font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Verifying Trust...
                                </>
                            ) : (
                                <>
                                    Authenticate Device <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm font-medium">
                        <button
                            onClick={handleResend}
                            disabled={isResending}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-bold disabled:opacity-50"
                        >
                            {isResending ? 'Sending...' : 'Resend Authorization Code'}
                        </button>
                    </div>
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

// NextJS expects pages using useSearchParams to be wrapped in a suspense boundary if static rendering is expected
export default function OTPPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-neutral-50 dark:bg-neutral-950" />}>
            <OTPForm />
        </Suspense>
    );
}
