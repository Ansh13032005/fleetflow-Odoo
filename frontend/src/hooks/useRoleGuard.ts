import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Role } from '@/types';

const DASHBOARD_BY_ROLE: Record<Role, string> = {
  [Role.MANAGER]: '/manager',
  [Role.DISPATCHER]: '/dispatcher',
  [Role.SAFETY_OFFICER]: '/safety-officer',
  [Role.FINANCIAL_ANALYST]: '/finance',
};

/**
 * Protects a route by ensuring the user is authenticated and has the expected role.
 * Redirects to login if not authenticated, or to the user's correct dashboard if wrong role.
 */
export function useRoleGuard(expectedRole: Role) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role && user.role !== expectedRole) {
      const correctDashboard = DASHBOARD_BY_ROLE[user.role as Role];
      router.replace(correctDashboard);
    }
  }, [isAuthenticated, user?.role, expectedRole, router]);

  const isAllowed = isAuthenticated && user?.role === expectedRole;
  return { isAllowed, user };
}
