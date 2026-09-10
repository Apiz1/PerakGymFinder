import React, { useState, useMemo } from 'react';
import { Link, Head } from '@inertiajs/react';
import OwnerLayout from '@/Layouts/OwnerLayout';

export default function Index({ gym, summary, ratingBreakdown, reviewsOverTime, reportStats }) {
    const [dateRange, setDateRange] = useState('30d');

    // Format number helper
    const formatNumber = (num) => {
        if (num === null || num === undefined) return '0';
        return Number(num).toLocaleString();
    };

    // Format rating helper
    const formatRating = (rating) => {
        if (rating === null || rating === undefined) return 'N/A';
        return Number(rating).toFixed(1);
    };

    // Get max value for rating breakdown bars
    const maxRatingCount = useMemo(() => {
        const values = Object.values(ratingBreakdown || {});
        return Math.max(...values, 1);
    }, [ratingBreakdown]);

    // Calculate total reviews for rating breakdown
    const totalRatingReviews = useMemo(() => {
        return Object.values(ratingBreakdown || {}).reduce((a, b) => a + b, 0);
    }, [ratingBreakdown]);

    // Get max value for reviews over time chart
    const maxReviewsOverTime = useMemo(() => {
        const values = (reviewsOverTime || []).map(d => d.count);
        return Math.max(...values, 1);
    }, [reviewsOverTime]);

    // Get all dates for the last 30 days (for chart continuity)
    const last30Days = useMemo(() => {
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    }, []);

    // Map reviews over time to full 30-day range
    const fullReviewsOverTime = useMemo(() => {
        const dataMap = {};
        (reviewsOverTime || []).forEach(item => {
            dataMap[item.date] = item.count;
        });
        
        return last30Days.map(date => ({
            date,
            count: dataMap[date] || 0
        }));
    }, [reviewsOverTime, last30Days]);

    // Get status badge
    const getStatusBadge = (status) => {
        const colors = {
            approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        return colors[status] || 'bg-slate-800 text-slate-400 border-slate-700';
    };

    // Get rating color
    const getRatingColor = (star) => {
        const colors = {
            5: 'bg-emerald-500',
            4: 'bg-emerald-400',
            3: 'bg-amber-500',
            2: 'bg-orange-500',
            1: 'bg-rose-500',
        };
        return colors[star] || 'bg-slate-500';
    };

    // Format date for chart tooltip
    const formatChartDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' });
    };

    // Calculate percentage for rating
    const getRatingPercentage = (count) => {
        if (totalRatingReviews === 0) return 0;
        return (count / totalRatingReviews) * 100;
    };

    return (
        <div className="space-y-6 pb-12">
            <Head title={`Analytics - ${gym.name}`} />

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-black text-white tracking-tight">
                            {gym.name} Analytics
                        </h1>
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusBadge(gym.status)}`}>
                            {gym.status}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        Track your gym's performance, reviews, and engagement metrics.
                    </p>
                </div>

                {/* Date Range Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Period:</span>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all appearance-none cursor-pointer"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 10px center',
                            backgroundSize: '10px'
                        }}
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="all">All time</option>
                    </select>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* Total Reviews */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/30 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">Total Reviews</span>
                        <span className="text-lg">⭐</span>
                    </div>
                    <div className="text-3xl font-black text-white mt-2">
                        {formatNumber(summary.totalReviews)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                        Approved reviews
                    </div>
                </div>

                {/* Average Rating */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/30 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">Average Rating</span>
                        <span className="text-lg">📊</span>
                    </div>
                    <div className="text-3xl font-black text-amber-400 mt-2">
                        {formatRating(summary.averageRating)}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-amber-400 text-xs">★</span>
                        <span className="text-[10px] text-slate-500">out of 5.0</span>
                    </div>
                </div>

                {/* Total Favorites */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/30 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">Favorites</span>
                        <span className="text-lg">❤️</span>
                    </div>
                    <div className="text-3xl font-black text-rose-400 mt-2">
                        {formatNumber(summary.totalFavorites)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                        Users saved your gym
                    </div>
                </div>

                {/* Active Plans */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/30 transition-all">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">Active Plans</span>
                        <span className="text-lg">💳</span>
                    </div>
                    <div className="text-3xl font-black text-emerald-400 mt-2">
                        {formatNumber(summary.activeMembershipPlans)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                        Membership plans
                    </div>
                </div>

                {/* Open Reports */}
                <div className={`bg-slate-900/80 border rounded-2xl p-5 transition-all ${
                    summary.openReports > 0 
                        ? 'border-rose-500/30 hover:border-rose-500/50' 
                        : 'border-slate-800 hover:border-amber-500/30'
                }`}>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400">Open Reports</span>
                        <span className="text-lg">🚩</span>
                    </div>
                    <div className={`text-3xl font-black mt-2 ${
                        summary.openReports > 0 ? 'text-rose-400' : 'text-slate-400'
                    }`}>
                        {formatNumber(summary.openReports)}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                        {summary.openReports > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                        )}
                        <span className="text-[10px] text-slate-500">
                            {summary.openReports > 0 ? 'Needs attention' : 'All clear'}
                        </span>
                    </div>
                </div>
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rating Breakdown */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-sm font-bold text-white">Rating Breakdown</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                                Distribution of {totalRatingReviews} reviews
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-amber-400">
                                {formatRating(summary.averageRating)}
                            </div>
                            <div className="text-[10px] text-slate-500">Average</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = ratingBreakdown?.[star] || 0;
                            const percentage = getRatingPercentage(count);
                            
                            return (
                                <div key={star} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 w-12 flex-shrink-0">
                                        <span className="text-xs text-slate-400">{star}</span>
                                        <span className="text-amber-400 text-xs">★</span>
                                    </div>
                                    <div className="flex-1 h-6 bg-slate-800/60 rounded-lg overflow-hidden relative">
                                        <div
                                            className={`h-full ${getRatingColor(star)} transition-all duration-500 rounded-lg`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-end px-2">
                                            <span className="text-[10px] font-bold text-white drop-shadow-lg">
                                                {count} ({percentage.toFixed(0)}%)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {totalRatingReviews === 0 && (
                        <div className="text-center py-8">
                            <div className="text-3xl mb-2">⭐</div>
                            <p className="text-xs text-slate-500">No reviews yet</p>
                        </div>
                    )}
                </div>

                {/* Reviews Over Time */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-sm font-bold text-white">Reviews Trend</h3>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                                Last 30 days activity
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-white">
                                {fullReviewsOverTime.reduce((sum, d) => sum + d.count, 0)}
                            </div>
                            <div className="text-[10px] text-slate-500">Total reviews</div>
                        </div>
                    </div>

                    {/* Simple Bar Chart */}
                    <div className="h-40 flex items-end gap-1 relative">
                        {fullReviewsOverTime.map((day, index) => {
                            const heightPercentage = maxReviewsOverTime > 0
                                ? (day.count / maxReviewsOverTime) * 100
                                : 0;
                            
                            return (
                                <div
                                    key={day.date}
                                    className="flex-1 group relative"
                                    style={{ minWidth: '4px' }}
                                >
                                    <div
                                        className={`w-full rounded-t transition-all duration-300 ${
                                            day.count > 0 
                                                ? 'bg-amber-500/60 hover:bg-amber-500' 
                                                : 'bg-slate-800/60'
                                        }`}
                                        style={{ 
                                            height: `${Math.max(heightPercentage, day.count > 0 ? 10 : 2)}%`,
                                            minHeight: '2px'
                                        }}
                                    />
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        <div className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 whitespace-nowrap shadow-xl">
                                            <div className="text-[10px] text-slate-400">
                                                {formatChartDate(day.date)}
                                            </div>
                                            <div className="text-xs font-bold text-white">
                                                {day.count} {day.count === 1 ? 'review' : 'reviews'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* X-axis labels */}
                    <div className="flex justify-between mt-2 text-[10px] text-slate-500">
                        <span>{fullReviewsOverTime[0]?.date ? formatChartDate(fullReviewsOverTime[0].date) : ''}</span>
                        <span>{fullReviewsOverTime[Math.floor(fullReviewsOverTime.length / 2)]?.date ? formatChartDate(fullReviewsOverTime[Math.floor(fullReviewsOverTime.length / 2)].date) : ''}</span>
                        <span>{fullReviewsOverTime[fullReviewsOverTime.length - 1]?.date ? formatChartDate(fullReviewsOverTime[fullReviewsOverTime.length - 1].date) : ''}</span>
                    </div>
                </div>
            </div>

            {/* REPORT STATS */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-sm font-bold text-white">Report Status</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                            Reports on your gym listing
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Open Reports */}
                    <div className={`p-5 rounded-xl border ${
                        reportStats.open > 0 
                            ? 'bg-amber-500/5 border-amber-500/20' 
                            : 'bg-slate-800/30 border-slate-800'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🚩</span>
                                <span className="text-xs font-semibold text-slate-300">Open Reports</span>
                            </div>
                            {reportStats.open > 0 && (
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                            )}
                        </div>
                        <div className={`text-3xl font-black mt-2 ${
                            reportStats.open > 0 ? 'text-amber-400' : 'text-slate-400'
                        }`}>
                            {formatNumber(reportStats.open)}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                            {reportStats.open > 0 
                                ? 'Reports that need your attention' 
                                : 'No open reports'}
                        </p>
                    </div>

                    {/* Resolved Reports */}
                    <div className="p-5 rounded-xl border bg-emerald-500/5 border-emerald-500/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">✅</span>
                                <span className="text-xs font-semibold text-slate-300">Resolved Reports</span>
                            </div>
                        </div>
                        <div className="text-3xl font-black text-emerald-400 mt-2">
                            {formatNumber(reportStats.resolved)}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                            Reports you've addressed
                        </p>
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        💡
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-bold text-white">Improve Your Analytics</h3>
                        <p className="text-xs text-slate-400 mt-1">
                            Here are some tips to boost your gym's performance:
                        </p>
                        <ul className="mt-3 space-y-2 text-xs text-slate-400">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400 mt-0.5">•</span>
                                <span>
                                    <strong className="text-white">Respond to reviews:</strong> Engage with reviewers to build trust and improve ratings.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400 mt-0.5">•</span>
                                <span>
                                    <strong className="text-white">Add more photos:</strong> Gyms with 5+ photos get 3x more engagement.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400 mt-0.5">•</span>
                                <span>
                                    <strong className="text-white">Keep info updated:</strong> Accurate operating hours and contact info reduce reports.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400 mt-0.5">•</span>
                                <span>
                                    <strong className="text-white">Add membership plans:</strong> Gyms with clear pricing attract more visitors.
                                </span>
                            </li>
                        </ul>
                        <div className="flex flex-wrap gap-2 mt-4">
                            <Link
                                href={route('owner.gym.reviews.index')}
                                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg px-3 py-1.5"
                            >
                                Manage Reviews →
                            </Link>
                            <Link
                                href={route('owner.gym.photos.index')}
                                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg px-3 py-1.5"
                            >
                                Add Photos →
                            </Link>
                            <Link
                                href={route('owner.gym.reports.index')}
                                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg px-3 py-1.5"
                            >
                                View Reports →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Persistent Inertia Layout Assignment
Index.layout = (page) => <OwnerLayout>{page}</OwnerLayout>;