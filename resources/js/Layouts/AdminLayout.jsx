import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function AdminLayout({ children, title = 'Admin Dashboard' }) {
    const { auth, pendingCounts = {}, url } = usePage().props;
    const [processingId, setProcessingId] = useState(null);
    const currentUrl = usePage().url;
    const [searchQuery, setSearchQuery] = useState('');
    const [userDropdown, setUserDropdown] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // Navigation Structure
    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
        { name: 'Owner Applications', path: '/admin/owner-applications', icon: '📑', count: pendingCounts.owners },
        { name: 'Gyms', path: '/admin/gyms', icon: '🏋️‍♂️', count: pendingCounts.gyms },
        { name: 'Reviews', path: '/admin/reviews', icon: '⭐', count: pendingCounts.reviews },
        { name: 'Reports', path: '/admin/reports', icon: '🚩', count: pendingCounts.reports },
        { name: 'Users', path: '/admin/users', icon: '👥' },
        { name: 'Locations', path: '/admin/locations', icon: '🗺️' },
        { name: 'Taxonomy', path: '/admin/taxonomy', icon: '🏷️' },
        { name: 'Activity Log', path: '/admin/logs', icon: '📜' },
        { name: 'Settings', path: '/admin/settings', icon: '⚙️' },
    ];

    const totalPending = (pendingCounts.gyms || 0) + (pendingCounts.owners || 0) + 
                        (pendingCounts.reviews || 0) + (pendingCounts.reports || 0);

    // Close mobile drawer on route changes
    useEffect(() => {
        setMobileMenuOpen(false);
        setUserDropdown(false);
    }, [currentUrl]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isLogoutModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isLogoutModalOpen]);

    // Handle logout with modal
    const handleLogoutClick = () => {
        setUserDropdown(false);
        setIsLogoutModalOpen(true);
    };

    // Confirm logout
    const confirmLogout = () => {
        setIsLogoutModalOpen(false);
        router.post('/logout');
    };

    // Cancel logout
    const cancelLogout = () => {
        setIsLogoutModalOpen(false);
    };

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim().length > 2) {
            router.get(route('admin.search.index'), { q: searchQuery });
        }
    };

    const isActive = (path) => currentUrl.startsWith(path);

    // Get user initials
    const getUserInitials = () => {
        const name = auth?.user?.name || 'Admin';
        const names = name.split(' ');
        if (names.length >= 2) {
            return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
            {/* 1. TOP HEADER */}
            <header className="sticky top-0 z-40 h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 transition-all">
                {/* Left Section: Mobile Menu + Logo + Search */}
                <div className="flex items-center gap-4 lg:gap-6">
                    {/* Mobile Hamburger Button */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition"
                        aria-label="Toggle Navigation"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>

                    {/* Logo */}
                    <Link href="/admin/dashboard" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-[1px] shadow-lg shadow-amber-500/10">
                            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-amber-400 font-bold group-hover:bg-transparent group-hover:text-slate-950 transition-all duration-300">
                                ⚡
                            </div>
                        </div>
                        <span className="text-base font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                            GymFinder <span className="text-amber-500 font-semibold">Admin</span>
                        </span>
                    </Link>

                    {/* Quick Search */}
                    <form onSubmit={handleSearch} className="hidden md:block relative w-64 lg:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search Gyms, Users, Reports..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                        />
                    </form>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {/* Notifications Dropdown Toggle */}
                    <button className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-400 transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {totalPending > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[9px] font-bold text-slate-950 justify-center items-center">
                                    {totalPending}
                                </span>
                            </span>
                        )}
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setUserDropdown(!userDropdown)}
                            className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800/80 pl-1.5 pr-3 py-1.5 rounded-xl transition group"
                        >
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center shadow-sm">
                                {getUserInitials()}
                            </div>
                            <span className="text-xs font-medium text-slate-300 group-hover:text-white hidden sm:inline">
                                {auth?.user?.name || 'Super Admin'}
                            </span>
                            <svg className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {userDropdown && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setUserDropdown(false)} />
                                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="px-4 py-2 border-b border-slate-800">
                                        <p className="text-xs font-semibold text-white">{auth?.user?.name || 'Administrator'}</p>
                                        <p className="text-[10px] text-slate-400 truncate">{auth?.user?.email || 'admin@gymfinder.com'}</p>
                                    </div>
                                    <Link
                                        href="/admin/profile"
                                        className="block px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition"
                                    >
                                        My Profile
                                    </Link>
                                    <Link
                                        href="/admin/settings"
                                        className="block px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition"
                                    >
                                        System Settings
                                    </Link>
                                    <div className="border-t border-slate-800 my-1"></div>
                                    <button
                                        onClick={handleLogoutClick}
                                        className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition flex items-center gap-2"
                                    >
                                        <span>Log Out</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* 2. ACTION STRIP BANNER */}
            {totalPending > 0 && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-200">
                    <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                        <span className="font-semibold text-amber-400">Action Needed:</span>
                        <span className="text-slate-300">
                            {pendingCounts.gyms || 0} Gyms · {pendingCounts.owners || 0} Claims · {pendingCounts.reviews || 0} Reviews · {pendingCounts.reports || 0} Reports
                        </span>
                    </div>
                    <Link href="/admin/pending" className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4 transition">
                        Review Backlog &rarr;
                    </Link>
                </div>
            )}

            {/* 3. MAIN CONTENT CONTAINER */}
            <div className="flex-1 flex overflow-hidden">
                {/* DESKTOP PERSISTENT SIDEBAR */}
                <aside className="w-64 bg-slate-950/50 border-r border-slate-800/80 p-4 hidden md:flex flex-col justify-between shrink-0">
                    <div className="space-y-6">
                        <div>
                            <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Core Management
                            </div>
                            <nav className="space-y-1">
                                {navItems.map((item) => {
                                    const active = isActive(item.path);
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.path}
                                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                                                active
                                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`text-base transition-transform group-hover:scale-110 ${active ? 'opacity-100' : 'opacity-70'}`}>
                                                    {item.icon}
                                                </span>
                                                <span>{item.name}</span>
                                            </div>
                                            {item.count > 0 && (
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                                    active ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                                                }`}>
                                                    {item.count}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Environment Footer Card */}
                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-300">GymFinder Engine</span>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">v2.4.0 (Laravel 11 + Inertia)</div>
                    </div>
                </aside>

                {/* MOBILE DRAWER OVERLAY */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-50 md:hidden flex">
                        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                        <div className="relative w-72 bg-slate-950 border-r border-slate-800 h-full p-4 flex flex-col justify-between z-10">
                            <div>
                                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                                    <span className="font-bold text-white">Navigation</span>
                                    <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                                </div>
                                <nav className="space-y-1">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.path}
                                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium ${
                                                isActive(item.path) ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span>{item.icon}</span>
                                                <span>{item.name}</span>
                                            </div>
                                            {item.count > 0 && <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full">{item.count}</span>}
                                        </Link>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}

                {/* DYNAMIC CONTENT AREA */}
                <main className="flex-1 overflow-y-auto bg-slate-950/30 p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>

            {/* 4. FOOTER */}
            <footer className="border-t border-slate-900 bg-slate-950 px-6 py-3 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
                <div>
                    GymFinder Perak Internal Portal &bull; System Build <code className="text-slate-400 font-mono">2026.08.05</code>
                </div>
                <div className="flex gap-4">
                    <Link href="/admin/docs" className="hover:text-slate-300 transition">Docs</Link>
                    <Link href="/admin/audit" className="hover:text-slate-300 transition">Audit Logs</Link>
                    <Link href="/admin/support" className="hover:text-slate-300 transition">Support</Link>
                </div>
            </footer>

            {/* LOGOUT CONFIRMATION MODAL */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={cancelLogout}
                    ></div>
                    
                    {/* Modal */}
                    <div className="relative max-w-md w-full bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-xl font-bold text-white text-center mb-2">Logout Confirmation</h3>
                        <p className="text-sm text-slate-400 text-center mb-6">
                            Are you sure you want to logout? You'll need to sign in again to access the admin panel.
                        </p>

                        {/* User Info */}
                        <div className="bg-white/5 rounded-xl p-3 mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20">
                                {getUserInitials()}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{auth?.user?.name || 'Administrator'}</p>
                                <p className="text-xs text-slate-400">{auth?.user?.email || 'admin@gymfinder.com'}</p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={cancelLogout}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-sm shadow-lg shadow-red-500/20 transition-all duration-200 hover:scale-105"
                            >
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}