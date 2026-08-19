import React, { useState, useEffect } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function Show({ gym }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedImage, setSelectedImage] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);

    // Get today's day of week (0 = Sunday, 1 = Monday, etc.)
    const today = new Date().getDay();
    const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today];

    // Check if gym is open now
    const isOpenNow = () => {
        if (!gym.operating_hours) return false;
        const todayHours = gym.operating_hours.find(h => h.day_of_week === today);
        if (!todayHours || todayHours.is_closed) return false;
        
        // For demo purposes, assume it's open if we have hours
        return true;
    };

    const openNow = isOpenNow();

    // Get today's hours
    const getTodayHours = () => {
        if (!gym.operating_hours) return null;
        return gym.operating_hours.find(h => h.day_of_week === today);
    };

    const todayHours = getTodayHours();

    // Get day name from day number
    const getDayName = (dayNumber) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayNumber] || dayNumber;
    };

    // Format rating
    const formatRating = (rating) => {
        if (rating === null || rating === undefined) return 'N/A';
        if (typeof rating === 'number') return rating.toFixed(1);
        const parsed = parseFloat(rating);
        return isNaN(parsed) ? 'N/A' : parsed.toFixed(1);
    };

    // Render stars
    const renderStars = (rating) => {
        const numRating = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
        const fullStars = Math.floor(numRating);
        const hasHalfStar = numRating % 1 >= 0.5;
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

   const getMainImage = () => {
    if (gym.images && gym.images.length > 0) {
        return gym.images[selectedImage]?.url;
    }
    return null;
};

const getThumbnails = () => {
    if (gym.images && gym.images.length > 0) {
        return gym.images.map(img => img.url);
    }
    return [];
};
    const mainImage = getMainImage();
    const thumbnails = getThumbnails();

    return (
        <MainLayout>
            <Head title={gym.name} />
            
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors mb-6"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Search
                </Link>

                {/* Image Gallery */}
                <div className="glass-card rounded-2xl overflow-hidden backdrop-blur-xl bg-white/5 border-white/10 mb-8">
                    <div className="relative">
                        {mainImage ? (
                            <>
                                <img
                                    src={mainImage}
                                    alt={gym.name}
                                    className="w-full h-96 object-cover cursor-pointer"
                                    onClick={() => setShowLightbox(true)}
                                />
                                <button
                                    onClick={() => setShowLightbox(true)}
                                    className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-black/80 transition"
                                >
                                    🔍 View Full
                                </button>
                            </>
                        ) : (
                            <div className="w-full h-96 bg-slate-800 flex items-center justify-center text-6xl text-slate-600">
                                🏋️‍♂️
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {thumbnails.length > 1 && (
                        <div className="p-4 flex gap-2 overflow-x-auto">
                            {thumbnails.map((thumb, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition ${
                                        selectedImage === index
                                            ? 'border-amber-500'
                                            : 'border-transparent hover:border-white/30'
                                    }`}
                                >
                                    <img
                                        src={thumb}
                                        alt={`Gym ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Lightbox */}
                {showLightbox && mainImage && (
                    <div
                        className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowLightbox(false)}
                    >
                        <button
                            onClick={() => setShowLightbox(false)}
                            className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl transition"
                        >
                            ✕
                        </button>
                        <img
                            src={mainImage}
                            alt={gym.name}
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                        {thumbnails.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {thumbnails.map((thumb, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImage(index);
                                        }}
                                        className={`w-12 h-8 rounded-lg overflow-hidden border-2 transition ${
                                            selectedImage === index
                                                ? 'border-amber-500'
                                                : 'border-white/30 hover:border-white/60'
                                        }`}
                                    >
                                        <img
                                            src={thumb}
                                            alt={`Gym ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Gym Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title & Rating */}
                        <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-black text-white tracking-tight">
                                        {gym.name}
                                    </h1>
                                    <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                                        <span>📍</span>
                                        <span>{gym.address}</span>
                                        {gym.city && <span>• {gym.city.name}</span>}
                                        {gym.district && <span>, {gym.district.name}</span>}
                                        {gym.state && <span>, {gym.state.name}</span>}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="flex items-center gap-2">
                                        {renderStars(gym.average_rating)}
                                        <span className="text-lg font-bold text-white">
                                            {formatRating(gym.average_rating)}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-500">
                                        {gym.total_reviews || 0} reviews
                                    </span>
                                </div>
                            </div>

                            {/* Status & Quick Info */}
                            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/10">
                                {openNow ? (
                                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold text-sm">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                        Open Now
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 text-slate-400 font-semibold text-sm">
                                        <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                                        Closed
                                    </span>
                                )}
                                {todayHours && !todayHours.is_closed && (
                                    <span className="text-sm text-slate-300">
                                        Closes at {todayHours.closing_time}
                                    </span>
                                )}
                                {gym.categories && gym.categories.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {gym.categories.map((cat) => (
                                            <span
                                                key={cat.id}
                                                className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full"
                                            >
                                                {cat.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {gym.description && (
                            <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-3">
                                    About this gym
                                </h2>
                                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                                    {gym.description}
                                </p>
                            </div>
                        )}

                        {/* Facilities */}
                        {gym.facilities && gym.facilities.length > 0 && (
                            <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-3">
                                    Facilities
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {gym.facilities.map((facility) => (
                                        <span
                                            key={facility.id}
                                            className="inline-flex items-center gap-1.5 bg-slate-800/50 border border-slate-700/50 px-3 py-1.5 rounded-xl text-xs text-slate-300"
                                        >
                                            <span>{facility.icon || '✓'}</span>
                                            {facility.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Operating Hours */}
                        {gym.operating_hours && gym.operating_hours.length > 0 && (
                            <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-3">
                                    Operating Hours
                                </h2>
                                <div className="space-y-2">
                                    {gym.operating_hours.map((hour, index) => {
                                        const dayName = getDayName(hour.day_of_week);
                                        const isToday = dayName === todayName;
                                        return (
                                            <div
                                                key={index}
                                                className={`flex justify-between items-center py-1.5 ${
                                                    isToday ? 'text-white' : 'text-slate-400'
                                                } ${isToday ? 'font-semibold' : ''}`}
                                            >
                                                <span className="text-sm">
                                                    {dayName}
                                                    {isToday && (
                                                        <span className="ml-2 text-[10px] text-amber-400 font-bold uppercase">
                                                            Today
                                                        </span>
                                                    )}
                                                </span>
                                                {hour.is_closed ? (
                                                    <span className="text-sm text-rose-400">Closed</span>
                                                ) : (
                                                    <span className="text-sm">
                                                        {hour.opening_time} - {hour.closing_time}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Membership Plans */}
                        {gym.membership_plans && gym.membership_plans.length > 0 && (
                            <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-3">
                                    Membership Plans
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {gym.membership_plans.map((plan) => (
                                        <div
                                            key={plan.id}
                                            className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 text-center"
                                        >
                                            <h3 className="font-bold text-white text-sm">{plan.name}</h3>
                                            <div className="text-2xl font-black text-amber-400 mt-2">
                                                RM {plan.price}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                {plan.billing_cycle === 'monthly' && 'per month'}
                                                {plan.billing_cycle === 'yearly' && 'per year'}
                                                {plan.billing_cycle === 'one_time' && 'one-time'}
                                            </div>
                                            {plan.description && (
                                                <p className="text-xs text-slate-400 mt-2">{plan.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Card */}
                        <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10 sticky top-24">
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-4">
                                Contact
                            </h2>
                            <div className="space-y-3 text-sm">
                                {gym.phone_number && (
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <span className="text-slate-500">📞</span>
                                        <span>{gym.phone_number}</span>
                                    </div>
                                )}
                                {gym.whatsapp_number && (
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <span className="text-slate-500">💬</span>
                                        <span>{gym.whatsapp_number}</span>
                                    </div>
                                )}
                                {gym.email && (
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <span className="text-slate-500">✉️</span>
                                        <span>{gym.email}</span>
                                    </div>
                                )}
                                {gym.website && (
                                    <div className="flex items-center gap-3 text-slate-300">
                                        <span className="text-slate-500">🌐</span>
                                        <a
                                            href={gym.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-amber-400 hover:text-amber-300 transition"
                                        >
                                            Visit Website
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                                {gym.whatsapp_number && (
                                    <a
                                        href={`https://wa.me/${gym.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${gym.name}, I found your gym on GymFinder Perak!`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-emerald-500/20"
                                    >
                                        💬 WhatsApp
                                    </a>
                                )}
                                {gym.google_maps_url && (
                                    <a
                                        href={gym.google_maps_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-lg shadow-amber-500/20"
                                    >
                                        🗺️ Get Directions
                                    </a>
                                )}
                            </div>

                            {/* Report Link */}
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <button
                                    className="text-xs text-slate-500 hover:text-amber-400 transition"
                                    onClick={() => {
                                        if (confirm('Report an issue with this gym listing?')) {
                                            // Redirect to report page or show modal
                                            alert('Report functionality coming soon!');
                                        }
                                    }}
                                >
                                    ⚠️ Report an issue
                                </button>
                            </div>
                        </div>

                        {/* Reviews Summary */}
                        {gym.reviews && gym.reviews.length > 0 && (
                            <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-3">
                                    Reviews
                                </h2>
                                <div className="space-y-3">
                                    {gym.reviews.slice(0, 3).map((review) => (
                                        <div key={review.id} className="bg-slate-800/30 rounded-xl p-3">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-white text-sm">
                                                    {review.user?.name || 'Anonymous'}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    {renderStars(review.rating)}
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                                {review.comment || 'No comment provided.'}
                                            </p>
                                            {review.reply && (
                                                <div className="mt-2 pl-3 border-l-2 border-amber-500/30">
                                                    <p className="text-xs text-amber-400 font-medium">Reply from owner:</p>
                                                    <p className="text-xs text-slate-400">{review.reply.reply}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {gym.reviews.length > 3 && (
                                        <button
                                            className="text-xs text-amber-400 hover:text-amber-300 transition w-full text-center py-1"
                                            onClick={() => setActiveTab('reviews')}
                                        >
                                            View all {gym.reviews.length} reviews →
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Review Section (if reviews tab or all reviews) */}
                {gym.reviews && gym.reviews.length > 0 && (
                    <div className="mt-8 glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
                                All Reviews ({gym.reviews.length})
                            </h2>
                            <button className="text-xs bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold px-4 py-2 rounded-xl transition">
                                Write a Review
                            </button>
                        </div>
                        <div className="space-y-4">
                            {gym.reviews.map((review) => (
                                <div key={review.id} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="font-semibold text-white text-sm">
                                                {review.user?.name || 'Anonymous'}
                                            </span>
                                            <div className="flex items-center gap-1 mt-1">
                                                {renderStars(review.rating)}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-slate-500">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-300 mt-2">
                                        {review.comment || 'No comment provided.'}
                                    </p>
                                    {review.reply && (
                                        <div className="mt-3 pl-3 border-l-2 border-amber-500/30 bg-amber-500/5 rounded-r-xl p-3">
                                            <p className="text-xs text-amber-400 font-medium">Owner Response:</p>
                                            <p className="text-sm text-slate-300 mt-1">{review.reply.reply}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Map Section */}
                {gym.google_maps_url && (
                    <div className="mt-8 glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-3">
                            Location
                        </h2>
                        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                            <a
                                href={gym.google_maps_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-amber-400 hover:text-amber-300 transition text-sm"
                            >
                                📍 View on Google Maps
                            </a>
                            <p className="text-xs text-slate-500 mt-1">{gym.address}</p>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}