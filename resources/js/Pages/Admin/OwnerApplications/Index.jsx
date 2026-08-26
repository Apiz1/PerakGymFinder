import React, { useState, useEffect, useRef } from 'react';
import { Link, router, Head, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ applications, filters, statusCounts }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState('');
    const [processingId, setProcessingId] = useState(null);
    const [notification, setNotification] = useState(null);
    const [toast, setToast] = useState(null);
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

    // Show toast message from flash
    useEffect(() => {
        if (flash?.success) {
            setToast({
                type: 'success',
                message: flash.success
            });
            // Auto dismiss after 5 seconds
            const timer = setTimeout(() => {
                setToast(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
        if (flash?.error) {
            setToast({
                type: 'error',
                message: flash.error
            });
            const timer = setTimeout(() => {
                setToast(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Notification Helper
    const showNotification = (type, message, onConfirm) => {
        setNotification({
            type,
            message,
            onConfirm,
            isOpen: true
        });
    };

    const closeNotification = () => {
        setNotification(null);
    };

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
                }
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

    const handleDelete = (id, name) => {
        showNotification(
            'danger',
            `Are you sure you want to permanently delete this application from "${name}"? This action cannot be undone.`,
            () => {
                router.delete(route('admin.owner-applications.destroy', id), {
                    preserveScroll: true,
                    preserveState: true,
                    onFinish: () => {
                        closeNotification();
                    },
                });
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
                            onClick={() => setToast(null)}
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
                                    notification.type === 'danger' 
                                        ? 'bg-rose-500/10 text-rose-400'
                                        : notification.type === 'warning'
                                        ? 'bg-amber-500/10 text-amber-400'
                                        : 'bg-emerald-500/10 text-emerald-400'
                                }`}>
                                    {notification.type === 'danger' ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    ) : notification.type === 'warning' ? (
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
                                        {notification.type === 'danger' ? 'Confirm Deletion' : 
                                         notification.type === 'warning' ? 'Confirm Action' : 
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
                                    notification.type === 'danger'
                                        ? 'bg-rose-500 hover:bg-rose-600 border-rose-500/30 hover:border-rose-400'
                                        : notification.type === 'warning'
                                        ? 'bg-amber-500 hover:bg-amber-600 border-amber-500/30 hover:border-amber-400'
                                        : 'bg-emerald-500 hover:bg-emerald-600 border-emerald-500/30 hover:border-emerald-400'
                                }`}
                            >
                                {notification.type === 'danger' ? 'Delete' : 
                                 notification.type === 'warning' ? 'Confirm' : 
                                 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                                            `Are you sure you want to approve ${application.user?.name || 'this user'}'s application to become a gym owner?`,
                                                            'success'
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
                                                            `Are you sure you want to reject ${application.user?.name || 'this user'}'s application?`,
                                                            'warning'
                                                        )}
                                                        className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 px-3 py-1.5 rounded-lg font-bold transition-all disabled:opacity-50 text-xs"
                                                    >
                                                        Reject
                                                    </button>
                                                )}

                                                {/* Delete Application */}
                                                <button
                                                    onClick={() => handleDelete(application.id, application.user?.name || 'Unknown User')}
                                                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all"
                                                    title="Delete Application"
                                                >
                                                    🗑️
                                                </button>
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