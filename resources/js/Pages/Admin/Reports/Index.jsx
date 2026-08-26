import React, { useState, useEffect, useRef } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ reports, filters, statusCounts }) {
    const [search, setSearch] = useState(filters.search || '');
    const [processingId, setProcessingId] = useState(null);
    const [notification, setNotification] = useState(null);
    const [toast, setToast] = useState(null);
    const isFirstRender = useRef(true);

    // Filter status tabs helper
    const currentStatus = filters.status || 'open';

    // Debounced Search Effect
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                route('admin.reports.index'),
                { status: currentStatus || undefined, search: search || undefined },
                { preserveState: true, replace: true }
            );
        }, 350);

        return () => clearTimeout(timer);
    }, [search, currentStatus]);

    // Show toast from flash messages
    useEffect(() => {
        const flash = window?.page?.props?.flash;
        if (flash?.success) {
            setToast({
                type: 'success',
                message: flash.success
            });
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
        if (flash?.error) {
            setToast({
                type: 'error',
                message: flash.error
            });
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, []);

    // Notification Helper
    const showNotification = (type, message, onConfirm, actionType = 'default') => {
        setNotification({
            type,
            message,
            onConfirm,
            actionType,
            isOpen: true
        });
    };

    const closeNotification = () => {
        setNotification(null);
    };

    const closeToast = () => {
        setToast(null);
    };

    // Status Badge Component Helper
    const renderStatusBadge = (status) => {
        switch (status) {
            case 'open':
                return (
                    <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Open
                    </span>
                );
            case 'resolved':
                return (
                    <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Resolved
                    </span>
                );
            case 'dismissed':
                return (
                    <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Dismissed
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {status}
                    </span>
                );
        }
    };

    // Get report type badge
    const renderTypeBadge = (type) => {
        const typeConfigs = {
            'incorrect_info': { label: 'Incorrect Info', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
            'closed': { label: 'Closed', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
            'duplicate': { label: 'Duplicate', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
            'offensive': { label: 'Offensive', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
            'other': { label: 'Other', color: 'bg-slate-700/50 text-slate-400 border-slate-700/50' },
        };
        const config = typeConfigs[type] || typeConfigs['other'];
        return (
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${config.color}`}>
                {config.label}
            </span>
        );
    };

    // Quick Action Handlers
    const handleAction = (id, actionRoute, confirmMessage, actionType = 'default') => {
        if (confirmMessage) {
            showNotification(
                actionType,
                confirmMessage,
                () => {
                    setProcessingId(id);
                    router.post(
                        route(actionRoute, id),
                        {},
                        {
                            onFinish: () => {
                                setProcessingId(null);
                                closeNotification();
                            },
                            preserveScroll: true,
                            preserveState: true,
                        }
                    );
                },
                actionType
            );
            return;
        }

        setProcessingId(id);
        router.post(
            route(actionRoute, id),
            {},
            {
                onFinish: () => setProcessingId(null),
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const handleFilterStatus = (statusValue) => {
        router.get(
            route('admin.reports.index'),
            { status: statusValue || undefined, search: search || undefined },
            { preserveState: true, replace: true }
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

    const totalReports = statusCounts?.all || reports.total || 0;

    return (
        <div className="space-y-6 pb-12">
            <Head title="Report Moderation" />

            {/* TOAST NOTIFICATION */}
            {toast && (
                <div className={`fixed top-20 right-4 z-50 max-w-sm w-full p-4 rounded-xl border shadow-lg animate-in slide-in-from-top-2 duration-300 ${
                    toast.type === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            {toast.type === 'success' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold">{toast.message}</p>
                        </div>
                        <button 
                            onClick={closeToast}
                            className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* CONFIRMATION NOTIFICATION MODAL */}
            {notification && notification.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header with icon */}
                        <div className="px-6 pt-6 pb-4">
                            <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                    notification.actionType === 'danger' 
                                        ? 'bg-rose-500/10 text-rose-400'
                                        : notification.actionType === 'warning'
                                        ? 'bg-amber-500/10 text-amber-400'
                                        : 'bg-emerald-500/10 text-emerald-400'
                                }`}>
                                    {notification.actionType === 'danger' ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    ) : notification.actionType === 'warning' ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-white">
                                        {notification.actionType === 'danger' ? 'Confirm Action' : 
                                         notification.actionType === 'warning' ? 'Confirm Action' : 
                                         'Confirm Action'}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                        {notification.message}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="px-6 pb-6 flex flex-col sm:flex-row items-center justify-end gap-3">
                            <button
                                onClick={closeNotification}
                                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={notification.onConfirm}
                                className={`w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white rounded-xl border transition-all ${
                                    notification.actionType === 'danger'
                                        ? 'bg-rose-500 hover:bg-rose-600 border-rose-500/30 hover:border-rose-400'
                                        : notification.actionType === 'warning'
                                        ? 'bg-amber-500 hover:bg-amber-600 border-amber-500/30 hover:border-amber-400'
                                        : 'bg-emerald-500 hover:bg-emerald-600 border-emerald-500/30 hover:border-emerald-400'
                                }`}
                            >
                                {notification.actionType === 'danger' ? 'Confirm' : 
                                 notification.actionType === 'warning' ? 'Confirm' : 
                                 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Report Moderation</h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Review and manage user-submitted reports about gym listings.
                    </p>
                </div>
            </div>

            {/* STATUS COUNTER TABS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { key: '', label: 'All Reports', count: totalReports, color: 'text-slate-200' },
                    { key: 'open', label: 'Open Reports', count: statusCounts?.open || 0, color: 'text-amber-400', alert: (statusCounts?.open || 0) > 0 },
                    { key: 'resolved', label: 'Resolved', count: statusCounts?.resolved || 0, color: 'text-emerald-400' },
                    { key: 'dismissed', label: 'Dismissed', count: statusCounts?.dismissed || 0, color: 'text-slate-400' },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleFilterStatus(tab.key)}
                        className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                            currentStatus === tab.key
                                ? 'bg-slate-900 border-amber-500/60 ring-1 ring-amber-500/20'
                                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400">{tab.label}</span>
                            {tab.alert && (
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            )}
                        </div>
                        <div className={`text-2xl font-black mt-2 ${tab.color}`}>
                            {tab.count}
                        </div>
                    </button>
                ))}
            </div>

            {/* FILTER BAR & SEARCH */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm">
                <div className="relative w-full sm:w-80">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                        🔍
                    </span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by gym or user name..."
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-slate-600"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-500 hover:text-slate-300"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="text-xs text-slate-500 font-mono w-full sm:w-auto text-right">
                    Showing <span className="text-slate-200 font-bold">{reports.data?.length || 0}</span> of <span className="text-slate-200 font-bold">{reports.total || 0}</span> reports
                </div>
            </div>

            {/* DATA TABLE CARD */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950/80 uppercase text-[10px] font-bold tracking-wider text-slate-400 border-b border-slate-800">
                            <tr>
                                <th scope="col" className="px-6 py-4">Report</th>
                                <th scope="col" className="px-6 py-4">Gym</th>
                                <th scope="col" className="px-6 py-4">Reported By</th>
                                <th scope="col" className="px-6 py-4">Type</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                                <th scope="col" className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                            {reports.data && reports.data.length > 0 ? (
                                reports.data.map((report) => (
                                    <tr key={report.id} className="hover:bg-slate-800/40 transition-colors">
                                        {/* Report Content */}
                                        <td className="px-6 py-4">
                                            <div className="max-w-[200px]">
                                                <div className="text-sm font-semibold text-white truncate">
                                                    {report.reason || 'No reason provided'}
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">
                                                    {formatDate(report.created_at)}
                                                </div>
                                                {report.description && (
                                                    <div className="mt-1 text-[10px] text-slate-400 truncate">
                                                        {report.description}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Gym */}
                                        <td className="px-6 py-4">
                                            <Link 
                                                href={route('admin.gyms.show', report.gym.id)}
                                                className="text-slate-200 hover:text-amber-400 transition font-semibold"
                                            >
                                                {report.gym?.name || 'Unknown Gym'}
                                            </Link>
                                            <div className="text-[10px] text-slate-500 mt-0.5">
                                                Status: {report.gym?.status || 'N/A'}
                                            </div>
                                        </td>

                                        {/* Reported By */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-semibold text-slate-200">{report.user?.name || 'Anonymous'}</div>
                                                <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                                                    {report.user?.email || 'No email'}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Type */}
                                        <td className="px-6 py-4">
                                            {renderTypeBadge(report.type)}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            {renderStatusBadge(report.status)}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* View Details */}
                                                <Link
                                                    href={route('admin.reports.show', report.id)}
                                                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 font-bold transition-all text-xs"
                                                >
                                                    View
                                                </Link>

                                                {/* Resolve Action - Only for open */}
                                                {report.status === 'open' && (
                                                    <button
                                                        disabled={processingId === report.id}
                                                        onClick={() => handleAction(
                                                            report.id, 
                                                            'admin.reports.resolve',
                                                            `Are you sure you want to resolve this report? This action will mark it as resolved.`,
                                                            'success'
                                                        )}
                                                        className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-bold transition-all disabled:opacity-50 text-xs"
                                                    >
                                                        Resolve
                                                    </button>
                                                )}

                                                {/* Dismiss Action - Only for open */}
                                                {report.status === 'open' && (
                                                    <button
                                                        disabled={processingId === report.id}
                                                        onClick={() => handleAction(
                                                            report.id, 
                                                            'admin.reports.dismiss',
                                                            `Are you sure you want to dismiss this report? This action will mark it as dismissed.`,
                                                            'warning'
                                                        )}
                                                        className="bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-white border border-slate-600 px-3 py-1.5 rounded-lg font-bold transition-all disabled:opacity-50 text-xs"
                                                    >
                                                        Dismiss
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        <div className="text-3xl mb-2">🚨</div>
                                        <p className="font-semibold text-slate-400">No reports found matching the criteria.</p>
                                        <p className="text-[11px] text-slate-600 mt-1">Try adjusting your filters or search terms.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION FOOTER */}
                {reports.links && reports.links.length > 3 && (
                    <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                            Page <span className="text-slate-300 font-bold">{reports.current_page}</span> of <span className="text-slate-300 font-bold">{reports.last_page}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {reports.links.map((link, key) => (
                                link.url ? (
                                    <Link
                                        key={key}
                                        href={link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 text-xs rounded-lg transition-all border ${
                                            link.active
                                                ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                                        }`}
                                    />
                                ) : (
                                    <span
                                        key={key}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className="px-3 py-1.5 text-xs text-slate-600 border border-transparent cursor-not-allowed"
                                    />
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        ℹ️
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Report Management Guidelines</h3>
                        <ul className="mt-2 space-y-1 text-xs text-slate-400">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">Resolve:</strong> Mark reports as resolved when the issue has been fixed (e.g., updated gym info, suspended closed gym)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">Dismiss:</strong> Mark reports as dismissed when they're not actionable (e.g., duplicate, incorrect report)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">View:</strong> Click the View button to see full report details and take action on the gym</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Persistent Inertia Layout Assignment
Index.layout = (page) => <AdminLayout>{page}</AdminLayout>;