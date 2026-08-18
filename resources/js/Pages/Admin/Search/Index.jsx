import React, { useState, useEffect, useRef } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ query = '', gyms = [], users = [] }) {
    const [searchQuery, setSearchQuery] = useState(query || '');
    const [isSearching, setIsSearching] = useState(false);
    const isFirstRender = useRef(true);

    // Debounced Search Effect
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        setIsSearching(true);
        const timer = setTimeout(() => {
            router.get(
                route('admin.search.index'),
                { q: searchQuery },
                { preserveState: true, replace: true }
            );
            setIsSearching(false);
        }, 350);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Handle search submit
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim().length > 2) {
            router.get(
                route('admin.search.index'),
                { q: searchQuery },
                { preserveState: true, replace: true }
            );
        }
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString('en-MY', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    // Role Badge Component Helper
    const renderRoleBadge = (role) => {
        switch (role) {
            case 'super_admin':
                return (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-purple-900/50 text-purple-200 border border-purple-600/50">
                        Super Admin
                    </span>
                );
            case 'gym_owner':
                return (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-900/50 text-emerald-200 border border-emerald-600/50">
                        Gym Owner
                    </span>
                );
            case 'user':
                return (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-900/50 text-blue-200 border border-blue-600/50">
                        User
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {role || 'Unknown'}
                    </span>
                );
        }
    };

    // Status Badge
    const renderStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Approved
                    </span>
                );
            case 'pending':
                return (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Pending
                    </span>
                );
            case 'rejected':
                return (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Rejected
                    </span>
                );
            case 'suspended':
                return (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        Suspended
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {status || 'Unknown'}
                    </span>
                );
        }
    };

    // Highlight matching text
    const highlightText = (text, searchTerm) => {
        if (!searchTerm || !text) return text;
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, index) => 
            regex.test(part) ? (
                <mark key={index} className="bg-amber-500/20 text-amber-300 px-0.5 rounded">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    };

    const totalResults = gyms.length + users.length;

    return (
        <div className="space-y-6 pb-12">
            <Head title="Search" />

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Search</h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Search for gyms and users across the platform. Minimum 3 characters required.
                    </p>
                </div>
            </div>

            {/* SEARCH BAR */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 backdrop-blur-sm">
                <form onSubmit={handleSearch} className="relative w-full">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                        🔍
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by gym name, address, user name, or email..."
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-slate-600"
                        autoFocus
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchQuery('');
                                router.get(
                                    route('admin.search.index'),
                                    { q: '' },
                                    { preserveState: true, replace: true }
                                );
                            }}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-500 hover:text-slate-300"
                        >
                            ✕
                        </button>
                    )}
                </form>
                <div className="text-xs text-slate-500 font-mono whitespace-nowrap">
                    {searchQuery.length > 0 ? (
                        isSearching ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Searching...
                            </span>
                        ) : (
                            `${totalResults} result${totalResults !== 1 ? 's' : ''} found`
                        )
                    ) : (
                        'Enter at least 3 characters to search'
                    )}
                </div>
            </div>

            {/* RESULTS */}
            {searchQuery.length >= 3 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gyms Results */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                                <span>🏋️</span> Gyms
                                <span className="text-xs font-normal text-slate-400">
                                    ({gyms.length})
                                </span>
                            </h2>
                            {gyms.length > 0 && (
                                <Link
                                    href={`/admin/gyms?search=${searchQuery}`}
                                    className="text-xs text-amber-400 hover:text-amber-300 transition"
                                >
                                    View All →
                                </Link>
                            )}
                        </div>

                        <div className="p-4">
                            {gyms.length > 0 ? (
                                <div className="space-y-3">
                                    {gyms.map((gym) => (
                                        <Link
                                            key={gym.id}
                                            href={route('admin.gyms.show', gym.id)}
                                            className="block p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 transition group"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="font-semibold text-white text-sm">
                                                        {highlightText(gym.name, searchQuery)}
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-0.5">
                                                        {highlightText(gym.address || 'No address', searchQuery)}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        {renderStatusBadge(gym.status)}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-amber-400 group-hover:text-amber-300 transition ml-2">
                                                    View →
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-3xl mb-2">🏋️</div>
                                    <p className="text-sm text-slate-400">No gyms found matching your search.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Users Results */}
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                                <span>👤</span> Users
                                <span className="text-xs font-normal text-slate-400">
                                    ({users.length})
                                </span>
                            </h2>
                            {users.length > 0 && (
                                <Link
                                    href={`/admin/users?search=${searchQuery}`}
                                    className="text-xs text-amber-400 hover:text-amber-300 transition"
                                >
                                    View All →
                                </Link>
                            )}
                        </div>

                        <div className="p-4">
                            {users.length > 0 ? (
                                <div className="space-y-3">
                                    {users.map((user) => (
                                        <Link
                                            key={user.id}
                                            href={route('admin.users.show', user.id)}
                                            className="block p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 transition group"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                                            {user.name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-white text-sm">
                                                                {highlightText(user.name, searchQuery)}
                                                            </div>
                                                            <div className="text-xs text-slate-400">
                                                                {highlightText(user.email, searchQuery)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-1.5">
                                                        {renderRoleBadge(user.role?.name)}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-amber-400 group-hover:text-amber-300 transition ml-2">
                                                    View →
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-3xl mb-2">👤</div>
                                    <p className="text-sm text-slate-400">No users found matching your search.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : searchQuery.length > 0 ? (
                <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-12 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-bold text-white mb-2">Type at least 3 characters</h3>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                        Please enter at least 3 characters to start searching for gyms and users.
                    </p>
                </div>
            ) : (
                <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-12 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-bold text-white mb-2">Search for anything</h3>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                        Enter a gym name, address, user name, or email to find what you're looking for.
                    </p>
                </div>
            )}

            {/* Info Box */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        💡
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Search Tips</h3>
                        <ul className="mt-2 space-y-1 text-xs text-slate-400">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">Gyms:</strong> Search by name or address</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">Users:</strong> Search by name or email</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">Results:</strong> Limited to 5 results per category for quick access</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">View All:</strong> Click "View All" to see full results in the respective index page</span>
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