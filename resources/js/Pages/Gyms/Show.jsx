import React, { useState, useEffect } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function Show({ gym, formattedHours = [], openStatus = null }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedImage, setSelectedImage] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);

    // Auto-hide notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Format rating
    const formatRating = (rating) => {
        if (rating === null || rating === undefined) return 'N/A';
        if (typeof rating === 'number') return rating.toFixed(1);
        const parsed = parseFloat(rating);
        return isNaN(parsed) ? 'N/A' : parsed.toFixed(1);
    };

    // Render stars
    const renderStars = (rating, size = 'sm') => {
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

        const sizeClass = size === 'lg' ? 'text-2xl' : 'text-sm';

        return (
            <div className="flex items-center gap-0.5">
                {stars.map((star, index) => (
                    <span key={index} className={sizeClass}>
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

    // Check if user has already reviewed
    const hasReviewed = gym.reviews?.some(review => review.user_id === window._auth?.user?.id);

    // Handle review submission
    const handleSubmitReview = (e) => {
        e.preventDefault();
        
        if (rating === 0) {
            setNotification({
                type: 'error',
                message: 'Please select a rating before submitting.'
            });
            return;
        }

        setIsSubmitting(true);

        router.post(`/gyms/${gym.id}/reviews`, {
            rating: rating,
            comment: comment
        }, {
            onSuccess: () => {
                setIsSubmitting(false);
                setShowReviewModal(false);
                setRating(0);
                setComment('');
                setNotification({
                    type: 'success',
                    message: 'Your review has been posted successfully!'
                });
                router.reload();
            },
            onError: (errors) => {
                setIsSubmitting(false);
                setNotification({
                    type: 'error',
                    message: errors.message || 'Failed to submit review. Please try again.'
                });
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const closeNotification = () => {
        setNotification(null);
    };

    const hasReviews = gym.reviews && gym.reviews.length > 0;

    const getReportUrl = () => {
    try {
        return route('gyms.report.create', gym.id);
    } catch (e) {
        return `/gyms/${gym.id}/report`;
    }
};  

    return (
        <MainLayout>
            <Head title={gym.name} />
            
            <div className="max-w-7xl mx-auto px-4 py-8">
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

                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors mb-6 group"
                >
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Search
                </Link>

                {/* Image Gallery */}
                <div className="glass-card rounded-2xl overflow-hidden backdrop-blur-xl bg-white/5 border-white/10 mb-8">
                    <div className="relative group">
                        {mainImage ? (
                            <>
                                <img
                                    src={mainImage}
                                    alt={gym.name}
                                    className="w-full h-[500px] object-cover cursor-pointer transition-transform duration-700 hover:scale-105"
                                    onClick={() => setShowLightbox(true)}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                                        <button
                                            onClick={() => setShowLightbox(true)}
                                            className="bg-white/10 backdrop-blur-md text-white px-6 py-2.5 rounded-xl font-semibold text-sm border border-white/20 hover:bg-white/20 transition"
                                        >
                                            🔍 View Full Gallery
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-[500px] bg-slate-800 flex items-center justify-center text-8xl text-slate-600">
                                🏋️‍♂️
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {thumbnails.length > 1 && (
                        <div className="p-4 flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent">
                            {thumbnails.map((thumb, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`flex-shrink-0 w-28 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                                        selectedImage === index
                                            ? 'border-amber-500 shadow-lg shadow-amber-500/20 scale-105'
                                            : 'border-transparent hover:border-white/30 hover:scale-105'
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
                        className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-lg flex items-center justify-center p-4"
                        onClick={() => setShowLightbox(false)}
                    >
                        <button
                            onClick={() => setShowLightbox(false)}
                            className="absolute top-4 right-4 text-white/60 hover:text-white text-3xl transition hover:rotate-90 duration-300"
                        >
                            ✕
                        </button>
                        <img
                            src={mainImage}
                            alt={gym.name}
                            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
                        />
                        {thumbnails.length > 1 && (
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 backdrop-blur-md p-3 rounded-2xl">
                                {thumbnails.map((thumb, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImage(index);
                                        }}
                                        className={`w-16 h-10 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                                            selectedImage === index
                                                ? 'border-amber-500 shadow-lg shadow-amber-500/20 scale-110'
                                                : 'border-white/30 hover:border-white/60 hover:scale-105'
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
                                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                                        {gym.name}
                                    </h1>
                                    <p className="text-sm text-slate-400 mt-2 flex items-center gap-1.5 flex-wrap">
                                        <span>📍</span>
                                        <span>{gym.address}</span>
                                        {gym.city && <span>• {gym.city.name}</span>}
                                        {gym.district && <span>, {gym.district.name}</span>}
                                        {gym.state && <span>, {gym.state.name}</span>}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1 bg-slate-800/30 p-3 rounded-xl border border-slate-700/30">
                                    <div className="flex items-center gap-2">
                                        {renderStars(gym.average_rating, 'lg')}
                                        <span className="text-2xl font-black text-white">
                                            {formatRating(gym.average_rating)}
                                        </span>
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        {gym.total_reviews || 0} reviews
                                    </span>
                                </div>
                            </div>

                            {/* Status & Quick Info - Using openStatus from controller */}
                            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/10">
                                {openStatus && openStatus.is_open ? (
                                    <span className="inline-flex items-center gap-2 text-emerald-400 font-semibold text-sm bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                        {openStatus.label}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2 text-slate-400 font-semibold text-sm bg-slate-800/30 px-3 py-1.5 rounded-full border border-slate-700/30">
                                        <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                                        {openStatus?.label || 'Closed'}
                                    </span>
                                )}
                                {gym.categories && gym.categories.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {gym.categories.map((cat) => (
                                            <span
                                                key={cat.id}
                                                className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full"
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
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">📝</span>
                                    <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
                                        About this gym
                                    </h2>
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                                    {gym.description}
                                </p>
                            </div>
                        )}

                        {/* Facilities */}
                        {gym.facilities && gym.facilities.length > 0 && (
                            <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">🏋️</span>
                                    <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
                                        Facilities
                                    </h2>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {gym.facilities.map((facility) => (
                                        <span
                                            key={facility.id}
                                            className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 px-4 py-2 rounded-xl text-sm text-slate-300 hover:border-amber-500/30 transition-all duration-300"
                                        >
                                            <span className="text-lg">{facility.icon || '✓'}</span>
                                            {facility.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Operating Hours - Using formattedHours from controller */}
                        {formattedHours && formattedHours.length > 0 && (
                            <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">🕐</span>
                                    <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
                                        Operating Hours
                                    </h2>
                                </div>
                                
                                {/* Current Day Highlight */}
                                {formattedHours.find(h => h.is_today) && (
                                    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-slate-400">Today</p>
                                                <p className="text-sm font-bold text-white">
                                                    {formattedHours.find(h => h.is_today)?.day_name}
                                                </p>
                                            </div>
                                            {formattedHours.find(h => h.is_today)?.is_closed ? (
                                                <span className="text-rose-400 font-bold text-sm">Closed</span>
                                            ) : (
                                                <div className="text-right">
                                                    <span className="text-emerald-400 font-bold text-sm">
                                                        {formattedHours.find(h => h.is_today)?.open_time} — {formattedHours.find(h => h.is_today)?.close_time}
                                                    </span>
                                                    <p className="text-[10px] text-emerald-400">● Open now</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="space-y-1.5">
                                    {formattedHours.map((hour, index) => {
                                        if (hour.is_today) return null; // Skip today as it's shown above
                                        
                                        return (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center py-2 px-3 rounded-lg transition-all text-slate-400 hover:bg-white/5"
                                            >
                                                <span className="text-sm font-medium">{hour.day_name}</span>
                                                {hour.is_closed ? (
                                                    <span className="text-sm text-rose-400 font-semibold">Closed</span>
                                                ) : (
                                                    <span className="text-sm font-medium">
                                                        {hour.open_time} — {hour.close_time}
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
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">💳</span>
                                    <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
                                        Membership Plans
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {gym.membership_plans.map((plan, index) => {
                                        const colors = ['from-amber-500/20 to-amber-600/20', 'from-emerald-500/20 to-emerald-600/20', 'from-purple-500/20 to-purple-600/20'];
                                        return (
                                            <div
                                                key={plan.id}
                                                className={`bg-gradient-to-br ${colors[index % colors.length]} border border-white/10 rounded-xl p-5 text-center hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10`}
                                            >
                                                <h3 className="font-bold text-white text-sm">{plan.name}</h3>
                                                <div className="text-3xl font-black text-amber-400 mt-2">
                                                    RM {plan.price}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1 capitalize">
                                                    {plan.billing_cycle === 'monthly' && 'per month'}
                                                    {plan.billing_cycle === 'yearly' && 'per year'}
                                                    {plan.billing_cycle === 'one_time' && 'one-time'}
                                                </div>
                                                {plan.description && (
                                                    <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                                                        {plan.description}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Card */}
                        <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10 sticky top-24">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xl">📞</span>
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
                                    Contact
                                </h2>
                            </div>
                            <div className="space-y-3 text-sm">
                                {gym.phone_number && (
                                    <div className="flex items-center gap-3 text-slate-300 p-2 rounded-lg hover:bg-white/5 transition">
                                        <span className="text-slate-500 text-lg">📞</span>
                                        <span>{gym.phone_number}</span>
                                    </div>
                                )}
                                {gym.whatsapp_number && (
                                    <div className="flex items-center gap-3 text-slate-300 p-2 rounded-lg hover:bg-white/5 transition">
                                        <span className="text-slate-500 text-lg">💬</span>
                                        <span>{gym.whatsapp_number}</span>
                                    </div>
                                )}
                                {gym.email && (
                                    <div className="flex items-center gap-3 text-slate-300 p-2 rounded-lg hover:bg-white/5 transition">
                                        <span className="text-slate-500 text-lg">✉️</span>
                                        <span>{gym.email}</span>
                                    </div>
                                )}
                                {gym.website && (
                                    <div className="flex items-center gap-3 text-slate-300 p-2 rounded-lg hover:bg-white/5 transition">
                                        <span className="text-slate-500 text-lg">🌐</span>
                                        <a
                                            href={gym.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-amber-400 hover:text-amber-300 transition font-medium"
                                        >
                                            Visit Website →
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
                                        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105"
                                    >
                                        💬 WhatsApp
                                    </a>
                                )}
                                {gym.google_maps_url && (
                                    <a
                                        href={gym.google_maps_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-105"
                                    >
                                        🗺️ Get Directions
                                    </a>
                                )}
                                {!hasReviewed && (
                                    <button
                                        onClick={() => setShowReviewModal(true)}
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-105"
                                    >
                                        ⭐ Write a Review
                                    </button>
                                )}
                                {hasReviewed && (
                                    <div className="w-full text-center text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-xl">
                                        ✅ You've already reviewed this gym
                                    </div>
                                )}
                            </div>

                              {/* Report Link - Updated to navigate to report page */}
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <Link
                                    href={getReportUrl()}
                                    className="text-xs text-amber-400/80 hover:text-amber-400 transition flex items-center gap-1.5 group w-full"
                                >
                                    <span className="group-hover:scale-110 transition-transform">⚠️</span>
                                    Report an issue
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </Link>
                            </div>
                        </div>

                        {/* Reviews Summary */}
                        {hasReviews && (
                            <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">⭐</span>
                                        <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
                                            Recent Reviews
                                        </h2>
                                    </div>
                                    <span className="text-xs text-slate-500">{gym.reviews.length} total</span>
                                </div>
                                <div className="space-y-3">
                                    {gym.reviews.slice(0, 3).map((review) => (
                                        <div key={review.id} className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/30 hover:border-slate-600/50 transition">
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
                                                <div className="mt-2 pl-3 border-l-2 border-amber-500/30 bg-amber-500/5 rounded-r-lg p-2">
                                                    <p className="text-[10px] text-amber-400 font-medium">💬 Owner Reply:</p>
                                                    <p className="text-xs text-slate-400">{review.reply.reply}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* All Reviews Section */}
                {hasReviews && (
                    <div className="mt-8 glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">⭐</span>
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
                                    All Reviews ({gym.reviews.length})
                                </h2>
                            </div>
                            {!hasReviewed && (
                                <button 
                                    onClick={() => setShowReviewModal(true)}
                                    className="text-xs bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold px-4 py-2 rounded-xl transition-all duration-300 border border-amber-500/20 hover:border-amber-500"
                                >
                                    ✏️ Write a Review
                                </button>
                            )}
                        </div>
                        <div className="space-y-4">
                            {gym.reviews.map((review) => (
                                <div key={review.id} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                            <span className="font-semibold text-white text-sm">
                                                {review.user?.name || 'Anonymous'}
                                            </span>
                                            <div className="flex items-center gap-1 mt-1">
                                                {renderStars(review.rating)}
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded-full">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                                        {review.comment || 'No comment provided.'}
                                    </p>
                                    {review.reply && (
                                        <div className="mt-3 pl-4 border-l-2 border-amber-500/30 bg-amber-500/5 rounded-r-xl p-3">
                                            <p className="text-xs text-amber-400 font-medium flex items-center gap-1">
                                                <span>💬</span> Owner Response:
                                            </p>
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
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">🗺️</span>
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
                                Location
                            </h2>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700/30 hover:border-amber-500/20 transition-all duration-300">
                            <a
                                href={gym.google_maps_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition text-sm font-semibold"
                            >
                                <span className="text-xl">📍</span>
                                View on Google Maps →
                            </a>
                            <p className="text-xs text-slate-500 mt-2">{gym.address}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                        onClick={() => setShowReviewModal(false)}
                    ></div>
                    
                    {/* Modal */}
                    <div className="relative max-w-md w-full bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="text-2xl">✏️</span>
                                Write a Review
                            </h3>
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="text-slate-400 hover:text-white transition-colors hover:rotate-90 duration-300"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Gym Name */}
                        <div className="mb-4 p-3 bg-slate-800/30 rounded-xl border border-slate-700/50">
                            <p className="text-xs text-slate-400">Reviewing:</p>
                            <p className="text-sm font-semibold text-white flex items-center gap-2">
                                <span>🏋️</span> {gym.name}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            {/* Rating */}
                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Rating <span className="text-red-400">*</span>
                                </label>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="text-3xl transition-all duration-200 hover:scale-125 focus:outline-none"
                                        >
                                            <span className={star <= (hoverRating || rating) ? 'text-amber-400' : 'text-slate-600'}>
                                                ★
                                            </span>
                                        </button>
                                    ))}
                                    <span className="ml-3 text-sm font-semibold text-slate-400">
                                        {rating > 0 ? `${rating} / 5` : 'Select rating'}
                                    </span>
                                </div>
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Comment
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows="4"
                                    className="w-full px-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                                    placeholder="Share your experience at this gym..."
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowReviewModal(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || rating === 0}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Submitting...
                                        </span>
                                    ) : (
                                        'Submit Review'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}