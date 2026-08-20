import React, { useState } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function Report({ gym, reasons = [] }) {
    const [formData, setFormData] = useState({
        reason: '',
        description: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState(null);

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        // Validate reason
        if (!formData.reason) {
            setErrors({ reason: 'Please select a reason for your report.' });
            setIsSubmitting(false);
            return;
        }

        router.post(`/gyms/${gym.id}/report/store`, formData, {
            onSuccess: () => {
                setIsSubmitting(false);
                setNotification({
                    type: 'success',
                    message: 'Thanks — your report has been submitted for review.'
                });
                // Redirect back to gym page after success
                setTimeout(() => {
                    router.get(`/gyms/${gym.slug || gym.id}`);
                }, 2000);
            },
            onError: (errors) => {
                setIsSubmitting(false);
                setErrors(errors);
                setNotification({
                    type: 'error',
                    message: 'Failed to submit report. Please try again.'
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

    return (
        <MainLayout>
            <Head title={`Report: ${gym.name}`} />
            
            <div className="max-w-3xl mx-auto px-4 py-12">
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
                    href={`/gyms/${gym.slug || gym.id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white transition-colors mb-6 group"
                >
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Gym
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
                        🚨 Report Issue
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                        Report <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">{gym.name}</span>
                    </h1>
                    <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                        Help us keep GymFinder accurate by reporting any issues with this gym listing.
                        Your report will be reviewed by our team.
                    </p>
                </div>

                {/* Gym Info Card */}
                <div className="glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                            🏋️
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{gym.name}</h2>
                            <p className="text-sm text-slate-400 mt-0.5">{gym.address}</p>
                        </div>
                    </div>
                </div>

                {/* Report Form */}
                <div className="glass-card rounded-2xl p-6 sm:p-8 backdrop-blur-xl bg-white/5 border-white/10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Reason Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Reason for Report <span className="text-red-400">*</span>
                            </label>
                            <div className="space-y-2">
                                {reasons.map((reason) => (
                                    <label
                                        key={reason.value}
                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                            formData.reason === reason.value
                                                ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                                : 'border-slate-700/50 text-slate-400 hover:border-slate-600 hover:bg-white/5'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="reason"
                                            value={reason.value}
                                            checked={formData.reason === reason.value}
                                            onChange={handleInputChange}
                                            className="w-4 h-4 text-amber-500 focus:ring-amber-500/20"
                                        />
                                        <span className="text-sm font-medium">{reason.label}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.reason && (
                                <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                                    <span>⚠️</span> {errors.reason}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Description <span className="text-xs text-slate-400">(optional)</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="4"
                                className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                                placeholder="Please provide any additional details about the issue..."
                            />
                            <div className="flex justify-between mt-1">
                                <p className="text-xs text-slate-500">
                                    {formData.description.length}/1000 characters
                                </p>
                                {errors.description && (
                                    <p className="text-xs text-red-400">{errors.description}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Submitting...
                                    </span>
                                ) : (
                                    'Submit Report'
                                )}
                            </button>
                            <Link
                                href={`/gyms/${gym.slug || gym.id}`}
                                className="flex-1 text-center text-sm font-semibold text-white/60 hover:text-white px-6 py-3 rounded-xl transition-all hover:bg-white/5"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Info Box */}
                <div className="mt-8 glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                    <div className="flex items-start gap-4">
                        <div className="text-2xl">ℹ️</div>
                        <div>
                            <h3 className="text-sm font-bold text-white">What happens next?</h3>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                Your report will be reviewed by our admin team. If the issue is confirmed, 
                                we'll take appropriate action to update or correct the gym listing. 
                                You'll receive a notification once your report has been reviewed.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                                <span>📋 Report submitted</span>
                                <span>🔍 Admin review</span>
                                <span>✅ Resolution</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Badge */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                        <span className="text-emerald-400">✓</span>
                        Your report is anonymous and helps improve the community
                        <span className="text-emerald-400">✓</span>
                    </p>
                </div>
            </div>
        </MainLayout>
    );
}