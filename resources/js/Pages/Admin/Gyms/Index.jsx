import React, { useState, useEffect, useRef } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ gyms, filters, statusCounts }) {
    const [search, setSearch] = useState(filters.search || '');
    const [processingId, setProcessingId] = useState(null);
    const [notification, setNotification] = useState(null);
    const isFirstRender = useRef(true);

    // Filter status tabs helper
    const currentStatus = filters.status || '';

    // Calculate total count across all statuses
    const totalGymsCount = Object.values(statusCounts || {}).reduce(
        (acc, curr) => acc + Number(curr),
        0
    );

    // Debounced Search Effect - FIXED: Added currentStatus to dependencies
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                route('admin.gyms.index'),
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
            case 'suspended':
                return (
                    <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Suspended
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
            }
        );
    };

    const handleDelete = (id, name) => {
        showNotification(
            'danger',
            `Are you sure you want to permanently delete "${name}"? This action cannot be undone.`,
            () => {
                setProcessingId(id);
                router.delete(route('admin.gyms.destroy', id), {
                    onFinish: () => {
                        setProcessingId(null);
                        closeNotification();
                    },
                    preserveScroll: true,
                });
            }
        );
    };

    const handleFilterStatus = (statusValue) => {
        router.get(
            route('admin.gyms.index'),
            { status: statusValue || undefined, search: search || undefined },
            { preserveState: true, replace: true }
        );
    };

    // Handle search input change with immediate feedback
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        
        if (value === '') {
            router.get(
                route('admin.gyms.index'),
                { status: currentStatus || undefined, search: undefined },
                { preserveState: true, replace: true }
            );
        }
    };

    // Handle Enter key press for immediate search
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            router.get(
                route('admin.gyms.index'),
                { status: currentStatus || undefined, search: search || undefined },
                { preserveState: true, replace: true }
            );
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <Head title="Gym Directory & Approvals" />

            {/* NOTIFICATION MODAL */}
            {notification && notification.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header with icon */}
                        <div className="px-6 pt-6 pb-4">
                            <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                    notification.type === 'danger' 
                                        ? 'bg-rose-500/10 text-rose-400' 
                                        : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                    {notification.type === 'danger' ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-white">
                                        {notification.type === 'danger' ? 'Confirm Deletion' : 'Confirm Action'}
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
                                        : 'bg-amber-500 hover:bg-amber-600 border-amber-500/30 hover:border-amber-400'
                                }`}
                            >
                                {notification.type === 'danger' ? 'Delete' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Gym Directory</h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Review pending approvals, inspect active listings, and manage gym statuses.
                    </p>
                </div>
            </div>

            {/* STATUS COUNTER TABS */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                    { key: '', label: 'All Gyms', count: totalGymsCount, color: 'text-slate-200' },
                    { key: 'pending', label: 'Pending Queue', count: statusCounts.pending || 0, color: 'text-amber-400', alert: (statusCounts.pending || 0) > 0 },
                    { key: 'approved', label: 'Approved Live', count: statusCounts.approved || 0, color: 'text-emerald-400' },
                    { key: 'rejected', label: 'Rejected', count: statusCounts.rejected || 0, color: 'text-rose-400' },
                    { key: 'suspended', label: 'Suspended', count: statusCounts.suspended || 0, color: 'text-slate-400' },
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
                        onChange={handleSearchChange}
                        onKeyDown={handleSearchKeyDown}
                        placeholder="Search gym name..."
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-slate-600"
                    />
                    {search && (
                        <button
                            onClick={() => {
                                setSearch('');
                                router.get(
                                    route('admin.gyms.index'),
                                    { status: currentStatus || undefined, search: undefined },
                                    { preserveState: true, replace: true }
                                );
                            }}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-500 hover:text-slate-300"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="text-xs text-slate-500 font-mono w-full sm:w-auto text-right">
                    Showing <span className="text-slate-200 font-bold">{gyms.data?.length || 0}</span> of <span className="text-slate-200 font-bold">{gyms.total || 0}</span> listings
                </div>
            </div>

            {/* DATA TABLE CARD */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950/80 uppercase text-[10px] font-bold tracking-wider text-slate-400 border-b border-slate-800">
                            <tr>
                                <th scope="col" className="px-6 py-4">Gym Info</th>
                                <th scope="col" className="px-6 py-4">Location</th>
                                <th scope="col" className="px-6 py-4">Owner</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                                <th scope="col" className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                            {gyms.data && gyms.data.length > 0 ? (
                                gyms.data.map((gym) => (
                                    <tr key={gym.id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-100 text-sm">{gym.name}</div>
                                            <div className="text-slate-500 text-[11px] mt-0.5">
                                                Added: {gym.created_at ? new Date(gym.created_at).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-slate-300">
                                            <div>{gym.city?.name || 'Unassigned City'}</div>
                                            <div className="text-[11px] text-slate-500">
                                                {gym.district?.name ? `${gym.district.name}, ` : ''}{gym.state?.name || ''}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            {gym.owner ? (
                                                <div>
                                                    <div className="font-semibold text-slate-200">{gym.owner.name}</div>
                                                    <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                                                        {gym.owner.email}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-500 italic">Unclaimed</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4">
                                            {renderStatusBadge(gym.status)}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route('admin.gyms.show', gym.id)}
                                                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 font-bold transition-all"
                                                >
                                                    View
                                                </Link>

                                                {gym.status !== 'approved' && gym.status !== 'suspended' && (
                                                    <button
                                                        disabled={processingId === gym.id}
                                                        onClick={() => handleAction(gym.id, 'admin.gyms.approve')}
                                                        className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-bold transition-all disabled:opacity-50"
                                                    >
                                                        Approve
                                                    </button>
                                                )}

                                                {gym.status === 'pending' && (
                                                    <button
                                                        disabled={processingId === gym.id}
                                                        onClick={() => handleAction(gym.id, 'admin.gyms.reject')}
                                                        className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 px-3 py-1.5 rounded-lg font-bold transition-all disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                )}

                                                {gym.status === 'approved' && (
                                                    <button
                                                        disabled={processingId === gym.id}
                                                        onClick={() => handleAction(
                                                            gym.id, 
                                                            'admin.gyms.suspend', 
                                                            `Are you sure you want to suspend "${gym.name}"? This will temporarily deactivate the listing.`,
                                                            'warning'
                                                        )}
                                                        className="bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/20 px-3 py-1.5 rounded-lg font-bold transition-all disabled:opacity-50"
                                                    >
                                                        Suspend
                                                    </button>
                                                )}

                                                <button
                                                    disabled={processingId === gym.id}
                                                    onClick={() => handleDelete(gym.id, gym.name)}
                                                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all"
                                                    title="Delete Gym"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        <div className="text-3xl mb-2">🏋️‍♂️</div>
                                        <p className="font-semibold text-slate-400">No gyms found matching the criteria.</p>
                                        <p className="text-[11px] text-slate-600 mt-1">Try resetting search filters.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION FOOTER */}
                {gyms.links && gyms.links.length > 3 && (
                    <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                            Page <span className="text-slate-300 font-bold">{gyms.current_page}</span> of <span className="text-slate-300 font-bold">{gyms.last_page}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {gyms.links.map((link, key) => (
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