import React, { useState, useEffect, useRef } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ reviews, filters, statusCounts }) {
    const [search, setSearch] = useState(filters.search || '');
    const [processingId, setProcessingId] = useState(null);
    const [notification, setNotification] = useState(null);
    const isFirstRender = useRef(true);

    // Filter status tabs helper
    const currentStatus = filters.status || '';

    // Debounced Search Effect
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                route('admin.reviews.index'),
                { status: currentStatus || undefined, search: search || undefined },
                { preserveState: true, replace: true }
            );
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    // Auto-hide notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

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
            case 'flagged':
                return (
                    <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Flagged
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

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to permanently delete this review? This action cannot be undone.')) {
            setProcessingId(id);
            router.delete(route('admin.reviews.destroy', id), {
                onFinish: () => setProcessingId(null),
                preserveScroll: true,
            });
        }
    };

    const handleFilterStatus = (statusValue) => {
        router.get(
            route('admin.reviews.index'),
            { status: statusValue || undefined, search: search || undefined },
            { preserveState: true, replace: true }
        );
    };

    const closeNotification = () => {
        setNotification(null);
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-MY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get rating stars
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        const stars = [];

        for (let i = 0; i < fullStars; i++) {
            stars.push('⭐');
        }
        if (hasHalfStar) {
            stars.push('🌟');
        }
        for (let i = 0; i < emptyStars; i++) {
            stars.push('☆');
        }

        return (
            <div className="flex items-center gap-0.5">
                {stars.map((star, index) => (
                    <span key={index} className="text-sm">
                        {star}
                    </span>
                ))}
            </div>
        );
    };

    const totalReviews = statusCounts?.all || reviews.total || 0;

    return (
        <div className="space-y-6 pb-12">
            <Head title="Review Moderation" />

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

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Review Moderation</h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Moderate user reviews across all gyms. Approve, flag, or delete reviews as needed.
                    </p>
                </div>
            </div>

            {/* STATUS COUNTER TABS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { key: '', label: 'All Reviews', count: totalReviews, color: 'text-slate-200' },
                    { key: 'pending', label: 'Pending Review', count: statusCounts?.pending || 0, color: 'text-amber-400', alert: (statusCounts?.pending || 0) > 0 },
                    { key: 'approved', label: 'Approved', count: statusCounts?.approved || 0, color: 'text-emerald-400' },
                    { key: 'flagged', label: 'Flagged', count: statusCounts?.flagged || 0, color: 'text-rose-400', alert: (statusCounts?.flagged || 0) > 0 },
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
                        placeholder="Search by user or gym name..."
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
                    Showing <span className="text-slate-200 font-bold">{reviews.data?.length || 0}</span> of <span className="text-slate-200 font-bold">{reviews.total || 0}</span> reviews
                </div>
            </div>

            {/* DATA TABLE CARD */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950/80 uppercase text-[10px] font-bold tracking-wider text-slate-400 border-b border-slate-800">
                            <tr>
                                <th scope="col" className="px-6 py-4">Review</th>
                                <th scope="col" className="px-6 py-4">Gym</th>
                                <th scope="col" className="px-6 py-4">User</th>
                                <th scope="col" className="px-6 py-4">Rating</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                                <th scope="col" className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                            {reviews.data && reviews.data.length > 0 ? (
                                reviews.data.map((review) => (
                                    <tr key={review.id} className="hover:bg-slate-800/40 transition-colors">
                                        {/* Review Content */}
                                        <td className="px-6 py-4">
                                            <div className="max-w-[200px]">
                                                <div className="text-sm font-semibold text-white truncate">
                                                    {review.comment || 'No comment provided'}
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">
                                                    {formatDate(review.created_at)}
                                                </div>
                                                {review.reply && (
                                                    <div className="mt-1 text-[10px] text-emerald-400 flex items-center gap-1">
                                                        <span>💬</span>
                                                        <span className="truncate">{review.reply.reply}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Gym */}
                                        <td className="px-6 py-4">
                                            <Link 
                                                href={route('admin.gyms.show', review.gym.id)}
                                                className="text-slate-200 hover:text-amber-400 transition font-semibold"
                                            >
                                                {review.gym?.name || 'Unknown Gym'}
                                            </Link>
                                        </td>

                                        {/* User */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-semibold text-slate-200">{review.user?.name || 'Anonymous'}</div>
                                                <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                                                    {review.user?.email || 'No email'}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Rating */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-start gap-1">
                                                {renderStars(review.rating)}
                                                <span className="text-xs font-bold text-amber-400">
                                                    {review.rating.toFixed(1)}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            {renderStatusBadge(review.status)}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Approve Action */}
                                                {review.status !== 'approved' && (
                                                    <button
                                                        disabled={processingId === review.id}
                                                        onClick={() => handleAction(review.id, 'admin.reviews.approve')}
                                                        className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-bold transition-all disabled:opacity-50 text-xs"
                                                    >
                                                        Approve
                                                    </button>
                                                )}

                                                {/* Flag Action */}
                                                {review.status !== 'flagged' && review.status !== 'pending' && (
                                                    <button
                                                        disabled={processingId === review.id}
                                                        onClick={() => handleAction(review.id, 'admin.reviews.flag', `Flag this review?`)}
                                                        className="bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/20 px-3 py-1.5 rounded-lg font-bold transition-all disabled:opacity-50 text-xs"
                                                    >
                                                        Flag
                                                    </button>
                                                )}

                                                {/* Delete Action */}
                                                <button
                                                    disabled={processingId === review.id}
                                                    onClick={() => handleDelete(review.id)}
                                                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all"
                                                    title="Delete Review"
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
                                        <div className="text-3xl mb-2">💬</div>
                                        <p className="font-semibold text-slate-400">No reviews found matching the criteria.</p>
                                        <p className="text-[11px] text-slate-600 mt-1">Try adjusting your filters or search terms.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION FOOTER */}
                {reviews.links && reviews.links.length > 3 && (
                    <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                            Page <span className="text-slate-300 font-bold">{reviews.current_page}</span> of <span className="text-slate-300 font-bold">{reviews.last_page}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {reviews.links.map((link, key) => (
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
                        <h3 className="text-sm font-bold text-white">Moderation Guidelines</h3>
                        <ul className="mt-2 space-y-1 text-xs text-slate-400">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">Approve:</strong> Reviews that are genuine, constructive, and follow community guidelines</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">Flag:</strong> Reviews that are suspicious, contain inappropriate content, or violate guidelines</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">Delete:</strong> Reviews that are spam, fake, or severely violate guidelines</span>
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