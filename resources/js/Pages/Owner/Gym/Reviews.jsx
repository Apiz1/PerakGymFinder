import React, { useState, useEffect } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import OwnerLayout from '@/Layouts/OwnerLayout';

export default function Reviews({ gym, reviews = [] }) {
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingReply, setEditingReply] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [errors, setErrors] = useState({});

    // Auto-hide notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const openReplyForm = (reviewId, existingReply = null) => {
        if (existingReply) {
            setEditingReply(existingReply);
            setReplyText(existingReply.reply);
        } else {
            setReplyingTo(reviewId);
            setReplyText('');
            setEditingReply(null);
        }
        setShowReplyForm(true);
        setErrors({});
    };

    const closeReplyForm = () => {
        setShowReplyForm(false);
        setReplyingTo(null);
        setEditingReply(null);
        setReplyText('');
        setErrors({});
    };

    const handleSubmitReply = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const reviewId = editingReply ? editingReply.review_id : replyingTo;
        const url = editingReply 
            ? `/owner/gym/reviews/${reviewId}/reply`
            : `/owner/gym/reviews/${reviewId}/reply`;
        const method = editingReply ? 'put' : 'post';

        router[method](url, { reply: replyText }, {
            onSuccess: () => {
                setIsSubmitting(false);
                closeReplyForm();
                setNotification({
                    type: 'success',
                    message: editingReply 
                        ? 'Reply updated successfully!'
                        : 'Reply posted successfully!'
                });
            },
            onError: (errors) => {
                setIsSubmitting(false);
                setErrors(errors);
                setNotification({
                    type: 'error',
                    message: 'Failed to save reply. Please try again.'
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

    const hasReviews = reviews && reviews.length > 0;

    return (
        <>
            <Head title="Reviews" />
            
            <div className="max-w-4xl mx-auto">
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

                {/* Header */}
                <div className="text-center mb-8">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
                        ⭐ Reviews
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                        Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Reviews</span>
                    </h1>
                    <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                        View and respond to reviews from your gym members. Engaging with reviews helps build trust.
                    </p>
                </div>

                {/* Stats Bar */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">⭐</span>
                            <div>
                                <span className="text-xs text-slate-400">Total Reviews</span>
                                <p className="text-sm font-bold text-white">{reviews.length}</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-800"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">💬</span>
                            <div>
                                <span className="text-xs text-slate-400">Replied</span>
                                <p className="text-sm font-bold text-emerald-400">
                                    {reviews.filter(r => r.reply).length}
                                </p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-800"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">⏳</span>
                            <div>
                                <span className="text-xs text-slate-400">Pending Reply</span>
                                <p className="text-sm font-bold text-amber-400">
                                    {reviews.filter(r => !r.reply).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                {hasReviews ? (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div key={review.id} className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                                {/* Review Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-amber-500/20">
                                                {review.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white text-sm">
                                                    {review.user?.name || 'Anonymous User'}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {formatDate(review.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {renderStars(review.rating)}
                                        <span className="text-xs font-bold text-amber-400 ml-1">
                                            {review.rating.toFixed(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Review Content */}
                                <div className="ml-13">
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        {review.comment || 'No comment provided.'}
                                    </p>
                                </div>

                                {/* Reply Section */}
                                {review.reply ? (
                                    <div className="mt-4 ml-13 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-emerald-400 font-semibold">💬 Your Reply</span>
                                                <span className="text-[10px] text-slate-500">
                                                    {formatDate(review.reply.created_at)}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => openReplyForm(review.id, review.reply)}
                                                className="text-xs text-amber-400 hover:text-amber-300 transition"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                        <p className="text-sm text-slate-300 mt-1">
                                            {review.reply.reply}
                                        </p>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => openReplyForm(review.id)}
                                        className="mt-4 ml-13 inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
                                    >
                                        <span>💬</span> Reply to Review
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl p-12 text-center backdrop-blur-xl bg-white/5 border-white/10">
                        <div className="text-6xl mb-4">💬</div>
                        <h3 className="text-xl font-bold text-white mb-2">No Reviews Yet</h3>
                        <p className="text-sm text-slate-400 max-w-md mx-auto">
                            Reviews from members will appear here once they start rating your gym.
                        </p>
                    </div>
                )}

                {/* Reply Modal */}
                {showReplyForm && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={closeReplyForm}
                        ></div>
                        
                        {/* Modal */}
                        <div className="relative max-w-lg w-full bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">
                                    {editingReply ? 'Edit Reply' : 'Reply to Review'}
                                </h3>
                                <button
                                    onClick={closeReplyForm}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmitReply} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        Your Reply <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        rows="4"
                                        className="w-full px-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        placeholder="Write your reply to this review..."
                                        required
                                    />
                                    {errors.reply && (
                                        <p className="text-xs text-red-400 mt-1">{errors.reply}</p>
                                    )}
                                    <p className="text-xs text-slate-500 mt-2">
                                        {replyText.length}/2000 characters
                                    </p>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={closeReplyForm}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !replyText.trim()}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Saving...
                                            </span>
                                        ) : (
                                            editingReply ? 'Update Reply' : 'Post Reply'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Tips Box */}
                <div className="mt-8 glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                    <div className="flex items-start gap-4">
                        <div className="text-2xl">💡</div>
                        <div>
                            <h3 className="text-sm font-bold text-white">Tips for managing reviews</h3>
                            <ul className="mt-2 space-y-1 text-xs text-slate-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span>Always respond to reviews professionally and promptly</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span>Thank users for positive reviews to build loyalty</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span>Address negative reviews constructively and offer solutions</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span>Engaging with reviews helps attract more customers</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Persistent Layout Setup
Reviews.layout = (page) => <OwnerLayout>{page}</OwnerLayout>;