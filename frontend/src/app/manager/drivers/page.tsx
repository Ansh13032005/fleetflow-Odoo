'use client';

import { useState, useEffect } from 'react';
import { useFleetStore } from '@/store/useFleetStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Driver, DriverStatus } from '@/types';
import {
    Users, Plus, Pencil, Trash2, X, CheckCircle2,
    AlertTriangle, ShieldCheck, Search, ChevronDown, Loader2,
    Clock, Ban, MapPin
} from 'lucide-react';

// ─── Status Pill ──────────────────────────────────────────────────────────────
const statusConfig: Record<DriverStatus, { label: string; classes: string; icon: React.ElementType }> = {
    [DriverStatus.ON_DUTY]: { label: 'On Duty', classes: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25', icon: CheckCircle2 },
    [DriverStatus.OFF_DUTY]: { label: 'Off Duty', classes: 'bg-neutral-100 dark:bg-neutral-700/40 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700', icon: Clock },
    [DriverStatus.ON_TRIP]: { label: 'On Trip', classes: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/25', icon: MapPin },
    [DriverStatus.SUSPENDED]: { label: 'Suspended', classes: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/25', icon: Ban },
};

function StatusPill({ status }: { status: DriverStatus }) {
    const cfg = statusConfig[status];
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.classes}`}>
            <Icon className="w-3.5 h-3.5" />
            {cfg.label}
        </span>
    );
}

// ─── Empty Form State ─────────────────────────────────────────────────────────
const emptyForm = { firstName: '', lastName: '', licenseExpiry: '', safetyScore: 100, status: DriverStatus.OFF_DUTY };

// ─── Modal ────────────────────────────────────────────────────────────────────
function DriverModal({
    driver,
    onClose,
    onSave,
}: {
    driver: Driver | null;
    onClose: () => void;
    onSave: (data: typeof emptyForm) => void;
}) {
    const [form, setForm] = useState(
        driver
            ? { firstName: driver.firstName, lastName: driver.lastName, licenseExpiry: driver.licenseExpiry, safetyScore: driver.safetyScore, status: driver.status }
            : emptyForm
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(form);
    };

    const inputClass = "w-full bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors text-sm font-medium shadow-sm";
    const labelClass = "block text-xs font-semibold text-neutral-700 dark:text-neutral-400 mb-1.5";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 dark:bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                    <h2 className="text-base font-bold text-neutral-900 dark:text-white">{driver ? 'Edit Driver' : 'Onboard New Driver'}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className={labelClass}>First Name</label>
                            <input required className={inputClass} placeholder="John"
                                value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>Last Name</label>
                            <input required className={inputClass} placeholder="Doe"
                                value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                        </div>
                        <div className="col-span-2">
                            <label className={labelClass}>License Expiry Date</label>
                            <input required type="date" className={inputClass}
                                value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>Status</label>
                            <div className="relative">
                                <select className={`${inputClass} appearance-none cursor-pointer`}
                                    value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as DriverStatus })}>
                                    {Object.values(DriverStatus).map((s) => <option key={s} value={s}>{statusConfig[s].label}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Safety Score (0-100)</label>
                            <input required type="number" min={0} max={100} className={inputClass}
                                value={form.safetyScore} onChange={(e) => setForm({ ...form, safetyScore: Number(e.target.value) })} />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-3">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-bold transition-colors shadow-sm">
                            Cancel
                        </button>
                        <button type="submit"
                            className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 text-sm font-bold transition-colors shadow-sm">
                            {driver ? 'Save Changes' : 'Onboard Driver'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DriverProfilesPage() {
    const { token } = useAuthStore();
    const { drivers, fetchDrivers, addDriver, updateDriver, deleteDriver, isLoading, error } = useFleetStore();

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<DriverStatus | 'ALL'>('ALL');
    const [modalDriver, setModalDriver] = useState<Driver | null | undefined>(undefined);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (token) fetchDrivers(token);
    }, [token, fetchDrivers]);

    const filtered = drivers.filter((d) => {
        const fullName = `${d.firstName} ${d.lastName}`.toLowerCase();
        const matchSearch = fullName.includes(search.toLowerCase());
        const matchStatus = filterStatus === 'ALL' || d.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const handleSave = async (data: typeof emptyForm) => {
        if (!token) return;
        if (modalDriver) {
            await updateDriver(token, modalDriver.id, data);
        } else {
            await addDriver(token, data);
        }
        setModalDriver(undefined);
    };

    const toggleStatus = (d: Driver, newStatus: DriverStatus) => {
        if (!token) return;
        updateDriver(token, d.id, { status: newStatus });
    };

    const getComplianceInfo = (expiry: string) => {
        const today = new Date();
        const expiryDate = new Date(expiry);
        const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: 'Expired', classes: 'text-rose-600 dark:text-rose-400', urgent: true };
        if (diffDays <= 30) return { label: `Expires in ${diffDays}d`, classes: 'text-amber-600 dark:text-amber-400', urgent: true };
        return { label: new Date(expiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), classes: 'text-neutral-600 dark:text-neutral-400', urgent: false };
    };

    const expiredCount = drivers.filter(d => new Date(d.licenseExpiry) < new Date()).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Driver Profiles</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-0.5 font-medium">Compliance and safety management.</p>
                </div>
                <button
                    onClick={() => setModalDriver(null)}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Onboard Driver
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 text-rose-600 dark:text-rose-400 text-sm font-medium">
                    Error loading drivers: {error}
                </div>
            )}

            {/* Compliance Alert */}
            {expiredCount > 0 && (
                <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="p-2 bg-rose-100 dark:bg-rose-500/20 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-rose-900 dark:text-rose-100">License Compliance Warning</h4>
                        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">There are {expiredCount} drivers with expired licenses who are currently restricted from dispatch.</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                    <input
                        className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm transition-colors font-medium shadow-sm"
                        placeholder="Search by driver name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative shrink-0">
                    <select
                        className="w-full sm:w-auto bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl px-4 pr-10 py-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none cursor-pointer transition-colors shadow-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as DriverStatus | 'ALL')}
                    >
                        <option value="ALL">All Statuses</option>
                        {Object.values(DriverStatus).map((s) => (
                            <option key={s} value={s}>{statusConfig[s].label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 bg-neutral-50/50 dark:bg-neutral-900">
                                <th className="text-left px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Driver</th>
                                <th className="text-left px-6 py-4 font-bold uppercase text-[10px] tracking-wider">License Expiry</th>
                                <th className="text-left px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Safety Score</th>
                                <th className="text-left px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Quick Toggle</th>
                                <th className="text-right px-6 py-4 font-bold uppercase text-[10px] tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-neutral-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-2" />
                                        Syncing driver records...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-neutral-500 font-medium">No drivers onboarded yet.</td>
                                </tr>
                            ) : (
                                filtered.map((d) => {
                                    const compliance = getComplianceInfo(d.licenseExpiry);
                                    return (
                                        <tr key={d.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-100 dark:border-emerald-500/20">
                                                        {d.firstName[0]}{d.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-neutral-900 dark:text-white">{d.firstName} {d.lastName}</p>
                                                        <p className="text-[10px] text-neutral-500 font-mono mt-0.5 uppercase tracking-tighter">ID: {d.id.slice(-6)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className={`font-semibold ${compliance.classes} flex items-center gap-1.5`}>
                                                        {compliance.urgent && <AlertTriangle className="w-3.5 h-3.5" />}
                                                        {compliance.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700">
                                                        <div className={`h-full rounded-full ${d.safetyScore >= 90 ? 'bg-emerald-500' : d.safetyScore >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                            style={{ width: `${d.safetyScore}%` }} />
                                                    </div>
                                                    <span className="font-bold text-neutral-700 dark:text-neutral-300">{d.safetyScore}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4"><StatusPill status={d.status} /></td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {Object.values(DriverStatus).map((s) => (
                                                        <button
                                                            key={s}
                                                            onClick={() => toggleStatus(d, s)}
                                                            className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold transition-colors ${d.status === s ? statusConfig[s].classes + ' border shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-300 border border-transparent'}`}
                                                        >
                                                            {statusConfig[s].label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setModalDriver(d)}
                                                        className="p-2 rounded-lg text-neutral-400 dark:text-neutral-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                                                        title="Edit Profile"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingId(d.id)}
                                                        className="p-2 rounded-lg text-neutral-400 dark:text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                                                        title="Remove Driver"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modalDriver !== undefined && (
                <DriverModal
                    driver={modalDriver}
                    onClose={() => setModalDriver(undefined)}
                    onSave={handleSave}
                />
            )}

            {/* Delete confirm */}
            {deletingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 dark:bg-black/70 backdrop-blur-sm">
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mx-auto mb-2">
                            <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                        </div>
                        <h3 className="font-bold text-neutral-900 dark:text-white text-lg">Remove Driver?</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">Removing this driver will archive their records. They will no longer be available for dispatch.</p>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setDeletingId(null)}
                                className="flex-1 px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-bold transition-colors shadow-sm">
                                Cancel
                            </button>
                            <button onClick={async () => { if (token) { await deleteDriver(token, deletingId); setDeletingId(null); } }}
                                className="flex-1 px-4 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 dark:hover:bg-rose-400 text-white dark:text-neutral-950 text-sm font-bold transition-colors shadow-sm">
                                Confirm Removal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
