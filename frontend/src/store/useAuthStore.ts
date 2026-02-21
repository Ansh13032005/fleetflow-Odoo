import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

/** Decode JWT payload and check if expired (with 60s buffer) */
function isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload?.exp;
        if (!exp) return false;
        return Date.now() >= (exp * 1000) - 60_000;
    } catch {
        return true;
    }
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            setAuth: (user: User, token: string) => {
                set({
                    user,
                    token,
                    isAuthenticated: true,
                });
            },
            logout: () => set({ user: null, token: null, isAuthenticated: false }),
        }),
        {
            name: 'auth-storage',
            onRehydrateStorage: () => (state) => {
                if (state?.token && isTokenExpired(state.token)) {
                    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
                }
            },
        }
    )
);
