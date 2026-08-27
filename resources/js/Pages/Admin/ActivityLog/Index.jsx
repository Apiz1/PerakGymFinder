import React, { useState, useEffect, useRef } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ activities, filters, subjectTypes }) {
    const [search, setSearch] = useState('');
    const [selectedSubject, setSelectedSubject] = useState(filters.subject_type || '');
    const [selectedEvent, setSelectedEvent] = useState(filters.event || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const isFirstRender = useRef(true);

    // Event types for filter dropdown
    const eventTypes = [
        { value: '', label: 'All Events' },
        { value: 'created', label: 'Created' },
        { value: 'updated', label: 'Updated' },
        { value: 'deleted', label: 'Deleted' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'suspended', label: 'Suspended' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'dismissed', label: 'Dismissed' },
    ];

    // Debounced Search Effect
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const params = {
            search: search || undefined,
            subject_type: selectedSubject || undefined,
            event: selectedEvent || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        };

        const timer = setTimeout(() => {
            router.get(
                route('admin.activity-log.index'),
                params,
                { preserveState: true, replace: true }
            );
        }, 350);

        return () => clearTimeout(timer);
    }, [search, selectedSubject, selectedEvent, dateFrom, dateTo]);

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

    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString('en-MY', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    // Get subject link
    const getSubjectLink = (activity) => {
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

    // Reset filters
    const resetFilters = () => {
        setSearch('');
        setSelectedSubject('');
        setSelectedEvent('');
        setDateFrom('');
        setDateTo('');
    };

    // Check if any filters are active
    const hasActiveFilters = search || selectedSubject || selectedEvent || dateFrom || dateTo;

    return (
        <div className="space-y-6 pb-12">
            <Head title="Activity Log" />

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Activity Log</h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Track all actions across the platform — gyms, reports, applications, and user management.
                    </p>
                </div>
            </div>

            {/* FILTER BAR */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl backdrop-blur-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Search */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                            🔍
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search activities..."
                            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-slate-600"
                        />
                    </div>

                    {/* Subject Type Filter */}
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all appearance-none cursor-pointer"
                    >
                        <option value="">All Subjects</option>
                        {subjectTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>

                    {/* Event Filter */}
                    <select
                        value={selectedEvent}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all appearance-none cursor-pointer"
                    >
                        {eventTypes.map((event) => (
                            <option key={event.value} value={event.value}>
                                {event.label}
                            </option>
                        ))}
                    </select>

                    {/* Date From */}
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all"
                        placeholder="Date From"
                    />

                    {/* Date To */}
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all"
                        placeholder="Date To"
                    />
                </div>

                {/* Filter Actions */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60">
                    <div className="text-xs text-slate-500 font-mono">
                        Showing <span className="text-slate-200 font-bold">{activities.data?.length || 0}</span> of <span className="text-slate-200 font-bold">{activities.total || 0}</span> activities
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="text-xs text-amber-400 hover:text-amber-300 transition font-medium"
                        >
                            Clear all filters ✕
                        </button>
                    )}
                </div>
            </div>

            {/* DATA TABLE CARD */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950/80 uppercase text-[10px] font-bold tracking-wider text-slate-400 border-b border-slate-800">
                            <tr>
                                <th scope="col" className="px-6 py-4">Action</th>
                                <th scope="col" className="px-6 py-4">Subject</th>
                                <th scope="col" className="px-6 py-4">Event</th>
                                <th scope="col" className="px-6 py-4">User</th>
                                <th scope="col" className="px-6 py-4">Timestamp</th>
                                <th scope="col" className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                            {activities.data && activities.data.length > 0 ? (
                                activities.data.map((activity) => {
                                    const subjectLink = getSubjectLink(activity);
                                    return (
                                        <tr key={activity.id} className="hover:bg-slate-800/40 transition-colors">
                                            {/* Action Description */}
                                            <td className="px-6 py-4">
                                                <div className="max-w-[200px]">
                                                    <div className="text-sm text-slate-200">
                                                        {activity.description || 'No description'}
                                                    </div>
                                                    {activity.properties?.attributes && (
                                                        <div className="mt-1 text-[10px] text-slate-500">
                                                            {Object.keys(activity.properties.attributes).length > 0 && (
                                                                <span>{Object.keys(activity.properties.attributes).join(', ')}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Subject */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base">
                                                        {getSubjectIcon(activity.subject_type)}
                                                    </span>
                                                    <div>
                                                        <div className="font-semibold text-slate-200">
                                                            {getSubjectLabel(activity.subject_type)}
                                                        </div>
                                                        {activity.subject && (
                                                            <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                                                                {activity.subject.name || activity.subject.title || `ID: ${activity.subject.id}`}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Event */}
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border ${getEventBadge(activity.event)}`}>
                                                    {activity.event || 'Unknown'}
                                                </span>
                                            </td>

                                            {/* User */}
                                            <td className="px-6 py-4">
                                                {activity.causer ? (
                                                    <div>
                                                        <div className="font-semibold text-slate-200">{activity.causer.name}</div>
                                                        <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                                                            {activity.causer.email}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500 italic">System</span>
                                                )}
                                            </td>

                                            {/* Timestamp */}
                                            <td className="px-6 py-4">
                                                <div className="text-slate-300">
                                                    {formatDate(activity.created_at)}
                                                </div>
                                                <div className="text-[10px] text-slate-500">
                                                    {new Date(activity.created_at).toLocaleTimeString('en-MY', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit'
                                                    })}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('admin.activity-log.show', activity.id)}
                                                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 font-bold transition-all text-xs"
                                                    >
                                                        View Details
                                                    </Link>
                                                    {subjectLink && (
                                                        <Link
                                                            href={subjectLink}
                                                            className="text-slate-500 hover:text-amber-400 p-1.5 rounded-lg hover:bg-slate-800/50 transition-all"
                                                            title="View Subject"
                                                        >
                                                            🔗
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        <div className="text-3xl mb-2">📜</div>
                                        <p className="font-semibold text-slate-400">No activities found</p>
                                        <p className="text-[11px] text-slate-600 mt-1">Try adjusting your filters or search terms.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION FOOTER */}
                {activities.links && activities.links.length > 3 && (
                    <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                            Page <span className="text-slate-300 font-bold">{activities.current_page}</span> of <span className="text-slate-300 font-bold">{activities.last_page}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {activities.links.map((link, key) => (
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

            {/* Info Box */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        ℹ️
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Activity Log Information</h3>
                        <ul className="mt-2 space-y-1 text-xs text-slate-400">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span>All actions are logged automatically by the system</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span>Use filters to narrow down by subject type, event, or date range</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span>Click <strong className="text-white">View Details</strong> to see full before/after changes</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span>Click the <strong className="text-white">🔗</strong> icon to navigate directly to the subject</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Persistent Inertia Layout Assignment
Index.layout = (page) => <AdminLayout>{page}</AdminLayout>;