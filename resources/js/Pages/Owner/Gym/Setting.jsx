import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import OwnerLayout from '@/Layouts/OwnerLayout';

export default function Edit({ preferenceKeys, preferences }) {
    const [toast, setToast] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Build form data from the passed preferences
    const initialValues = {};
    Object.keys(preferenceKeys || {}).forEach((key) => {
        initialValues[key] = preferences?.[key] ?? false;
    });

    const { data, setData, put, errors } = useForm({
        preferences: initialValues,
    });

    // Toggle a single preference
    const togglePreference = (key) => {
        setData('preferences', {
            ...data.preferences,
            [key]: !data.preferences[key],
        });
    };

    // Handle submit
    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        put(route('owner.settings.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setToast({ type: 'success', message: 'Notification preferences updated.' });
                setTimeout(() => setToast(null), 4000);
            },
            onError: () => {
                setToast({ type: 'error', message: 'Failed to update preferences. Please try again.' });
                setTimeout(() => setToast(null), 4000);
            },
            onFinish: () => setProcessing(false),
        });
    };

    // Get icon for a preference key
    const getPreferenceIcon = (key) => {
        const icons = {
            notify_new_review: '⭐',
            notify_new_report: '🚩',
            notify_gym_status_change: '🔔',
        };
        return icons[key] || '📧';
    };

    // Get description for a preference key
    const getPreferenceDescription = (key) => {
        const descriptions = {
            notify_new_review: 'Get notified whenever a user leaves a review on your gym listing.',
            notify_new_report: 'Be alerted when someone files a report about your gym.',
            notify_gym_status_change: 'Stay informed about approval, suspension, or status changes on your listing.',
        };
        return descriptions[key] || 'Receive email notifications for this event.';
    };

    // Count enabled preferences
    const enabledCount = Object.values(data.preferences || {}).filter(Boolean).length;
    const totalCount = Object.keys(preferenceKeys || {}).length;

    return (
        <div className="space-y-6 pb-12">
            <Head title="Notification Preferences" />

            {/* TOAST */}
            {toast && (
                <div
                    className={`fixed top-20 right-4 z-50 max-w-sm w-full p-4 rounded-xl border shadow-lg animate-in slide-in-from-top-2 duration-300 ${
                        toast.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                >
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                            {toast.type === 'success' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-semibold">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => setToast(null)}
                            className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">
                        Notification Preferences
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Choose which email notifications you want to receive about your gym.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
                        <span className="text-xs text-slate-400">Enabled:</span>
                        <span className="ml-2 text-sm font-bold text-amber-400">
                            {enabledCount} / {totalCount}
                        </span>
                    </div>
                </div>
            </div>

            {/* MAIN FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
                    {/* Section Header */}
                    <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
                        <span className="text-xl">🔔</span>
                        <div>
                            <h2 className="text-sm font-bold text-white">
                                Email Notifications
                            </h2>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                                Toggle which events trigger an email to you
                            </p>
                        </div>
                    </div>

                    {/* Preference Rows */}
                    <div className="divide-y divide-slate-800/80">
                        {Object.entries(preferenceKeys || {}).map(([key, label]) => {
                            const enabled = data.preferences[key];
                            return (
                                <div
                                    key={key}
                                    className="px-6 py-5 hover:bg-slate-800/20 transition"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center text-lg transition-all ${
                                            enabled
                                                ? 'bg-amber-500/10 border-amber-500/30'
                                                : 'bg-slate-800/60 border-slate-700/60'
                                        }`}>
                                            {getPreferenceIcon(key)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <label
                                                        htmlFor={`pref-${key}`}
                                                        className={`block text-sm font-semibold transition-colors cursor-pointer ${
                                                            enabled ? 'text-white' : 'text-slate-300'
                                                        }`}
                                                    >
                                                        {label}
                                                    </label>
                                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                        {getPreferenceDescription(key)}
                                                    </p>
                                                </div>

                                                {/* Toggle Switch */}
                                                <button
                                                    type="button"
                                                    id={`pref-${key}`}
                                                    role="switch"
                                                    aria-checked={enabled}
                                                    onClick={() => togglePreference(key)}
                                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                                                        enabled ? 'bg-amber-500' : 'bg-slate-700'
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                                                            enabled ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                            </div>

                                            {/* Status Pill */}
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                                                    enabled
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        : 'bg-slate-800 text-slate-500 border-slate-700'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                        enabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                                                    }`}></span>
                                                    {enabled ? 'Enabled' : 'Disabled'}
                                                </span>
                                            </div>

                                            {errors[`preferences.${key}`] && (
                                                <p className="text-rose-400 text-[10px] mt-2">
                                                    {errors[`preferences.${key}`]}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Empty State */}
                        {Object.keys(preferenceKeys || {}).length === 0 && (
                            <div className="px-6 py-12 text-center">
                                <div className="text-4xl mb-3">🔔</div>
                                <p className="text-sm font-semibold text-slate-400">
                                    No notification preferences available
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Notification options will appear here once configured.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Bar */}
                {Object.keys(preferenceKeys || {}).length > 0 && (
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-xs text-slate-500">
                            Changes take effect immediately after saving.
                        </p>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => {
                                    const resetValues = {};
                                    Object.keys(preferenceKeys).forEach((key) => {
                                        resetValues[key] = preferences?.[key] ?? false;
                                    });
                                    setData('preferences', resetValues);
                                }}
                                className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all hover:text-white"
                            >
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 sm:flex-none px-6 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl border border-amber-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Preferences'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </form>

            {/* Info Box */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        💡
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">About Notification Preferences</h3>
                        <ul className="mt-2 space-y-1 text-xs text-slate-400">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span>These preferences control <strong className="text-white">email notifications</strong> sent to your account.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span>In-app notifications are always delivered regardless of these settings.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span>You can change these preferences at any time — updates apply immediately.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Persistent Inertia Layout Assignment
Edit.layout = (page) => <OwnerLayout>{page}</OwnerLayout>;