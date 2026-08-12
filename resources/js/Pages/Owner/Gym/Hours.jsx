import React, { useState, useEffect } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import OwnerLayout from '@/Layouts/OwnerLayout';

export default function Hours({ hours = [] }) {
    const [formData, setFormData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState(null);

    // Initialize form data with hours
    useEffect(() => {
        if (hours.length > 0) {
            setFormData(hours);
        }
    }, [hours]);

    // Auto-hide notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleToggleClosed = (index) => {
        setFormData(prev => prev.map((day, i) => 
            i === index 
                ? { 
                    ...day, 
                    is_closed: !day.is_closed,
                    open_time: !day.is_closed ? day.open_time : null,
                    close_time: !day.is_closed ? day.close_time : null
                }
                : day
        ));
    };

    const handleTimeChange = (index, field, value) => {
        setFormData(prev => prev.map((day, i) => 
            i === index ? { ...day, [field]: value } : day
        ));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        // Validate that open_time is before close_time for non-closed days
        const validationErrors = {};
        formData.forEach((day, index) => {
            if (!day.is_closed) {
                if (!day.open_time) {
                    validationErrors[`hours.${index}.open_time`] = 'Opening time is required';
                }
                if (!day.close_time) {
                    validationErrors[`hours.${index}.close_time`] = 'Closing time is required';
                }
                if (day.open_time && day.close_time && day.open_time >= day.close_time) {
                    validationErrors[`hours.${index}.close_time`] = 'Closing time must be after opening time';
                }
            }
        });

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setIsSubmitting(false);
            setNotification({
                type: 'error',
                message: 'Please fix the errors before submitting.'
            });
            return;
        }

        // Prepare the data for submission - ensure times are properly formatted
        const submitData = formData.map(day => ({
            ...day,
            // Ensure open_time and close_time are either null or valid time strings
            open_time: day.is_closed ? null : (day.open_time || null),
            close_time: day.is_closed ? null : (day.close_time || null)
        }));

        router.put('/owner/gym/hours', { hours: submitData }, {
            onSuccess: () => {
                setIsSubmitting(false);
                setNotification({
                    type: 'success',
                    message: 'Operating hours updated successfully!'
                });
            },
            onError: (errors) => {
                setIsSubmitting(false);
                setErrors(errors);
                setNotification({
                    type: 'error',
                    message: 'Failed to update operating hours. Please check the time format and try again.'
                });
                console.log('Validation errors:', errors);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const closeNotification = () => {
        setNotification(null);
    };

    // Get day abbreviation
    const getDayAbbr = (dayName) => {
        const abbr = {
            'Sunday': 'Sun',
            'Monday': 'Mon',
            'Tuesday': 'Tue',
            'Wednesday': 'Wed',
            'Thursday': 'Thu',
            'Friday': 'Fri',
            'Saturday': 'Sat'
        };
        return abbr[dayName] || dayName?.slice(0, 3) || '';
    };

    // Check if any day has errors
    const hasErrors = Object.keys(errors).length > 0;

    return (
        <>
            <Head title="Operating Hours" />
            
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
                        🕒 Operating Hours
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                        Set Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Hours</span>
                    </h1>
                    <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                        Set your gym's operating hours for each day of the week. Toggle days you're closed.
                    </p>
                </div>

                {/* Form */}
                <div className="glass-card rounded-2xl p-6 sm:p-8 backdrop-blur-xl bg-white/5 border-white/10">
                    <form onSubmit={handleSubmit}>
                        {/* Days Grid */}
                        <div className="space-y-3">
                            {formData.map((day, index) => {
                                const openTimeError = errors[`hours.${index}.open_time`];
                                const closeTimeError = errors[`hours.${index}.close_time`];
                                
                                return (
                                    <div 
                                        key={day.day_of_week} 
                                        className={`grid grid-cols-1 lg:grid-cols-12 gap-3 items-center p-4 rounded-xl transition-all ${
                                            day.is_closed 
                                                ? 'bg-slate-800/30 border border-slate-700/50' 
                                                : 'bg-slate-800/50 border border-slate-700/30'
                                        } ${(openTimeError || closeTimeError) ? 'border-red-500/50 ring-1 ring-red-500/20' : ''}`}
                                    >
                                        {/* Day Name */}
                                        <div className="lg:col-span-2 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/20 flex items-center justify-center text-sm font-bold">
                                                {getDayAbbr(day.day_name)}
                                            </div>
                                            <span className="text-sm font-semibold text-white hidden sm:inline">
                                                {day.day_name}
                                            </span>
                                        </div>

                                        {/* Closed Toggle */}
                                        <div className="lg:col-span-3 flex items-center gap-3">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={day.is_closed}
                                                    onChange={() => handleToggleClosed(index)}
                                                    className="sr-only peer"
                                                />
                                                <div className={`w-12 h-7 rounded-full transition-colors ${
                                                    day.is_closed 
                                                        ? 'bg-slate-600' 
                                                        : 'bg-emerald-500'
                                                } peer-focus:ring-2 peer-focus:ring-emerald-500/30`}>
                                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 mt-1 ${
                                                        day.is_closed 
                                                            ? 'translate-x-1' 
                                                            : 'translate-x-6'
                                                    }`}></div>
                                                </div>
                                            </label>
                                            <span className={`text-sm font-semibold ${
                                                day.is_closed ? 'text-slate-400' : 'text-emerald-400'
                                            }`}>
                                                {day.is_closed ? 'Closed' : 'Open'}
                                            </span>
                                        </div>

                                        {/* Time Inputs */}
                                        {!day.is_closed && (
                                            <div className="lg:col-span-7 flex flex-wrap items-center gap-3">
                                                <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/50 px-3 py-2 rounded-lg hover:border-amber-500/30 transition-colors">
                                                    <span className="text-xs text-slate-400 font-medium">Open</span>
                                                    <input
                                                        type="time"
                                                        value={day.open_time || ''}
                                                        onChange={(e) => handleTimeChange(index, 'open_time', e.target.value)}
                                                        className="bg-transparent border-none text-white text-sm focus:outline-none focus:ring-0 w-28 [color-scheme:dark]"
                                                        style={{ colorScheme: 'dark' }}
                                                    />
                                                </div>
                                                <span className="text-xs text-slate-500 font-medium">→</span>
                                                <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/50 px-3 py-2 rounded-lg hover:border-amber-500/30 transition-colors">
                                                    <span className="text-xs text-slate-400 font-medium">Close</span>
                                                    <input
                                                        type="time"
                                                        value={day.close_time || ''}
                                                        onChange={(e) => handleTimeChange(index, 'close_time', e.target.value)}
                                                        className="bg-transparent border-none text-white text-sm focus:outline-none focus:ring-0 w-28 [color-scheme:dark]"
                                                        style={{ colorScheme: 'dark' }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Error Messages */}
                                        {(openTimeError || closeTimeError) && (
                                            <div className="lg:col-span-12 mt-1">
                                                {openTimeError && (
                                                    <p className="text-xs text-red-400 flex items-center gap-1">
                                                        <span>⚠️</span> {openTimeError}
                                                    </p>
                                                )}
                                                {closeTimeError && (
                                                    <p className="text-xs text-red-400 flex items-center gap-1">
                                                        <span>⚠️</span> {closeTimeError}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Error Summary */}
                        {hasErrors && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <p className="text-xs text-red-400 flex items-center gap-2">
                                    <span>⚠️</span>
                                    Please fix the errors above before submitting.
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-6 border-t border-white/10">
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
                                        Saving Changes...
                                    </span>
                                ) : (
                                    'Save Hours'
                                )}
                            </button>
                            <Link
                                href="/owner/dashboard"
                                className="flex-1 text-center text-sm font-semibold text-white/60 hover:text-white px-6 py-3 rounded-xl transition-all hover:bg-white/5"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Tips Box */}
                <div className="mt-8 glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                    <div className="flex items-start gap-4">
                        <div className="text-2xl">💡</div>
                        <div>
                            <h3 className="text-sm font-bold text-white">Tips for operating hours</h3>
                            <ul className="mt-2 space-y-1 text-xs text-slate-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span>Keep your hours accurate to avoid disappointing potential members</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span>Consider extending hours during peak fitness seasons</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span>Update hours for public holidays to keep members informed</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span>Clear opening hours help attract more walk-in customers</span>
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
Hours.layout = (page) => <OwnerLayout>{page}</OwnerLayout>;