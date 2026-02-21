'use client';

import { CheckCircle2, XCircle, Info } from 'lucide-react';

type Variant = 'success' | 'error' | 'info';

interface AuthMessageProps {
    variant: Variant;
    children: React.ReactNode;
    className?: string;
}

const styles: Record<Variant, string> = {
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
};

const icons: Record<Variant, typeof CheckCircle2> = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
};

export default function AuthMessage({ variant, children, className = '' }: AuthMessageProps) {
    const Icon = icons[variant];
    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-medium ${styles[variant]} ${className}`}
            role="alert"
        >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{children}</span>
        </div>
    );
}
