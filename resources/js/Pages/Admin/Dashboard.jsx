import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Dashboard({ metrics = {}, pendingGyms = [], pendingOwners = [] }) {
    const [processingId, setProcessingId] = useState(null);

    // Safe route helper to prevent Ziggy errors
    const safeRoute = (name, params = {}) => {
        try {
            return route(name, params);
        } catch (e) {
            console.warn(`Route "${name}" not found, using fallback`);
            if (name.includes('gyms')) return '/admin/gyms';
            if (name.includes('owners')) return '/admin/owners';
            if (name.includes('dashboard')) return '/admin/dashboard';
            return '#';
        }
    };

    // Quick Action Handler (Approve / Reject Gym)
    const handleGymStatus = (gymId, status) => {
        if (confirm(`Are you sure you want to set this gym status to ${status}?`)) {
            setProcessingId(gymId);
            try {
                router.patch(
                    route('admin.gyms.update-status', gymId),
                    { status },
                    {
                        onFinish: () => setProcessingId(null),
                    }
                );
            } catch (e) {
                setProcessingId(null);
                console.warn('Route admin.gyms.update-status not found');
                alert('This feature is not yet implemented. Please define the route in routes/web.php');
            }
        }
    };

    return (
        <div className="space-y-8 pb-6">
            {/* 1. TOP HEADER & QUICK ACTION */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/60 backdrop-blur-sm">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-black text-white tracking-tight">System Overview</h1>
                        <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Perak Region
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        Monitoring gym listings, owner verification requests, and directory activity.
                    </p>
                </div>
                <Link
                    href="/admin/gyms/create"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Manual Listing</span>
                </Link>
            </div>

            {/* 2. METRICS CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1 */}
                <div className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 shadow-xl group">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-400 text-xs font-semibold">Total Listed Gyms</span>
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H9" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white mt-3 tracking-tight">
                        {metrics.totalGyms || 0}
                    </div>
                    <div className="text-[11px] text-emerald-400 mt-2 font-medium flex items-center gap-1">
                        <span>↑</span>
                        <span>{metrics.gymChange || '0 new this week'}</span>
                    </div>
                </div>

                {/* Metric 2 */}
                <div className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 shadow-xl group">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-400 text-xs font-semibold">Pending Approvals</span>
                        <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-black text-amber-400 mt-3 tracking-tight">
                        {metrics.pendingGyms || 0}
                    </div>
                    <div className="text-[11px] text-amber-300/80 mt-2 font-medium flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping"></span>
                        <span>Requires Super Admin Action</span>
                    </div>
                </div>

                {/* Metric 3 */}
                <div className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 shadow-xl group">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-400 text-xs font-semibold">Owner Applications</span>
                        <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-110 transition-transform">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white mt-3 tracking-tight">
                        {metrics.pendingOwners || 0}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-2 font-medium">
                        Claim verifications queue
                    </div>
                </div>

                {/* Metric 4 */}
                <div className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 shadow-xl group">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-400 text-xs font-semibold">Total User Reviews</span>
                        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white mt-3 tracking-tight">
                        {metrics.totalReviews || 0}
                    </div>
                    <div className="text-[11px] text-emerald-400 mt-2 font-medium flex items-center gap-1">
                        <span className="text-amber-400">★</span>
                        <span>{metrics.avgRating || '0.0'} Avg Directory Rating</span>
                    </div>
                </div>
            </div>

            {/* 3. ACTIONABLE TABLES SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Gym Approvals Table */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col">
                    <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/40">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                                🏋️‍♂️
                            </div>
                            <h2 className="text-sm font-bold text-white tracking-wide">
                                Gym Approvals Queue
                            </h2>
                        </div>
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                            {pendingGyms.length} Pending
                        </span>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                        {pendingGyms.length > 0 ? (
                            <table className="w-full text-left text-xs text-slate-300">
                                <thead className="bg-slate-950/50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800/80">
                                    <tr>
                                        <th className="px-5 py-3.5">Gym Name</th>
                                        <th className="px-5 py-3.5">Location</th>
                                        <th className="px-5 py-3.5">Submitted</th>
                                        <th className="px-5 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {pendingGyms.map((gym) => {
                                        const isBusy = processingId === gym.id;
                                        return (
                                            <tr key={gym.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-5 py-4 font-bold text-white">
                                                    {gym.name}
                                                </td>
                                                <td className="px-5 py-4 text-slate-400">
                                                    {gym.city?.name || gym.district?.name || 'Perak'}
                                                </td>
                                                <td className="px-5 py-4 text-slate-500 font-mono text-[11px]">
                                                    {gym.created_at ? new Date(gym.created_at).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <button
                                                            disabled={isBusy}
                                                            onClick={() => handleGymStatus(gym.id, 'approved')}
                                                            className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            disabled={isBusy}
                                                            onClick={() => handleGymStatus(gym.id, 'rejected')}
                                                            className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-12 px-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/20 text-xl">
                                    ✓
                                </div>
                                <p className="text-sm font-semibold text-slate-300">All caught up!</p>
                                <p className="text-xs text-slate-500 mt-1">No pending gym listing approvals right now.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Gym Claim Applications Table */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col">
                    <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/40">
                        <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                                📑
                            </div>
                            <h2 className="text-sm font-bold text-white tracking-wide">
                                Gym Claim Applications
                            </h2>
                        </div>
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-800 text-sky-400 border border-slate-700">
                            {pendingOwners.length} Pending
                        </span>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                        {pendingOwners.length > 0 ? (
                            <table className="w-full text-left text-xs text-slate-300">
                                <thead className="bg-slate-950/50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800/80">
                                    <tr>
                                        <th className="px-5 py-3.5">Applicant</th>
                                        <th className="px-5 py-3.5">Claiming Gym</th>
                                        <th className="px-5 py-3.5">Document</th>
                                        <th className="px-5 py-3.5 text-right">Review</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {pendingOwners.map((claim) => (
                                        <tr key={claim.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-5 py-4 font-bold text-white">
                                                {claim.user?.name || 'N/A'}
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                {claim.gym?.name || 'N/A'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-1.5 bg-slate-950 text-amber-400 px-2.5 py-1 rounded-lg border border-slate-800 font-mono text-[11px]">
                                                    <span>📄</span>
                                                    <span className="truncate max-w-[120px]">{claim.document || 'SSM Doc'}</span>
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={`/admin/owner-applications/${claim.id}`}
                                                    className="inline-flex items-center bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold px-3.5 py-1.5 rounded-lg transition-all"
                                                >
                                                    Verify &rarr;
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-12 px-4">
                                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto mb-3 border border-sky-500/20 text-xl">
                                    ✓
                                </div>
                                <p className="text-sm font-semibold text-slate-300">Queue is clear!</p>
                                <p className="text-xs text-slate-500 mt-1">No pending owner verification requests.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// 💡 Persistent Layout Setup for Inertia.js
Dashboard.layout = (page) => <AdminLayout title="Super Admin Dashboard">{page}</AdminLayout>;