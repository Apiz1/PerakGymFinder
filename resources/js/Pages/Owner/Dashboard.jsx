import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import OwnerLayout from '@/Layouts/OwnerLayout';

export default function Dashboard({ gym = null, recentReviews = [], stats = {} }) {
    const [isProcessing, setIsProcessing] = useState(false);

    // Check if owner has a gym
    const hasGym = !!gym;

    // Get gym status badge
    const getGymStatusBadge = () => {
        if (!gym) return null;
        
        const statusConfigs = {
            approved: { label: '✅ Live', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' },
            pending: { label: '⏳ Pending Approval', color: 'bg-amber-500/20 text-amber-400 border-amber-500/20' },
            rejected: { label: '❌ Rejected', color: 'bg-rose-500/20 text-rose-400 border-rose-500/20' },
            suspended: { label: '⛔ Suspended', color: 'bg-red-500/20 text-red-400 border-red-500/20' },
        };
        
        return statusConfigs[gym.status] || statusConfigs.pending;
    };

    // Handle quick actions
    const handleQuickAction = (action, confirmMessage) => {
        if (confirmMessage && !confirm(confirmMessage)) return;
        setIsProcessing(true);
        setTimeout(() => setIsProcessing(false), 1000);
    };

    return (
        <div className="space-y-8 pb-6">
            {/* 1. TOP HEADER & GYM IDENTITY */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/60 backdrop-blur-sm">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-black text-white tracking-tight">
                            {hasGym ? gym.name : 'Owner Dashboard'}
                        </h1>
                        {hasGym && (
                            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getGymStatusBadge()?.color || ''}`}>
                                {getGymStatusBadge()?.label || 'Pending'}
                            </span>
                        )}
                        {!hasGym && (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                Setup Required
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        {hasGym 
                            ? `Manage your gym listing, track performance, and engage with your community.`
                            : 'Create your gym listing to start managing your business on GymFinder Perak.'}
                    </p>
                </div>
                {hasGym ? (
                    <Link
                        href="/owner/gym/edit"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <span>Edit Gym</span>
                    </Link>
                ) : (
                    <Link
                        href="/owner/gym/create"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Create Your Gym</span>
                    </Link>
                )}
            </div>

            {/* 2. METRICS CARDS GRID - MATCHED TO CONTROLLER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1 - Total Views */}
                <div className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 shadow-xl group">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-400 text-xs font-semibold">Total Views</span>
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white mt-3 tracking-tight">
                        {stats.totalViews || 0}
                    </div>
                    <div className="text-[11px] text-emerald-400 mt-2 font-medium flex items-center gap-1">
                        <span>↑</span>
                        <span>{stats.viewsThisWeek !== null ? `${stats.viewsThisWeek} this week` : 'No data yet'}</span>
                    </div>
                </div>

                {/* Metric 2 - Average Rating */}
                <div className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 shadow-xl group">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-400 text-xs font-semibold">Average Rating</span>
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white mt-3 tracking-tight">
                        {stats.averageRating !== undefined ? Number(stats.averageRating).toFixed(1) : '0.0'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-2 font-medium flex items-center gap-1">
                        <span>★</span>
                        <span>Based on {stats.totalReviews || 0} reviews</span>
                    </div>
                </div>

                {/* Metric 3 - Total Reviews */}
                <div className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 shadow-xl group">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-400 text-xs font-semibold">Total Reviews</span>
                        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white mt-3 tracking-tight">
                        {stats.totalReviews || 0}
                    </div>
                    <div className="text-[11px] text-amber-400 mt-2 font-medium flex items-center gap-1">
                        <span>💬</span>
                        <span>{stats.pendingReplies || 0} pending replies</span>
                    </div>
                </div>

                {/* Metric 4 - Favorites/Saves */}
                <div className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 shadow-xl group">
                    <div className="flex justify-between items-start">
                        <span className="text-slate-400 text-xs font-semibold">Favorites</span>
                        <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white mt-3 tracking-tight">
                        {stats.favoritesCount || 0}
                    </div>
                    <div className="text-[11px] text-emerald-400 mt-2 font-medium flex items-center gap-1">
                        <span>↑</span>
                        <span>{stats.favoritesThisWeek || 0} new this week</span>
                    </div>
                </div>
            </div>

            {/* 3. ACTIONABLE SECTIONS - Only show if gym exists */}
            {hasGym ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Reviews Table */}
                    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col">
                        <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-slate-900/40">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                                    ⭐
                                </div>
                                <h2 className="text-sm font-bold text-white tracking-wide">
                                    Recent Reviews
                                </h2>
                            </div>
                            <Link
                                href="/owner/gym/reviews"
                                className="text-xs font-medium text-amber-400 hover:text-amber-300 transition"
                            >
                                View All &rarr;
                            </Link>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-80">
                            {recentReviews && recentReviews.length > 0 ? (
                                <div className="divide-y divide-slate-800/60">
                                    {recentReviews.map((review, index) => (
                                        <div key={index} className="px-5 py-4 hover:bg-slate-800/30 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white text-sm">
                                                        {review.user?.name || 'Anonymous'}
                                                    </span>
                                                    <span className="text-xs text-amber-400 font-bold">
                                                        ★ {review.rating}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-slate-500">
                                                    {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                                {review.comment || 'No comment provided'}
                                            </p>
                                            {!review.reply && (
                                                <Link
                                                    href="/owner/gym/reviews"
                                                    className="mt-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition inline-block"
                                                >
                                                    Reply to review →
                                                </Link>
                                            )}
                                            {review.reply && (
                                                <div className="mt-2 text-xs text-emerald-400">
                                                    ✅ Replied
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 px-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-800/50 text-slate-500 flex items-center justify-center mx-auto mb-3 border border-slate-700/50 text-xl">
                                        💬
                                    </div>
                                    <p className="text-sm font-semibold text-slate-300">No reviews yet</p>
                                    <p className="text-xs text-slate-500 mt-1">Reviews will appear here once users start reviewing your gym.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions & Tips */}
                   <div className="space-y-6">
                        {/* Quick Actions Card */}
                        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                            <div className="p-5 border-b border-slate-800/80 bg-slate-900/40">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                                        ⚡
                                    </div>
                                    <h2 className="text-sm font-bold text-white tracking-wide">
                                        Quick Actions
                                    </h2>
                                </div>
                            </div>
                            <div className="p-5 space-y-3">
                                <Link
                                    href={route('owner.gym.edit')}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition group"
                                >
                                    <span className="text-xs font-medium text-slate-300 group-hover:text-white">
                                        ✏️ Edit Gym Details
                                    </span>
                                    <span className="text-xs text-slate-500 group-hover:text-amber-400 transition">
                                        Update →
                                    </span>
                                </Link>

                                <Link
                                    href={route('owner.gym.photos.index')}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition group"
                                >
                                    <span className="text-xs font-medium text-slate-300 group-hover:text-white">
                                        📸 Manage Photos
                                    </span>
                                    <span className="text-xs text-slate-500 group-hover:text-amber-400 transition">
                                        Upload →
                                    </span>
                                </Link>

                                <Link
                                    href={route('owner.gym.hours.edit')}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition group"
                                >
                                    <span className="text-xs font-medium text-slate-300 group-hover:text-white">
                                        🕒 Update Operating Hours
                                    </span>
                                    <span className="text-xs text-slate-500 group-hover:text-amber-400 transition">
                                        Update →
                                    </span>
                                </Link>

                                <Link
                                    href={route('owner.gym.memberships.index')}
                                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 transition group"
                                >
                                    <span className="text-xs font-medium text-slate-300 group-hover:text-white">
                                        💳 Manage Membership Plans
                                    </span>
                                    <span className="text-xs text-slate-500 group-hover:text-amber-400 transition">
                                        Manage →
                                    </span>
                                </Link>
                            </div>
                        </div>

                        {/* Gym Stats Card */}
                        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                            <div className="p-5 border-b border-slate-800/80 bg-slate-900/40">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-slate-700/50 text-slate-400">
                                        📊
                                    </div>
                                    <h2 className="text-sm font-bold text-white tracking-wide">
                                        Gym Performance
                                    </h2>
                                </div>
                            </div>
                            <div className="p-5 space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                    <span className="text-xs text-slate-400">Listing Status</span>
                                    <span className={`text-xs font-bold ${gym.status === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {gym.status === 'approved' ? '✅ Live' : '⏳ Pending'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                    <span className="text-xs text-slate-400">Created</span>
                                    <span className="text-xs text-slate-300 font-mono">
                                        {gym.created_at ? new Date(gym.created_at).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                    <span className="text-xs text-slate-400">Last Updated</span>
                                    <span className="text-xs text-slate-300 font-mono">
                                        {gym.updated_at ? new Date(gym.updated_at).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-xs text-slate-400">Location</span>
                                    <span className="text-xs text-slate-300">
                                        {gym.city?.name || 'Not set'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-t border-slate-800/50 pt-2 mt-2">
                                    <span className="text-xs text-slate-400">Total Views</span>
                                    <span className="text-xs text-white font-semibold">
                                        {stats.totalViews || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-xs text-slate-400">Favorites</span>
                                    <span className="text-xs text-white font-semibold">
                                        {stats.favoritesCount || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* No Gym Yet - Setup Card */
                <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20 text-4xl">
                            🏗️
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Create Your Gym Listing</h2>
                        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                            Get started by creating your gym listing on GymFinder Perak. 
                            Fill in your gym details, upload photos, and start managing your business.
                        </p>
                        <Link
                            href="/owner/gym/create"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Create Your Gym Now</span>
                        </Link>
                        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
                            <span>📋 Add details</span>
                            <span>📸 Upload photos</span>
                            <span>⏰ Set hours</span>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. TIPS & INSIGHTS - Only show if gym exists */}
            {hasGym && gym.status === 'approved' && (
                <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            💡
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">Tips to grow your gym</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                                <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
                                    <span className="text-lg block mb-1">📸</span>
                                    <p className="text-xs font-semibold text-white">Add Photos</p>
                                    <p className="text-[10px] text-slate-400">Gyms with photos get 2x more views</p>
                                </div>
                                <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
                                    <span className="text-lg block mb-1">💬</span>
                                    <p className="text-xs font-semibold text-white">Reply to Reviews</p>
                                    <p className="text-[10px] text-slate-400">Engage with your community</p>
                                </div>
                                <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30">
                                    <span className="text-lg block mb-1">🏷️</span>
                                    <p className="text-xs font-semibold text-white">Add Facilities</p>
                                    <p className="text-[10px] text-slate-400">Help users find your gym</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// 💡 Persistent Layout Setup for Inertia.js
Dashboard.layout = (page) => <OwnerLayout title="Owner Dashboard">{page}</OwnerLayout>;