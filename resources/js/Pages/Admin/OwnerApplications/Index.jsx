import React, { useState, useEffect, useRef } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ applications, filters, statusCounts }) {
    const [search, setSearch] = useState('');
    const [processingId, setProcessingId] = useState(null);
    const isFirstRender = useRef(true);

    // Filter status tabs helper
    const currentStatus = filters.status || 'pending';

    // Use statusCounts from props (passed from controller)
    const totalApplications = statusCounts?.all || applications.total || 0;

    // Debounced Search Effect
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                route('admin.owner-applications.index'),
                { status: currentStatus || undefined, search: search || undefined },
                { preserveState: true, replace: true }
            );
        }, 350);

        return () => clearTimeout(timer);
    }, [search, currentStatus]);

    // Status Badge Component Helper
    const renderStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Approved
                    </span>
                );
            case 'pending':
                return (
                    <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Pending
                    </span>
                );
            case 'rejected':
                return (
                    <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Rejected
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

    // Quick Action Handlers
    const handleAction = (id, actionRoute, confirmMessage) => {
        if (confirmMessage && !confirm(confirmMessage)) return;

        setProcessingId(id);
        router.post(
            route(actionRoute, id),
            {},
            {
                onFinish: () => setProcessingId(null),
                preserveScroll: true,
            }
        );
    };

    const handleFilterStatus = (statusValue) => {
        router.get(
            route('admin.owner-applications.index'),
            { status: statusValue || undefined, search: search || undefined },
            { preserveState: true, replace: true }
        );
    };

    // Get application type label
    const getApplicationType = (application) => {
        if (application.gym_id) {
            return 'Claim Existing';
        }
        return 'Register New';
    };

    return (
        <div className="space-y-6 pb-12">
            <Head title="Owner Applications" />

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Owner Applications</h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Review and manage gym owner applications from users wanting to claim or register gyms.
                    </p>
                </div>
            </div>

            {/* STATUS COUNTER TABS */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {[
                    { key: 'pending', label: 'Pending Review', count: statusCounts?.pending || 0, color: 'text-amber-400', alert: (statusCounts?.pending || 0) > 0 },
                    { key: 'approved', label: 'Approved', count: statusCounts?.approved || 0, color: 'text-emerald-400' },
                    { key: 'rejected', label: 'Rejected', count: statusCounts?.rejected || 0, color: 'text-rose-400' },
                    { key: 'all', label: 'All Applications', count: totalApplications, color: 'text-slate-200' },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleFilterStatus(tab.key === 'all' ? '' : tab.key)}
                        className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                            (currentStatus === tab.key || (tab.key === 'all' && !currentStatus))
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
                        placeholder="Search by user name or gym..."
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
                    Showing <span className="text-slate-200 font-bold">{applications.data?.length || 0}</span> of <span className="text-slate-200 font-bold">{applications.total || 0}</span> applications
                </div>
            </div>

            {/* DATA TABLE CARD */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950/80 uppercase text-[10px] font-bold tracking-wider text-slate-400 border-b border-slate-800">
                            <tr>
                                <th scope="col" className="px-6 py-4">Applicant</th>
                                <th scope="col" className="px-6 py-4">Application Type</th>
                                <th scope="col" className="px-6 py-4">Gym / Details</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                                <th scope="col" className="px-6 py-4">Submitted</th>
                                <th scope="col" className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                            {applications.data && applications.data.length > 0 ? (
                                applications.data.map((application) => (
                                    <tr key={application.id} className="hover:bg-slate-800/40 transition-colors">
                                        {/* Applicant */}
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-100 text-sm">{application.user?.name || 'Unknown User'}</div>
                                            <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                                                {application.user?.email || 'No email'}
                                            </div>
                                        </td>

                                        {/* Application Type */}
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${
                                                application.gym_id 
                                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                    : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                            }`}>
                                                {getApplicationType(application)}
                                            </span>
                                        </td>

                                        {/* Gym / Details */}
                                        <td className="px-6 py-4">
                                            {application.gym_id ? (
                                                <div>
                                                    <div className="font-semibold text-slate-200">{application.gym?.name || 'Unknown Gym'}</div>
                                                    <div className="text-[11px] text-slate-500">{application.gym?.address || 'No address'}</div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="font-semibold text-slate-200">
                                                        {application.proposed_gym_details?.name || 'New Gym'}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500">
                                                        {application.proposed_gym_details?.address || 'No address'}
                                                    </div>
                                                </div>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            {renderStatusBadge(application.status)}
                                        </td>

                                        {/* Submitted Date */}
                                        <td className="px-6 py-4 text-slate-400">
                                            {new Date(application.created_at).toLocaleDateString()}
                                            <div className="text-[10px] text-slate-500">
                                                {new Date(application.created_at).toLocaleTimeString()}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* View Details */}
                                                <Link
                                                    href={route('admin.owner-applications.show', application.id)}
                                                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 font-bold transition-all text-xs"
                                                >
                                                    View
                                                </Link>

                                                {/* Approve Action - Only for pending */}
                                                {application.status === 'pending' && (
                                                    <button
                                                        disabled={processingId === application.id}
                                                        onClick={() => handleAction(
                                                            application.id, 
                                                            'admin.owner-applications.approve',
                                                            `Approve ${application.user?.name || 'this user'}'s application?`
                                                        )}
                                                        className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-bold transition-all disabled:opacity-50 text-xs"
                                                    >
                                                        Approve
                                                    </button>
                                                )}

                                                {/* Reject Action - Only for pending */}
                                                {application.status === 'pending' && (
                                                    <button
                                                        disabled={processingId === application.id}
                                                        onClick={() => handleAction(
                                                            application.id, 
                                                            'admin.owner-applications.reject',
                                                            `Reject ${application.user?.name || 'this user'}'s application?`
                                                        )}
                                                        className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 px-3 py-1.5 rounded-lg font-bold transition-all disabled:opacity-50 text-xs"
                                                    >
                                                        Reject
                                                    </button>
                                                )}

                                                {/* Document Download */}
                                                {application.business_doc_path && (
                                                    <a
                                                        href={application.business_doc_path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-slate-400 hover:text-amber-400 p-1.5 rounded-lg hover:bg-slate-800/50 transition-all"
                                                        title="Download Document"
                                                    >
                                                        📄
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        <div className="text-3xl mb-2">📋</div>
                                        <p className="font-semibold text-slate-400">No applications found</p>
                                        <p className="text-[11px] text-slate-600 mt-1">Try adjusting your filters or search terms.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION FOOTER */}
                {applications.links && applications.links.length > 3 && (
                    <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                            Page <span className="text-slate-300 font-bold">{applications.current_page}</span> of <span className="text-slate-300 font-bold">{applications.last_page}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {applications.links.map((link, key) => (
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
        </div>
    );
}

// Persistent Inertia Layout Assignment
Index.layout = (page) => <AdminLayout>{page}</AdminLayout>;