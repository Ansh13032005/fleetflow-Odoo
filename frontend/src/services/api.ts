const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/** Handle 401: clear session and redirect to login */
function handleUnauthorized() {
    if (typeof window === 'undefined') return;
    try {
        const { useAuthStore } = require('@/store/useAuthStore');
        useAuthStore.getState().logout();
        window.location.href = '/login?expired=1';
    } catch {
        window.location.href = '/login?expired=1';
    }
}

/** Authenticated fetch wrapper - handles 401 session expiry */
async function authFetch(url: string, options: RequestInit & { token?: string }) {
    const { token, ...opts } = options as RequestInit & { token?: string };
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers as Record<string, string>),
    };
    const res = await fetch(url, { ...opts, headers });
    if (res.status === 401) {
        handleUnauthorized();
        const data = await res.json();
        throw new Error(data.message || 'Session expired. Please log in again.');
    }
    return res;
}

export async function requestOtp(email: string) {
    const response = await fetch(`${API_URL}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
    }
    return data;
}

export async function verifyOtp(email: string, otp: string) {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Invalid or expired OTP');
    }
    return data;
}

export async function login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Login failed');
    }

    return data;
}

export async function register(email: string, password: string, firstName: string, lastName: string, role?: string) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName, role }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
    }
    return data;
}

export async function verifyEmail(email: string, otp: string) {
    const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Invalid or expired code');
    }
    return data;
}

export async function resendVerification(email: string) {
    const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to resend code');
    }
    return data;
}

// ─── Vehicles ────────────────────────────────────────────────────────────────
export async function getVehicles(token: string) {
    const res = await authFetch(`${API_URL}/vehicles`, { token });
    if (!res.ok) throw new Error('Failed to fetch vehicles');
    return res.json();
}

export async function createVehicle(token: string, data: any) {
    const res = await authFetch(`${API_URL}/vehicles`, {
        method: 'POST',
        token,
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create vehicle');
    return res.json();
}

export async function updateVehicleApi(token: string, id: string, data: any) {
    const res = await authFetch(`${API_URL}/vehicles/${id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update vehicle');
    return res.json();
}

export async function deleteVehicleApi(token: string, id: string) {
    const res = await authFetch(`${API_URL}/vehicles/${id}`, { method: 'DELETE', token });
    if (!res.ok) throw new Error('Failed to delete vehicle');
    return res.json();
}

// ─── Drivers ─────────────────────────────────────────────────────────────────
export async function getDrivers(token: string) {
    const res = await authFetch(`${API_URL}/drivers`, { token });
    if (!res.ok) throw new Error('Failed to fetch drivers');
    return res.json();
}

export async function createDriver(token: string, data: any) {
    const res = await authFetch(`${API_URL}/drivers`, {
        method: 'POST',
        token,
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create driver');
    return res.json();
}

export async function updateDriverApi(token: string, id: string, data: any) {
    const res = await authFetch(`${API_URL}/drivers/${id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update driver');
    return res.json();
}

export async function deleteDriverApi(token: string, id: string) {
    const res = await authFetch(`${API_URL}/drivers/${id}`, { method: 'DELETE', token });
    if (!res.ok) throw new Error('Failed to delete driver');
    return res.json();
}

export async function getAvailableVehicles(token: string) {
    const res = await authFetch(`${API_URL}/vehicles/available`, { token });
    if (!res.ok) throw new Error('Failed to fetch available vehicles');
    return res.json();
}

export async function getValidDrivers(token: string) {
    const res = await authFetch(`${API_URL}/drivers/valid`, { token });
    if (!res.ok) throw new Error('Failed to fetch valid drivers');
    return res.json();
}

// ─── Trips ───────────────────────────────────────────────────────────────────
export async function getTrips(token: string) {
    const res = await authFetch(`${API_URL}/trips`, { token });
    if (!res.ok) throw new Error('Failed to fetch trips');
    return res.json();
}

export async function createTripApi(token: string, data: any) {
    const payload = { ...data };
    const res = await authFetch(`${API_URL}/trips`, {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to create trip');
    return result;
}

export async function updateTripApi(token: string, id: string, data: any) {
    const payload = { ...data };
    const res = await authFetch(`${API_URL}/trips/${id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to update trip');
    return result;
}

export async function deleteTripApi(token: string, id: string) {
    const res = await authFetch(`${API_URL}/trips/${id}`, { method: 'DELETE', token });
    if (!res.ok) throw new Error('Failed to delete trip');
    return res.json();
}

// ─── Maintenance Logs ────────────────────────────────────────────────────────
export async function getMaintenanceLogs(token: string) {
    const res = await authFetch(`${API_URL}/maintenance`, { token });
    if (!res.ok) throw new Error('Failed to fetch maintenance logs');
    return res.json();
}

export async function createMaintenanceLogApi(token: string, data: { vehicleId: string; description: string; cost: number; date?: string }) {
    const res = await authFetch(`${API_URL}/maintenance`, {
        method: 'POST',
        token,
        body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Failed to create maintenance log');
    return result;
}

export async function updateMaintenanceLogApi(token: string, id: string, data: any) {
    const res = await authFetch(`${API_URL}/maintenance/${id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update maintenance log');
    return res.json();
}

export async function deleteMaintenanceLogApi(token: string, id: string) {
    const res = await authFetch(`${API_URL}/maintenance/${id}`, { method: 'DELETE', token });
    if (!res.ok) throw new Error('Failed to delete maintenance log');
    return res.json();
}

// ─── Expense Logs ────────────────────────────────────────────────────────────
export async function getExpenseLogs(token: string) {
    const res = await authFetch(`${API_URL}/expenses`, { token });
    if (!res.ok) throw new Error('Failed to fetch expense logs');
    return res.json();
}

// ─── Analytics ───────────────────────────────────────────────────────────────
export async function getDashboardMetrics(token: string) {
    const res = await authFetch(`${API_URL}/analytics/dashboard`, { token });
    if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
    return res.json();
}

export async function getOperationalAnalytics(token: string) {
    const res = await authFetch(`${API_URL}/analytics/operational`, { token });
    if (!res.ok) throw new Error('Failed to fetch operational analytics');
    return res.json();
}
