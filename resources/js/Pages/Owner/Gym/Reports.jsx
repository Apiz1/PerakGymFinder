import React, { useState } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import OwnerLayout from '@/Layouts/OwnerLayout';

export default function Reports({ gym, reports = [] }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    // Status Badge Component Helper
    const renderStatusBadge = (status) => {
        switch (status) {
            case 'open':
                return (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Open
                    </span>
                );
            case 'resolved':
                return (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Resolved
                    </span>
                );
            case 'dismissed':
                return (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Dismissed
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {status || 'Unknown'}
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

    // Open resolve confirmation modal
    const confirmResolve = (report) => {
        setSelectedReport(report);
        setShowConfirmModal(true);
    };

    // Handle mark as resolved
    const handleResolve = () => {
        if (!selectedReport) return;

        setIsProcessing(true);
        setShowConfirmModal(false);

        router.post(`/owner/gym/reports/${selectedReport.id}/resolve`, {}, {
            onSuccess: () => {
                setIsProcessing(false);
                setSelectedReport(null);
                setNotification({
                    type: 'success',
                    message: 'Report marked as resolved successfully!'
                });
            },
            onError: (errors) => {
                setIsProcessing(false);
                setSelectedReport(null);
                setNotification({
                    type: 'error',
                    message: errors.message || 'Failed to resolve report. Please try again.'
                });
            },
            onFinish: () => {
                setIsProcessing(false);
            }
        });
    };

    const closeNotification = () => {
        setNotification(null);
    };

    const closeModal = () => {
        setShowConfirmModal(false);
        setSelectedReport(null);
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

    const openReports = reports.filter(r => r.status === 'open');
    const resolvedReports = reports.filter(r => r.status === 'resolved');

    return (
        <>
            <Head title="Reports" />
            
            <div className="max-w-5xl mx-auto">
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

                {/* Header */}
                <div className="text-center mb-8">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
                        🚨 Reports
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                        Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Reports</span>
                    </h1>
                    <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                        View and manage reports filed against your gym. Mark reports as resolved once you've addressed the issue.
                    </p>
                </div>

                {/* Stats Bar */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🚨</span>
                            <div>
                                <span className="text-xs text-slate-400">Total Reports</span>
                                <p className="text-sm font-bold text-white">{reports.length}</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-800"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">⏳</span>
                            <div>
                                <span className="text-xs text-slate-400">Open</span>
                                <p className="text-sm font-bold text-amber-400">{openReports.length}</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-800"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">✅</span>
                            <div>
                                <span className="text-xs text-slate-400">Resolved</span>
                                <p className="text-sm font-bold text-emerald-400">{resolvedReports.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reports List */}
                {reports.length > 0 ? (
                    <div className="space-y-4">
                        {reports.map((report) => (
                            <div key={report.id} className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                                <div className="flex flex-col md:flex-row md:items-start gap-4">
                                    {/* Report Icon */}
                                    <div className="flex-shrink-0">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                                            report.status === 'open' 
                                                ? 'bg-amber-500/10 border border-amber-500/20' 
                                                : 'bg-emerald-500/10 border border-emerald-500/20'
                                        }`}>
                                            {report.status === 'open' ? '🚨' : '✅'}
                                        </div>
                                    </div>

                                    {/* Report Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="text-sm font-bold text-white">
                                                        {report.reason || 'No reason provided'}
                                                    </h3>
                                                    {renderTypeBadge(report.type)}
                                                    {renderStatusBadge(report.status)}
                                                </div>
                                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                                                    <span>👤</span>
                                                    <span>Reported by {report.user?.name || 'Anonymous'}</span>
                                                    <span className="text-slate-500">•</span>
                                                    <span>{formatDate(report.created_at)}</span>
                                                </p>
                                            </div>
                                            
                                            {/* Actions */}
                                            {report.status === 'open' && (
                                                <button
                                                    onClick={() => confirmResolve(report)}
                                                    disabled={isProcessing}
                                                    className="flex-shrink-0 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/20 px-4 py-2 rounded-xl font-bold text-xs transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/10"
                                                >
                                                    Mark as Resolved
                                                </button>
                                            )}
                                        </div>

                                        {/* Description */}
                                        {report.description && (
                                            <div className="mt-3 p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                                                <p className="text-xs text-slate-300 leading-relaxed">
                                                    {report.description}
                                                </p>
                                            </div>
                                        )}

                                        {/* Report Metadata */}
                                        <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-slate-500">
                                            <span>Report ID: #{report.id}</span>
                                            {report.resolved_at && (
                                                <span>Resolved: {formatDate(report.resolved_at)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl p-12 text-center backdrop-blur-xl bg-white/5 border-white/10">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-xl font-bold text-white mb-2">No Reports</h3>
                        <p className="text-sm text-slate-400 max-w-md mx-auto">
                            No reports have been filed against your gym. Keep up the good work!
                        </p>
                    </div>
                )}

                {/* Info Box */}
                <div className="mt-8 glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                    <div className="flex items-start gap-4">
                        <div className="text-2xl">💡</div>
                        <div>
                            <h3 className="text-sm font-bold text-white">About Reports</h3>
                            <ul className="mt-2 space-y-1 text-xs text-slate-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span><strong className="text-white">Open Reports:</strong> Reports that need your attention. Review and address the issue.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span><strong className="text-white">Resolve:</strong> Mark a report as resolved once you've fixed the issue (e.g., updated incorrect info, fixed a broken amenity).</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span><strong className="text-white">Types:</strong> Reports can be for incorrect info, closed gym, duplicate listing, offensive content, or other issues.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span><strong className="text-white">Transparency:</strong> Resolving reports shows members you're actively maintaining your gym listing.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resolve Confirmation Modal */}
            {showConfirmModal && selectedReport && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closeModal}
                    ></div>
                    
                    {/* Modal */}
                    <div className="relative max-w-md w-full bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <span className="text-3xl text-emerald-400">✅</span>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-xl font-bold text-white text-center mb-2">
                            Mark Report as Resolved
                        </h3>
                        <p className="text-sm text-slate-400 text-center mb-6">
                            Are you sure you want to mark this report as resolved?
                            {selectedReport.reason && <span className="block mt-1 font-semibold text-white">"{selectedReport.reason}"</span>}
                            {selectedReport.description && (
                                <span className="block mt-1 text-xs text-slate-500">"{selectedReport.description}"</span>
                            )}
                        </p>

                        {/* Report Info */}
                        <div className="bg-white/5 rounded-xl p-3 mb-6">
                            <div className="flex items-start gap-2">
                                <span className="text-lg">🚨</span>
                                <div>
                                    <p className="text-xs text-slate-400">Reported by</p>
                                    <p className="text-sm font-semibold text-white">{selectedReport.user?.name || 'Anonymous'}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {formatDate(selectedReport.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={closeModal}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResolve}
                                disabled={isProcessing}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Resolving...
                                    </span>
                                ) : (
                                    'Yes, Resolve'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Persistent Layout Setup
Reports.layout = (page) => <OwnerLayout>{page}</OwnerLayout>;