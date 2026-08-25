import React, { useState, useEffect, useCallback } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { formatDistanceToNow } from 'date-fns';

export default function Index({ notifications, unreadCount, pagination }) {
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [notification, setNotification] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

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

    // Format notification time
    const formatTime = (date) => {
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    };

    // Get notification icon based on type
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'gym_approved':
                return '✅';
            case 'gym_rejected':
                return '❌';
            case 'gym_suspended':
                return '⛔';
            case 'gym_pending':
                return '⏳';
            case 'gym_report':
                return '⚠️';
            case 'gym_review':
                return '⭐';
            case 'system':
                return '🔔';
            default:
                return '📌';
        }
    };

    // Get notification color based on type
    const getNotificationColor = (type, readAt) => {
        const isRead = !!readAt;
        const baseColor = isRead ? 'border-slate-800' : 'border-amber-500/30';
        
        if (isRead) return `bg-slate-900/40 border-slate-800`;
        
        switch (type) {
            case 'gym_approved':
                return `bg-emerald-500/5 border-emerald-500/30`;
            case 'gym_rejected':
                return `bg-rose-500/5 border-rose-500/30`;
            case 'gym_suspended':
                return `bg-amber-500/5 border-amber-500/30`;
            case 'gym_report':
                return `bg-rose-500/5 border-rose-500/30`;
            case 'gym_pending':
                return `bg-amber-500/5 border-amber-500/30`;
            default:
                return `bg-slate-900/40 border-slate-800`;
        }
    };

    // Mark single notification as read
    const markAsRead = (id) => {
        setIsProcessing(true);
        router.post(
            route('admin.notifications.read', id),
            {},
            {
                onFinish: () => {
                    setIsProcessing(false);
                    // Refresh the page to update the list
                    router.reload({ preserveScroll: true });
                },
            }
        );
    };

    // Mark all as read
    const markAllAsRead = () => {
        showNotification(
            'warning',
            'Are you sure you want to mark all notifications as read?',
            () => {
                setIsProcessing(true);
                router.post(
                    route('admin.notifications.read-all'),
                    {},
                    {
                        onFinish: () => {
                            setIsProcessing(false);
                            closeNotification();
                            router.reload({ preserveScroll: true });
                        },
                    }
                );
            }
        );
    };

    // Handle notification click - mark as read and navigate
    const handleNotificationClick = (notification) => {
        if (!notification.read_at) {
            markAsRead(notification.id);
        }
        
        // Navigate based on notification data
        if (notification.data?.url) {
            router.visit(notification.data.url);
        }
    };

    // Filter notifications
    const getFilteredNotifications = () => {
        if (!notifications) return [];
        
        switch (filter) {
            case 'unread':
                return notifications.filter(n => !n.read_at);
            case 'read':
                return notifications.filter(n => n.read_at);
            default:
                return notifications;
        }
    };

    const filteredNotifications = getFilteredNotifications();
    const totalUnread = unreadCount || 0;

    return (
        <div className="space-y-6 pb-12">
            <Head title="Notifications" />

            {/* NOTIFICATION MODAL */}
            {notification && notification.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 pt-6 pb-4">
                            <div className="flex items-start gap-4">
                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                    notification.type === 'warning' 
                                        ? 'bg-amber-500/10 text-amber-400'
                                        : 'bg-rose-500/10 text-rose-400'
                                }`}>
                                    {notification.type === 'warning' ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-bold text-white">Confirm Action</h3>
                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                        {notification.message}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 pb-6 flex flex-col sm:flex-row items-center justify-end gap-3">
                            <button
                                onClick={closeNotification}
                                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={notification.onConfirm}
                                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl border border-amber-500/30 hover:border-amber-400 transition-all"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Notifications</h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Stay updated with gym approvals, reports, and system alerts.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {totalUnread > 0 && (
                        <button
                            onClick={markAllAsRead}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl border border-amber-500/20 transition-all disabled:opacity-50"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Mark All as Read
                        </button>
                    )}
                    <Link
                        href={route('admin.dashboard')}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Back to Dashboard</span>
                    </Link>
                </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</div>
                    <div className="text-2xl font-black text-white mt-1">{notifications?.length || 0}</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unread</div>
                    <div className="text-2xl font-black text-amber-400 mt-1">{totalUnread}</div>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Read</div>
                    <div className="text-2xl font-black text-emerald-400 mt-1">{(notifications?.length || 0) - totalUnread}</div>
                </div>
            </div>

            {/* FILTER TABS */}
            <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
                {[
                    { id: 'all', label: 'All Notifications', count: notifications?.length || 0 },
                    { id: 'unread', label: 'Unread', count: totalUnread, alert: totalUnread > 0 },
                    { id: 'read', label: 'Read', count: (notifications?.length || 0) - totalUnread },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                            filter === tab.id
                                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                    >
                        <span>{tab.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            filter === tab.id
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-slate-800 text-slate-400'
                        }`}>
                            {tab.count}
                        </span>
                        {tab.alert && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        )}
                    </button>
                ))}
            </div>

            {/* NOTIFICATIONS LIST */}
            <div className="space-y-3">
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] ${
                                getNotificationColor(notification.type, notification.read_at)
                            } ${!notification.read_at ? 'ring-1 ring-amber-500/20' : ''}`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xl">
                                    {getNotificationIcon(notification.type)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h4 className={`text-sm font-bold ${
                                                !notification.read_at ? 'text-white' : 'text-slate-300'
                                            }`}>
                                                {notification.data?.title || 'Notification'}
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                                {notification.data?.message || notification.message || 'No message provided'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                                {formatTime(notification.created_at)}
                                            </span>
                                            {!notification.read_at && (
                                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action buttons (if not read) */}
                                    {!notification.read_at && notification.data?.action_url && (
                                        <div className="mt-3 flex items-center gap-2">
                                            <Link
                                                href={notification.data.action_url}
                                                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                View Details →
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center">
                        <div className="text-5xl mb-4">🔔</div>
                        <p className="text-sm font-semibold text-slate-400">No notifications found</p>
                        <p className="text-xs text-slate-500 mt-1">
                            {filter === 'all' 
                                ? 'You\'re all caught up!' 
                                : filter === 'unread' 
                                ? 'You have no unread notifications' 
                                : 'You haven\'t read any notifications yet'}
                        </p>
                    </div>
                )}
            </div>

            {/* PAGINATION (if needed) */}
            {pagination && pagination.last_page > 1 && (
                <div className="px-6 py-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                        Page <span className="text-slate-300 font-bold">{pagination.current_page}</span> of <span className="text-slate-300 font-bold">{pagination.last_page}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        {pagination.links.map((link, key) => (
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
    );
}

// Persistent Inertia Layout Assignment
Index.layout = (page) => <AdminLayout>{page}</AdminLayout>;