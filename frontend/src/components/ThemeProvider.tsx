'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useThemeStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
            } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
            }
        }
    }, [theme, mounted]);

    // Prevent hydration mismatch by initially rendering without the class or ignoring it
    // But wait, the best way in Next is to use an empty wrapper or just return children.
    // Next.js will inject the theme. 
    if (!mounted) {
        return <>{children}</>;
    }

    return <>{children}</>;
}
