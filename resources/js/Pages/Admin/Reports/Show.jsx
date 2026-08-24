import React, { useState } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Show({ report }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    // Safe route helper
    const safeRoute = (name, params = {}) => {
        try {
            return route(name, params);
        } catch (e) {
            console.warn(`Route "${name}" not found, using fallback`);
            if (name === 'admin.reports.index') return '/admin/reports';
            if (name === 'admin.reports.resolve') return `/admin/reports/${params?.id || ''}/resolve`;
            if (name === 'admin.reports.dismiss') return `/admin/reports/${params?.id || ''}/dismiss`;
            if (name === 'admin.gyms.show') return `/admin/gyms/${params?.id || ''}`;
            return '#';
        }
    };

    // Status Badge Component Helper
    const renderStatusBadge = (status) => {
        switch (status) {
            case 'open':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-amber-600/30 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        Open
                    </span>
                );
            case 'resolved':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Resolved
                    </span>
                );
            case 'dismissed':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        Dismissed
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {status || 'Unknown'}
                    </span>
                );
        }
    };

    // Get report type badge
    const renderTypeBadge = (type) => {
        const typeConfigs = {
            'wrong_info': { label: 'Incorrect Info', color: 'bg-blue-600/30 text-blue-300 border-blue-500/40' },
            'closed': { label: 'Closed', color: 'bg-rose-600/30 text-rose-300 border-rose-500/40' },
            'duplicate': { label: 'Duplicate', color: 'bg-purple-600/30 text-purple-300 border-purple-500/40' },
            'other': { label: 'Other', color: 'bg-slate-700/50 text-slate-400 border-slate-600/50' },
        };
        const config = typeConfigs[type] || typeConfigs['other'];
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-md border ${config.color}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                {config.label}
            </span>
        );
    };

    // Open confirmation modal
    const openConfirmModal = (action) => {
        setConfirmAction(action);
        setShowConfirmModal(true);
    };

    // Execute action after confirmation
    const executeAction = () => {
        setShowConfirmModal(false);
        
        if (confirmAction === 'resolve') {
            handleAction('admin.reports.resolve', 'resolve');
        } else if (confirmAction === 'dismiss') {
            handleAction('admin.reports.dismiss', 'dismiss');
        }
    };

    // Quick Action Handlers
    const handleAction = (actionRoute, actionName) => {
        setIsProcessing(true);
        const url = safeRoute(actionRoute, { id: report?.id });

        router.post(
            url,
            {},
            {
                onFinish: () => setIsProcessing(false),
                preserveScroll: true,
                onSuccess: () => {
                    setNotification({
                        type: 'success',
                        message: actionName === 'resolve' 
                            ? 'Report marked as resolved successfully!' 
                            : 'Report dismissed successfully!'
                    });
                },
                onError: (errors) => {
                    setNotification({
                        type: 'error',
                        message: errors.message || 'Action failed. Please try again.'
                    });
                }
            }
        );
    };

    const closeNotification = () => {
        setNotification(null);
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString('en-MY', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    // Get modal content
    const getModalContent = () => {
        if (confirmAction === 'resolve') {
            return {
                title: 'Resolve Report',
                message: `Are you sure you want to mark this report as resolved? This indicates the issue has been addressed.`,
                icon: '✅',
                buttonText: 'Yes, Resolve',
                buttonColor: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
            };
        } else if (confirmAction === 'dismiss') {
            return {
                title: 'Dismiss Report',
                message: `Are you sure you want to dismiss this report? This indicates the report is not actionable.`,
                icon: '❌',
                buttonText: 'Yes, Dismiss',
                buttonColor: 'bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700'
            };
        }
        return null;
    };

    const modalContent = getModalContent();

    // If report is not available
    if (!report) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-4xl mb-4">📋</div>
                    <h2 className="text-xl font-bold text-white">Report Not Found</h2>
                    <p className="text-slate-400 text-sm mt-2">The report you're looking for doesn't exist.</p>
                    <Link
                        href={safeRoute('admin.reports.index')}
                        className="inline-block mt-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition"
                    >
                        Back to Reports
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            <Head title={`Report #${report.id}`} />

            {/* Notification */}
            {notification && (
                <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 ${
                    notification.type === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                    <span className="text-lg mt-0.5">
                        {notification.type === 'success' ? '✅' : '❌'}
                    </span>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{notification.message}</p>
                    </div>
                    <button 
                        onClick={closeNotification}
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* TOP BREADCRUMB & BACK BUTTON */}
            <div className="flex items-center justify-between">
                <Link
                    href={safeRoute('admin.reports.index')}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Reports</span>
                </Link>

                <div className="flex items-center gap-2">
                    {renderStatusBadge(report.status)}
                </div>
            </div>

            {/* HERO HEADER & QUICK ACTIONS */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl flex-shrink-0">
                            🚨
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl font-black text-white tracking-tight">
                                    Report #{report.id}
                                </h1>
                                {renderTypeBadge(report.type)}
                            </div>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                                <span>📋</span>
                                <span className="font-semibold text-white">{report.reason || 'No reason provided'}</span>
                                <span className="text-slate-500">•</span>
                                <span>Reported by {report.user?.name || 'Anonymous'}</span>
                                <span className="text-slate-500">•</span>
                                <span>{formatDate(report.created_at)}</span>
                            </p>
                        </div>
                    </div>

                    {/* Quick Action Control Bar */}
                    {report.status === 'open' && (
                        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                            <button
                                disabled={isProcessing}
                                onClick={() => openConfirmModal('resolve')}
                                className="flex-1 lg:flex-none bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                            >
                                {isProcessing ? 'Processing...' : '✅ Resolve Report'}
                            </button>
                            <button
                                disabled={isProcessing}
                                onClick={() => openConfirmModal('dismiss')}
                                className="flex-1 lg:flex-none bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all border border-slate-600 disabled:opacity-50"
                            >
                                {isProcessing ? 'Processing...' : '❌ Dismiss Report'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Report Details */}
                    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <span>📋</span> Report Details
                        </h3>
                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-2 border-b border-slate-800/60">
                                <span className="text-slate-500">Reason</span>
                                <span className="text-white font-semibold max-w-[300px] text-right">
                                    {report.reason || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800/60">
                                <span className="text-slate-500">Type</span>
                                <span>{renderTypeBadge(report.type)}</span>
                            </div>
                            {report.description && (
                                <div className="flex flex-col py-2 border-b border-slate-800/60">
                                    <span className="text-slate-500 mb-1">Description</span>
                                    <span className="text-white text-sm leading-relaxed">
                                        {report.description}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between py-2">
                                <span className="text-slate-500">Status</span>
                                <span>{renderStatusBadge(report.status)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Gym Information */}
                    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <span>🏋️</span> Gym Information
                        </h3>
                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-2 border-b border-slate-800/60">
                                <span className="text-slate-500">Gym Name</span>
                                <Link 
                                    href={safeRoute('admin.gyms.show', { id: report.gym?.id })}
                                    className="text-amber-400 hover:text-amber-300 font-semibold transition"
                                >
                                    {report.gym?.name || 'N/A'}
                                </Link>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800/60">
                                <span className="text-slate-500">Status</span>
                                <span className="text-white font-semibold capitalize">
                                    {report.gym?.status || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800/60">
                                <span className="text-slate-500">Address</span>
                                <span className="text-white text-right max-w-[200px]">
                                    {report.gym?.address || 'N/A'}
                                </span>
                            </div>
                            {report.gym?.city && (
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-500">Location</span>
                                    <span className="text-white font-semibold">
                                        {report.gym.city?.name || 'N/A'}, {report.gym.state?.name || ''}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-800/60">
                            <Link
                                href={safeRoute('admin.gyms.show', { id: report.gym?.id })}
                                className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
                            >
                                View Gym Details →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Reporter & Metadata */}
                <div className="space-y-6">
                    {/* Reporter Information */}
                    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <span>👤</span> Reporter
                        </h3>
                        {report.user ? (
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-amber-500/20">
                                        {report.user.name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{report.user.name}</p>
                                        <p className="text-slate-400 text-[10px]">{report.user.email}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500">Anonymous user</p>
                        )}
                    </div>

                    {/* Metadata */}
                    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <span>ℹ️</span> Metadata
                        </h3>
                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-2 border-b border-slate-800/60">
                                <span className="text-slate-500">Report ID</span>
                                <span className="text-white font-mono font-semibold">#{report.id}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800/60">
                                <span className="text-slate-500">Status</span>
                                <span>{renderStatusBadge(report.status)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800/60">
                                <span className="text-slate-500">Created</span>
                                <span className="text-white text-right">
                                    {formatDate(report.created_at)}
                                </span>
                            </div>
                            {report.updated_at && report.updated_at !== report.created_at && (
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-500">Last Updated</span>
                                    <span className="text-white text-right">
                                        {formatDate(report.updated_at)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status History Note */}
                    {report.status !== 'open' && (
                        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
                            <div className="flex items-start gap-3">
                                <span className="text-lg">📌</span>
                                <div>
                                    <p className="text-xs font-semibold text-white">
                                        {report.status === 'resolved' ? '✅ Report Resolved' : '❌ Report Dismissed'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        This report has been {report.status} by an admin.
                                    </p>
                                    {report.updated_at && (
                                        <p className="text-[10px] text-slate-500 mt-1">
                                            {formatDate(report.updated_at)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-800/80">
                <Link
                    href={safeRoute('admin.reports.index')}
                    className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-2.5 rounded-xl border border-slate-700 font-bold text-xs transition-all"
                >
                    <span>←</span> Back to Reports
                </Link>
                
                {report.status === 'open' && (
                    <>
                        <button
                            disabled={isProcessing}
                            onClick={() => openConfirmModal('resolve')}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                        >
                            {isProcessing ? 'Processing...' : '✅ Resolve Report'}
                        </button>
                        <button
                            disabled={isProcessing}
                            onClick={() => openConfirmModal('dismiss')}
                            className="flex-1 bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all border border-slate-600 disabled:opacity-50"
                        >
                            {isProcessing ? 'Processing...' : '❌ Dismiss Report'}
                        </button>
                    </>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && modalContent && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => {
                            setShowConfirmModal(false);
                            setConfirmAction(null);
                        }}
                    ></div>
                    
                    {/* Modal */}
                    <div className="relative max-w-md w-full bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                confirmAction === 'resolve' 
                                    ? 'bg-emerald-500/10 border border-emerald-500/20' 
                                    : 'bg-slate-500/10 border border-slate-500/20'
                            }`}>
                                <span className={`text-3xl ${
                                    confirmAction === 'resolve' ? 'text-emerald-400' : 'text-slate-400'
                                }`}>
                                    {modalContent.icon}
                                </span>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-xl font-bold text-white text-center mb-2">
                            {modalContent.title}
                        </h3>
                        <p className="text-sm text-slate-400 text-center mb-6">
                            {modalContent.message}
                        </p>

                        {/* Report Info */}
                        <div className="bg-white/5 rounded-xl p-3 mb-6">
                            <div className="flex items-start gap-2">
                                <span className="text-lg">🚨</span>
                                <div>
                                    <p className="text-xs text-slate-400">Report #{report.id}</p>
                                    <p className="text-sm font-semibold text-white">{report.reason || 'No reason'}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Reported by {report.user?.name || 'Anonymous'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setConfirmAction(null);
                                }}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeAction}
                                disabled={isProcessing}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 ${modalContent.buttonColor}`}
                            >
                                {isProcessing ? 'Processing...' : modalContent.buttonText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Persistent Inertia Layout Assignment
Show.layout = (page) => <AdminLayout>{page}</AdminLayout>;