import React, { useState } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ pendingGyms, pendingOwners, pendingReviews, openReports, counts }) {
    const [activeTab, setActiveTab] = useState('all');
    const [processingId, setProcessingId] = useState(null);

    // Status Badge Component Helper
    const renderStatusBadge = (status, type) => {
        const colors = {
            pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            open: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            dismissed: 'bg-slate-800 text-slate-400 border-slate-700',
        };
        const color = colors[status] || colors.pending;
        return (
            <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border ${color}`}>
                {status}
            </span>
        );
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString('en-MY', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    // Get tabs with counts
    const tabs = [
        { key: 'all', label: 'All Pending', count: counts.total || 0 },
        { key: 'gyms', label: 'Gyms', count: counts.gyms || 0, icon: '🏋️‍♂️' },
        { key: 'owners', label: 'Owners', count: counts.owners || 0, icon: '👤' },
        { key: 'reviews', label: 'Reviews', count: counts.reviews || 0, icon: '⭐' },
        { key: 'reports', label: 'Reports', count: counts.reports || 0, icon: '🚩' },
    ];

    // Get filtered items based on active tab
    const getFilteredItems = () => {
        const items = [];
        
        if (activeTab === 'all' || activeTab === 'gyms') {
            pendingGyms.forEach(gym => {
                items.push({
                    id: `gym-${gym.id}`,
                    type: 'gym',
                    typeLabel: 'Gym',
                    title: gym.name,
                    subtitle: gym.address || 'No address',
                    detail: gym.city?.name || 'No location',
                    status: 'pending',
                    created_at: gym.created_at,
                    link: route('admin.gyms.show', gym.id),
                    actionRoute: 'admin.gyms.approve',
                    actionLabel: 'Approve',
                    actionType: 'success',
                    icon: '🏋️‍♂️'
                });
            });
        }
        
        if (activeTab === 'all' || activeTab === 'owners') {
            pendingOwners.forEach(owner => {
                items.push({
                    id: `owner-${owner.id}`,
                    type: 'owner',
                    typeLabel: 'Owner Application',
                    title: owner.user?.name || 'Unknown User',
                    subtitle: owner.user?.email || 'No email',
                    detail: 'Application pending',
                    status: 'pending',
                    created_at: owner.created_at,
                    link: route('admin.owner-applications.show', owner.id),
                    actionRoute: 'admin.owner-applications.approve',
                    actionLabel: 'Approve',
                    actionType: 'success',
                    icon: '👤'
                });
            });
        }
        
        if (activeTab === 'all' || activeTab === 'reviews') {
            pendingReviews.forEach(review => {
                items.push({
                    id: `review-${review.id}`,
                    type: 'review',
                    typeLabel: 'Review',
                    title: `Review by ${review.user?.name || 'Anonymous'}`,
                    subtitle: `${review.rating}★ - ${review.comment?.substring(0, 60) || 'No comment'}`,
                    detail: review.gym?.name || 'Unknown gym',
                    status: 'pending',
                    created_at: review.created_at,
                    link: route('admin.reviews.show', review.id),
                    actionRoute: 'admin.reviews.approve',
                    actionLabel: 'Approve',
                    actionType: 'success',
                    icon: '⭐'
                });
            });
        }
        
        if (activeTab === 'all' || activeTab === 'reports') {
            openReports.forEach(report => {
                items.push({
                    id: `report-${report.id}`,
                    type: 'report',
                    typeLabel: 'Report',
                    title: report.reason || 'No reason provided',
                    subtitle: report.description?.substring(0, 60) || 'No description',
                    detail: report.gym?.name || 'Unknown gym',
                    status: 'open',
                    created_at: report.created_at,
                    link: route('admin.reports.show', report.id),
                    actionRoute: 'admin.reports.resolve',
                    actionLabel: 'Resolve',
                    actionType: 'success',
                    icon: '🚩'
                });
            });
        }
        
        // Sort by created_at (newest first)
        return items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    };

    const items = getFilteredItems();

    return (
        <div className="space-y-6 pb-12">
            <Head title="Pending Review" />

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Pending Review</h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Review and manage all pending items across the platform.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <span className="text-xs text-slate-400">Total Pending:</span>
                        <span className="ml-2 text-lg font-bold text-amber-400">{counts.total || 0}</span>
                    </div>
                </div>
            </div>

            {/* TABS */}
            <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                            activeTab === tab.key
                                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                        {tab.count > 0 && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                activeTab === tab.key
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-slate-800 text-slate-400'
                            }`}>
                                {tab.count}
                            </span>
                        )}
                        {tab.count > 0 && activeTab === tab.key && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        )}
                    </button>
                ))}
            </div>

            {/* PENDING ITEMS LIST */}
            {items.length > 0 ? (
                <div className="space-y-3">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 hover:border-amber-500/30 transition-all group"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                {/* Left: Icon & Content */}
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xl">
                                        {item.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Link
                                                href={item.link}
                                                className="font-semibold text-slate-200 hover:text-amber-400 transition-colors text-sm"
                                            >
                                                {item.title}
                                            </Link>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                                {item.typeLabel}
                                            </span>
                                            {renderStatusBadge(item.status)}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.subtitle}</p>
                                        <div className="flex flex-wrap items-center gap-3 mt-1 text-[10px] text-slate-500">
                                            <span>📍 {item.detail}</span>
                                            <span>🕐 {formatDate(item.created_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Link
                                        href={item.link}
                                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 font-bold transition-all text-xs"
                                    >
                                        View
                                    </Link>
                                    {item.type === 'gym' && (
                                        <button
                                            disabled={processingId === item.id}
                                            onClick={() => {
                                                setProcessingId(item.id);
                                                router.post(
                                                    route('admin.gyms.approve', item.id.split('-')[1]),
                                                    {},
                                                    {
                                                        onFinish: () => setProcessingId(null),
                                                        preserveScroll: true,
                                                    }
                                                );
                                            }}
                                            className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-bold transition-all disabled:opacity-50 text-xs"
                                        >
                                            Approve
                                        </button>
                                    )}
                                    {item.type === 'owner' && (
                                        <button
                                            disabled={processingId === item.id}
                                            onClick={() => {
                                                setProcessingId(item.id);
                                                router.post(
                                                    route('admin.owner-applications.approve', item.id.split('-')[1]),
                                                    {},
                                                    {
                                                        onFinish: () => setProcessingId(null),
                                                        preserveScroll: true,
                                                    }
                                                );
                                            }}
                                            className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-bold transition-all disabled:opacity-50 text-xs"
                                        >
                                            Approve
                                        </button>
                                    )}
                                    {item.type === 'review' && (
                                        <button
                                            disabled={processingId === item.id}
                                            onClick={() => {
                                                setProcessingId(item.id);
                                                router.post(
                                                    route('admin.reviews.approve', item.id.split('-')[1]),
                                                    {},
                                                    {
                                                        onFinish: () => setProcessingId(null),
                                                        preserveScroll: true,
                                                    }
                                                );
                                            }}
                                            className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-bold transition-all disabled:opacity-50 text-xs"
                                        >
                                            Approve
                                        </button>
                                    )}
                                    {item.type === 'report' && (
                                        <button
                                            disabled={processingId === item.id}
                                            onClick={() => {
                                                setProcessingId(item.id);
                                                router.post(
                                                    route('admin.reports.resolve', item.id.split('-')[1]),
                                                    {},
                                                    {
                                                        onFinish: () => setProcessingId(null),
                                                        preserveScroll: true,
                                                    }
                                                );
                                            }}
                                            className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-bold transition-all disabled:opacity-50 text-xs"
                                        >
                                            Resolve
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
                    <div className="text-5xl mb-4">🎉</div>
                    <p className="text-sm font-semibold text-slate-400">All caught up!</p>
                    <p className="text-xs text-slate-500 mt-1">
                        No pending items to review.
                    </p>
                </div>
            )}

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-amber-400">{counts.gyms || 0}</div>
                    <div className="text-xs text-slate-500 mt-1">Pending Gyms</div>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-amber-400">{counts.owners || 0}</div>
                    <div className="text-xs text-slate-500 mt-1">Pending Owners</div>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-amber-400">{counts.reviews || 0}</div>
                    <div className="text-xs text-slate-500 mt-1">Pending Reviews</div>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-amber-400">{counts.reports || 0}</div>
                    <div className="text-xs text-slate-500 mt-1">Open Reports</div>
                </div>
            </div>
        </div>
    );
}

// Persistent Inertia Layout Assignment
Index.layout = (page) => <AdminLayout>{page}</AdminLayout>;