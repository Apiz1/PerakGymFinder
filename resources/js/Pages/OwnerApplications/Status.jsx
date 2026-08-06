import React from 'react';
import { Link, Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function Status({ application }) {
    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                icon: '⏳',
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/20',
                title: 'Application Under Review',
                description: 'Your application is being reviewed by our admin team. This usually takes 1-3 business days.'
            },
            approved: {
                icon: '✅',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
                title: 'Application Approved!',
                description: 'Congratulations! Your application has been approved. You can now manage your gym listing.'
            },
            rejected: {
                icon: '❌',
                color: 'text-red-400',
                bg: 'bg-red-500/10',
                border: 'border-red-500/20',
                title: 'Application Rejected',
                description: 'Unfortunately, your application was not approved. Please contact support for more information.'
            }
        };
        return configs[status] || configs.pending;
    };

    const statusConfig = getStatusConfig(application?.status);

    return (
        <MainLayout>
            <Head title="Application Status" />
            
            <div className="max-w-2xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
                        📋 Application Status
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                        Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Application</span>
                    </h1>
                </div>

                {application ? (
                    <div className="space-y-8">
                        {/* Status Card */}
                        <div className={`glass-card rounded-2xl p-8 backdrop-blur-xl bg-white/5 border ${statusConfig.border}`}>
                            <div className="flex flex-col items-center text-center">
                                <div className={`text-5xl mb-4 ${statusConfig.color}`}>
                                    {statusConfig.icon}
                                </div>
                                <h2 className={`text-2xl font-bold ${statusConfig.color}`}>
                                    {statusConfig.title}
                                </h2>
                                <p className="text-slate-400 text-sm mt-2 max-w-md">
                                    {statusConfig.description}
                                </p>
                                
                                <div className="w-full mt-6 pt-6 border-t border-white/10">
                                    <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div className="text-left">
                                            <p className="text-slate-500">Application ID</p>
                                            <p className="text-white font-semibold mt-1">#{application.id}</p>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-slate-500">Submitted On</p>
                                            <p className="text-white font-semibold mt-1">
                                                {new Date(application.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Application Details */}
                        <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                            <h3 className="text-sm font-bold text-white mb-4">Application Details</h3>
                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between py-2 border-b border-white/5">
                                    <span className="text-slate-400">Type</span>
                                    <span className="text-white font-medium capitalize">
                                        {application.gym_id ? 'Claim Existing Gym' : 'Register New Gym'}
                                    </span>
                                </div>
                                {application.gym_id ? (
                                    <div className="flex justify-between py-2 border-b border-white/5">
                                        <span className="text-slate-400">Claiming Gym</span>
                                        <span className="text-white font-medium">{application.gym?.name || 'N/A'}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between py-2 border-b border-white/5">
                                            <span className="text-slate-400">Gym Name</span>
                                            <span className="text-white font-medium">
                                                {application.proposed_gym_details?.name || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-slate-400">Address</span>
                                            <span className="text-white font-medium text-right max-w-[200px]">
                                                {application.proposed_gym_details?.address || 'N/A'}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Actions based on status */}
                        <div className="text-center">
                            {application.status === 'pending' && (
                                <>
                                    <p className="text-xs text-slate-400 mb-4">
                                        Need to update your application or have questions?
                                    </p>
                                    <Link
                                        href="/"
                                        className="inline-block text-sm font-semibold text-white/60 hover:text-white px-6 py-3 rounded-xl transition-all hover:bg-white/5"
                                    >
                                        Return to Home
                                    </Link>
                                </>
                            )}

                            {application.status === 'approved' && (
                                <Link
                                    href="/owner/dashboard"
                                    className="inline-block bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-105"
                                >
                                    Go to Owner Dashboard →
                                </Link>
                            )}

                            {application.status === 'rejected' && (
                                <Link
                                    href="/apply-owner"
                                    className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-105"
                                >
                                    Submit New Application
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl p-8 backdrop-blur-xl bg-white/5 border-white/10 text-center">
                        <div className="text-5xl mb-4">📭</div>
                        <h2 className="text-xl font-bold text-white mb-2">No Application Found</h2>
                        <p className="text-slate-400 text-sm mb-6">
                            You haven't submitted any gym owner application yet.
                        </p>
                        <Link
                            href="/apply-owner"
                            className="inline-block bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-105"
                        >
                            Apply to Become a Gym Owner
                        </Link>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}