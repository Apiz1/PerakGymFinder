import React, { useState } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Show({ application }) {
    const [isProcessing, setIsProcessing] = useState(false);

    // Status Badge Component Helper
    const renderStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Approved
                    </span>
                );
            case 'pending':
                return (
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Pending
                    </span>
                );
            case 'rejected':
                return (
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Rejected
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {status}
                    </span>
                );
        }
    };

    // Quick Action Handlers
    const handleAction = (actionRoute, confirmMessage) => {
        if (confirmMessage && !confirm(confirmMessage)) return;

        setIsProcessing(true);
        router.post(
            route(actionRoute, application.id),
            {},
            {
                onFinish: () => setIsProcessing(false),
                preserveScroll: true,
            }
        );
    };

    // Get application type label
    const getApplicationType = () => {
        if (application.gym_id) {
            return 'Claim Existing Gym';
        }
        return 'Register New Gym';
    };

    // Get application type icon
    const getApplicationTypeIcon = () => {
        if (application.gym_id) {
            return '📋';
        }
        return '🏗️';
    };

    return (
        <div className="space-y-6 pb-12">
            <Head title={`Application #${application.id}`} />

            {/* TOP BREADCRUMB & BACK BUTTON */}
            <div className="flex items-center justify-between">
                <Link
                    href={route('admin.owner-applications.index')}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Applications</span>
                </Link>

                <div className="flex items-center gap-2">
                    {renderStatusBadge(application.status)}
                </div>
            </div>

            {/* HERO HEADER & QUICK ACTIONS */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl flex-shrink-0">
                            {getApplicationTypeIcon()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl font-black text-white tracking-tight">
                                    Application #{application.id}
                                </h1>
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                                    application.gym_id 
                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                }`}>
                                    {getApplicationType()}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                                <span>👤</span>
                                <span className="font-semibold text-white">{application.user?.name || 'Unknown User'}</span>
                                <span className="text-slate-500">•</span>
                                <span>{application.user?.email || 'No email'}</span>
                                <span className="text-slate-500">•</span>
                                <span>Submitted: {new Date(application.created_at).toLocaleDateString()}</span>
                            </p>
                        </div>
                    </div>

                    {/* Quick Action Control Bar */}
                    {application.status === 'pending' && (
                        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                            <button
                                disabled={isProcessing}
                                onClick={() => handleAction(
                                    'admin.owner-applications.approve',
                                    `Approve ${application.user?.name || 'this user'}'s application?`
                                )}
                                className="flex-1 lg:flex-none bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                            >
                                {isProcessing ? 'Processing...' : '✅ Approve Application'}
                            </button>
                            <button
                                disabled={isProcessing}
                                onClick={() => handleAction(
                                    'admin.owner-applications.reject',
                                    `Reject ${application.user?.name || 'this user'}'s application?`
                                )}
                                className="flex-1 lg:flex-none bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all border border-rose-500/20 disabled:opacity-50"
                            >
                                {isProcessing ? 'Processing...' : '❌ Reject Application'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details - Applicant & Gym Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Applicant Information */}
                    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <span>👤</span> Applicant Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                                <p className="text-slate-500">Full Name</p>
                                <p className="text-white font-semibold mt-1">{application.user?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Email Address</p>
                                <p className="text-white font-semibold mt-1">{application.user?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Phone Number</p>
                                <p className="text-white font-semibold mt-1">{application.user?.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Application Date</p>
                                <p className="text-white font-semibold mt-1">
                                    {new Date(application.created_at).toLocaleDateString()}
                                    <span className="text-slate-400 block text-[10px]">
                                        {new Date(application.created_at).toLocaleTimeString()}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Gym Information */}
                    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <span>🏋️</span> Gym Information
                        </h3>
                        {application.gym_id ? (
                            // Claim Existing Gym
                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between py-2 border-b border-slate-800/60">
                                    <span className="text-slate-500">Gym Name</span>
                                    <span className="text-white font-semibold">{application.gym?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800/60">
                                    <span className="text-slate-500">Address</span>
                                    <span className="text-white font-semibold text-right max-w-[200px]">
                                        {application.gym?.address || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800/60">
                                    <span className="text-slate-500">City</span>
                                    <span className="text-white font-semibold">{application.gym?.city?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-500">Current Status</span>
                                    <span>{renderStatusBadge(application.gym?.status)}</span>
                                </div>
                            </div>
                        ) : (
                            // Register New Gym
                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between py-2 border-b border-slate-800/60">
                                    <span className="text-slate-500">Gym Name</span>
                                    <span className="text-white font-semibold">
                                        {application.proposed_gym_details?.name || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800/60">
                                    <span className="text-slate-500">Address</span>
                                    <span className="text-white font-semibold text-right max-w-[200px]">
                                        {application.proposed_gym_details?.address || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800/60">
                                    <span className="text-slate-500">Phone Number</span>
                                    <span className="text-white font-semibold">
                                        {application.proposed_gym_details?.phone_number || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800/60">
                                    <span className="text-slate-500">WhatsApp Number</span>
                                    <span className="text-white font-semibold">
                                        {application.proposed_gym_details?.whatsapp_number || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-500">Description</span>
                                    <span className="text-white text-right max-w-[200px]">
                                        {application.proposed_gym_details?.description || 'No description provided'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Documents & Metadata */}
                <div className="space-y-6">
                    {/* Business Document */}
                    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <span>📄</span> Business Document
                        </h3>
                        {application.business_doc_path ? (
                            <div className="space-y-3">
                                <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl text-center">
                                    <div className="text-3xl mb-2">📎</div>
                                    <p className="text-xs text-slate-400 mb-2">
                                        Business registration or license document
                                    </p>
                                    <a
                                        href={application.business_doc_path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-emerald-500/20"
                                    >
                                        <span>📥</span> Download Document
                                    </a>
                                </div>
                                <div className="text-[10px] text-slate-500 text-center">
                                    File stored securely in the system
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-xs text-slate-500">No document uploaded</p>
                            </div>
                        )}
                    </div>

                    {/* Metadata */}
                    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <span>ℹ️</span> Metadata
                        </h3>
                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-2 border-b border-slate-800/60">
                                <span className="text-slate-500">Application ID</span>
                                <span className="text-white font-mono font-semibold">#{application.id}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800/60">
                                <span className="text-slate-500">Status</span>
                                <span>{renderStatusBadge(application.status)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800/60">
                                <span className="text-slate-500">Created</span>
                                <span className="text-white text-right">
                                    {new Date(application.created_at).toLocaleDateString()}
                                    <span className="block text-[10px] text-slate-500">
                                        {new Date(application.created_at).toLocaleTimeString()}
                                    </span>
                                </span>
                            </div>
                            {application.updated_at && application.updated_at !== application.created_at && (
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-500">Last Updated</span>
                                    <span className="text-white text-right">
                                        {new Date(application.updated_at).toLocaleDateString()}
                                        <span className="block text-[10px] text-slate-500">
                                            {new Date(application.updated_at).toLocaleTimeString()}
                                        </span>
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status History Note */}
                    {application.status !== 'pending' && (
                        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
                            <div className="flex items-start gap-3">
                                <span className="text-lg">📌</span>
                                <div>
                                    <p className="text-xs font-semibold text-white">
                                        {application.status === 'approved' ? '✅ Application Approved' : '❌ Application Rejected'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        This application has been {application.status} by an admin.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-800/80">
                <Link
                    href={route('admin.owner-applications.index')}
                    className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-2.5 rounded-xl border border-slate-700 font-bold text-xs transition-all"
                >
                    <span>←</span> Back to Applications
                </Link>
                
                {application.status === 'pending' && (
                    <>
                        <button
                            disabled={isProcessing}
                            onClick={() => handleAction(
                                'admin.owner-applications.approve',
                                `Approve ${application.user?.name || 'this user'}'s application?`
                            )}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                        >
                            {isProcessing ? 'Processing...' : '✅ Approve Application'}
                        </button>
                        <button
                            disabled={isProcessing}
                            onClick={() => handleAction(
                                'admin.owner-applications.reject',
                                `Reject ${application.user?.name || 'this user'}'s application?`
                            )}
                            className="flex-1 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all border border-rose-500/20 disabled:opacity-50"
                        >
                            {isProcessing ? 'Processing...' : '❌ Reject Application'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// Persistent Inertia Layout Assignment
Show.layout = (page) => <AdminLayout>{page}</AdminLayout>;