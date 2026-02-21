'use client';

import { useState, useRef, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyEmail as verifyEmailApi, resendVerification } from '@/services/api';
import AuthLayout from '@/components/auth/AuthLayout';
import AuthMessage from '@/components/auth/AuthMessage';
import { Loader2, ArrowRight, Mail, CheckCircle2, ShieldCheck as ShieldIcon } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const emailParam = searchParams.get('email') || '';

    const [email, setEmail] = useState(emailParam);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isResending, setIsResending] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (emailParam) setEmail(emailParam);
    }, [emailParam]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
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
            data.forEach((char, idx) => { if (idx < 6) newOtp[idx] = char; });
            setOtp(newOtp);
            inputRefs.current[Math.min(data.length, 5)]?.focus();
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            setError('Please enter the 6-digit code.');
            return;
        }
        if (!email.trim()) {
            setError('Email is missing. Please go back to registration.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await verifyEmailApi(email.trim(), code);
            router.push('/login?verified=1');
        } catch (err: any) {
            setError(err.message || 'Invalid or expired code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email.trim()) return;
        setIsResending(true);
        setError('');
        try {
            await resendVerification(email.trim());
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err: any) {
            setError(err.message || 'Failed to resend code.');
        } finally {
            setIsResending(false);
        }
    };

    if (!emailParam) {
        return (
            <AuthLayout
                title={<h1 className="text-3xl font-mono font-bold tracking-tight text-neutral-900 dark:text-neutral-200">Verify your email</h1>}
                subtitle="This page is only for new registrations. Use the link from your registration email."
                cards={[{ title: 'Secure signup', description: 'We verify your email before you can sign in.', icon: ShieldIcon }]}
            >
                <div className="py-8">
                    <AuthMessage variant="info" className="mb-6">
                        No email provided. Please complete registration first.
                    </AuthMessage>
                    <Link href="/register" className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                        Go to Registration <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title={<h1 className="text-5xl font-mono font-bold tracking-tight mb-6 leading-tight text-neutral-900 dark:text-neutral-200">Verify your <span className="text-emerald-600 dark:text-emerald-400">email</span></h1>}
            subtitle="We sent a 6-digit code to your email. Enter it below to complete registration."
            cards={[
                { title: 'Secure signup', description: 'Email verification keeps your account safe.', icon: ShieldIcon },
                { title: 'One more step', description: 'Then sign in and access your dashboard.', icon: CheckCircle2 },
            ]}
        >
            <div className="py-8 lg:py-0">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 mb-6">
                    <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">{email}</span>
                </div>

                {error && <AuthMessage variant="error" className="mb-6">{error}</AuthMessage>}

                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 block mb-2">Verification code</label>
                        <div className="flex justify-between gap-2" onPaste={handlePaste}>
                            {otp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    ref={(el) => { inputRefs.current[idx] = el; }}
                                    value={digit}
                                    onChange={(e) => handleChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    className="w-12 h-14 text-center text-2xl font-bold bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                                />
                            ))}
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">Code expires in 10 minutes</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || otp.join('').length < 6}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                    >
                        {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : <>Verify & continue to sign in <ArrowRight className="w-5 h-5" /></>}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-neutral-500">
                    Didn&apos;t receive the code?{' '}
                    <button type="button" onClick={handleResend} disabled={isResending} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline disabled:opacity-50">
                        {isResending ? 'Sending...' : 'Resend code'}
                    </button>
                </p>

                <p className="mt-8 text-center text-sm">
                    <Link href="/login" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white">Back to sign in</Link>
                </p>
            </div>
        </AuthLayout>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center" />}>
            <VerifyEmailForm />
        </Suspense>
    );
}
