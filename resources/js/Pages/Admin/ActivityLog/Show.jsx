import React, { useState } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Show({ activity }) {
    const [copied, setCopied] = useState(false);

    // Get subject type label
    const getSubjectLabel = (type) => {
        const labels = {
            'App\\Models\\Gym': 'Gym',
            'App\\Models\\GymReport': 'Report',
            'App\\Models\\GymOwnerApplication': 'Owner Application',
            'App\\Models\\GymClaimRequest': 'Claim Request',
            'App\\Models\\User': 'User',
            'App\\Models\\Review': 'Review',
        };
        return labels[type] || type.split('\\').pop() || 'Unknown';
    };

    // Get subject icon
    const getSubjectIcon = (type) => {
        const icons = {
            'App\\Models\\Gym': '🏋️‍♂️',
            'App\\Models\\GymReport': '🚩',
            'App\\Models\\GymOwnerApplication': '📑',
            'App\\Models\\GymClaimRequest': '📋',
            'App\\Models\\User': '👤',
            'App\\Models\\Review': '⭐',
        };
        return icons[type] || '📌';
    };

    // Get event badge color
    const getEventBadge = (event) => {
        const colors = {
            created: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            updated: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            deleted: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            suspended: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            dismissed: 'bg-slate-800 text-slate-400 border-slate-700',
        };
        return colors[event] || 'bg-slate-800 text-slate-300 border-slate-700';
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString('en-MY', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    // Get subject link
    const getSubjectLink = () => {
        if (!activity.subject) return null;
        
        const type = activity.subject_type;
        const id = activity.subject.id;
        
        if (type === 'App\\Models\\Gym') {
            return route('admin.gyms.show', id);
        } else if (type === 'App\\Models\\GymReport') {
            return route('admin.reports.show', id);
        } else if (type === 'App\\Models\\GymOwnerApplication') {
            return route('admin.owner-applications.show', id);
        } else if (type === 'App\\Models\\User') {
            return route('admin.users.show', id);
        }
        return null;
    };

    // Copy to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // Render properties diff
    const renderProperties = () => {
        if (!activity.properties) return null;

        const props = activity.properties;
        const hasAttributes = props.attributes && Object.keys(props.attributes).length > 0;
        const hasOld = props.old && Object.keys(props.old).length > 0;

        if (!hasAttributes && !hasOld) {
            return (
                <div className="text-xs text-slate-500 italic">
                    No property changes recorded
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* Current Attributes */}
                {hasAttributes && (
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Current Attributes
                        </h4>
                        <div className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-slate-900/80">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-slate-400 font-bold">Field</th>
                                            <th className="px-4 py-2 text-left text-slate-400 font-bold">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        {Object.entries(props.attributes).map(([key, value]) => (
                                            <tr key={key} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-4 py-2 text-slate-300 font-mono text-[11px]">
                                                    {key}
                                                </td>
                                                <td className="px-4 py-2 text-slate-200">
                                                    {typeof value === 'object' ? (
                                                        <pre className="text-[11px] text-slate-400 whitespace-pre-wrap">
                                                            {JSON.stringify(value, null, 2)}
                                                        </pre>
                                                    ) : (
                                                        <span>{String(value)}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Old Values (for updates) */}
                {hasOld && (
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Previous Values
                        </h4>
                        <div className="bg-slate-950/60 border border-slate-800 rounded-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-slate-900/80">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-slate-400 font-bold">Field</th>
                                            <th className="px-4 py-2 text-left text-slate-400 font-bold">Old Value</th>
                                            <th className="px-4 py-2 text-left text-slate-400 font-bold">New Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        {Object.entries(props.old).map(([key, oldValue]) => {
                                            const newValue = props.attributes?.[key];
                                            const isChanged = oldValue !== newValue;
                                            return (
                                                <tr key={key} className="hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-4 py-2 text-slate-300 font-mono text-[11px]">
                                                        {key}
                                                    </td>
                                                    <td className="px-4 py-2 text-rose-400">
                                                        {typeof oldValue === 'object' ? (
                                                            <pre className="text-[11px] text-rose-400 whitespace-pre-wrap">
                                                                {JSON.stringify(oldValue, null, 2)}
                                                            </pre>
                                                        ) : (
                                                            <span>{String(oldValue)}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 text-emerald-400">
                                                        {typeof newValue === 'object' ? (
                                                            <pre className="text-[11px] text-emerald-400 whitespace-pre-wrap">
                                                                {JSON.stringify(newValue, null, 2)}
                                                            </pre>
                                                        ) : (
                                                            <span>{String(newValue)}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const subjectLink = getSubjectLink();

    return (
        <div className="space-y-6 pb-12">
            <Head title={`Activity Log: ${activity.description || 'Details'}`} />

            {/* BACK BUTTON */}
            <div className="flex items-center justify-between">
                <Link
                    href={route('admin.activity-log.index')}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Activity Log</span>
                </Link>

                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getEventBadge(activity.event)}`}>
                        {activity.event || 'Unknown'}
                    </span>
                </div>
            </div>

            {/* HEADER CARD */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-3xl flex-shrink-0">
                            {getSubjectIcon(activity.subject_type)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl font-black text-white tracking-tight">
                                    {activity.description || 'Activity Detail'}
                                </h1>
                                {subjectLink && (
                                    <Link
                                        href={subjectLink}
                                        className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-slate-950 transition"
                                    >
                                        View Subject →
                                    </Link>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-slate-500">Subject:</span>
                                    <span className="text-slate-200 font-semibold">
                                        {getSubjectLabel(activity.subject_type)}
                                    </span>
                                </div>
                                {activity.subject && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-slate-500">ID:</span>
                                        <span className="text-slate-200 font-mono">
                                            #{activity.subject.id}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <span className="text-slate-500">By:</span>
                                    <span className="text-slate-200 font-semibold">
                                        {activity.causer ? activity.causer.name : 'System'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                        <button
                            onClick={() => copyToClipboard(JSON.stringify(activity, null, 2))}
                            className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-all"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* DETAIL GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Meta Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activity Details</h3>
                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-2 border-b border-slate-800/60">
                                <span className="text-slate-500">ID</span>
                                <span className="text-slate-200 font-mono">#{activity.id}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800/60">
                                <span className="text-slate-500">Event</span>
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getEventBadge(activity.event)}`}>
                                    {activity.event || 'Unknown'}
                                </span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800/60">
                                <span className="text-slate-500">Subject Type</span>
                                <span className="text-slate-200 font-semibold">
                                    {getSubjectLabel(activity.subject_type)}
                                </span>
                            </div>
                            {activity.subject && (
                                <div className="flex justify-between py-2 border-b border-slate-800/60">
                                    <span className="text-slate-500">Subject ID</span>
                                    <span className="text-slate-200 font-mono">#{activity.subject.id}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-2 border-b border-slate-800/60">
                                <span className="text-slate-500">User</span>
                                <span className="text-slate-200 font-semibold">
                                    {activity.causer ? activity.causer.name : 'System'}
                                </span>
                            </div>
                            {activity.causer && (
                                <div className="flex justify-between py-2 border-b border-slate-800/60">
                                    <span className="text-slate-500">Email</span>
                                    <span className="text-slate-200 truncate max-w-[140px]">
                                        {activity.causer.email}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between py-2">
                                <span className="text-slate-500">Timestamp</span>
                                <span className="text-slate-200 text-right">
                                    {formatDate(activity.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Subject Preview Card */}
                    {activity.subject && (
                        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subject Preview</h3>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xl flex-shrink-0">
                                    {getSubjectIcon(activity.subject_type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-slate-200 text-sm truncate">
                                        {activity.subject.name || activity.subject.title || `#${activity.subject.id}`}
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                        {getSubjectLabel(activity.subject_type)}
                                    </div>
                                </div>
                            </div>
                            {subjectLink && (
                                <Link
                                    href={subjectLink}
                                    className="inline-flex items-center justify-center w-full text-xs font-bold text-amber-400 hover:text-amber-300 transition bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl px-4 py-2"
                                >
                                    View Full Subject →
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column - Properties / Changes */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                            Property Changes
                        </h3>
                        {renderProperties()}
                    </div>

                    {/* Raw JSON (collapsible) */}
                    <details className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                        <summary className="cursor-pointer text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-300 transition">
                            Raw Activity Data
                        </summary>
                        <div className="mt-4">
                            <pre className="text-[10px] text-slate-400 bg-slate-950/60 border border-slate-800 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto">
                                {JSON.stringify(activity, (key, value) => {
                                    if (key === 'subject' && value) {
                                        return { id: value.id, type: activity.subject_type };
                                    }
                                    return value;
                                }, 2)}
                            </pre>
                        </div>
                    </details>
                </div>
            </div>

            {/* NAVIGATION - Back to List */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/60">
                <Link
                    href={route('admin.activity-log.index')}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Activity Log</span>
                </Link>

                {subjectLink && (
                    <Link
                        href={subjectLink}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                    >
                        <span>View Subject</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                )}
            </div>
        </div>
    );
}

// Persistent Inertia Layout Assignment
Show.layout = (page) => <AdminLayout>{page}</AdminLayout>;