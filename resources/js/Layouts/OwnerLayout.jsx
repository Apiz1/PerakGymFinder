import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function OwnerLayout({ children, title = 'Owner Dashboard' }) {
    const { auth, gym, notifications = [], url } = usePage().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [userDropdown, setUserDropdown] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationList, setNotificationList] = useState([]);
    const currentUrl = usePage().url;

    // Check if owner has a gym yet
    const hasGym = !!gym;

    // Navigation Structure - Scoped to Owner capabilities
    const navItems = [
        { 
            name: 'Dashboard', 
            path: '/owner/dashboard', 
            icon: '📊',
            requiresGym: false
        },
        { 
            name: 'My Gym', 
            path: '/owner/gym/edit', 
            icon: '🏋️‍♂️',
            requiresGym: true
        },
        { 
            name: 'Photos', 
            path: '/owner/gym/photos', 
            icon: '📸',
            requiresGym: true
        },
        { 
            name: 'Operating Hours', 
            path: '/owner/gym/hours', 
            icon: '🕒',
            requiresGym: true
        },
        { 
            name: 'Facilities & Categories', 
            path: '/owner/gym/facilities', 
            icon: '🏷️',
            requiresGym: true
        },
        { 
            name: 'Membership Plans', 
            path: '/owner/gym/memberships', 
            icon: '💳',
            requiresGym: true
        },
        { 
            name: 'Reviews', 
            path: '/owner/gym/reviews', 
            icon: '⭐',
            badge: gym?.pending_reviews_count || 0,
            requiresGym: true
        },
        { 
            name: 'Analytics', 
            path: '/owner/gym/analytics', 
            icon: '📈',
            requiresGym: true
        },
        { 
            name: 'Reports', 
            path: '/owner/gym/reports', 
            icon: '🚨',
            badge: gym?.reports_count || 0,
            requiresGym: true
        },
        { 
            name: 'Settings', 
            path: '/owner/settings', 
            icon: '⚙️',
            requiresGym: false
        },
    ];

    // Close mobile drawer on route changes
    useEffect(() => {
        setMobileMenuOpen(false);
        setUserDropdown(false);
        setNotificationsOpen(false);
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

    useEffect(() => {
        fetch('/owner/notifications')
            .then(res => res.json())
            .then(data => setUnreadCount(data.unreadCount))
            .catch(error => console.error('Error fetching notifications:', error));
    }, []);

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
            router.get('/owner/search', { q: searchQuery });
        }
    };

    const isActive = (path) => currentUrl.startsWith(path);

    // Check if a nav item should be disabled (requires gym but owner has none)
    const isItemDisabled = (item) => {
        return item.requiresGym && !hasGym;
    };

    // Get gym status badge
    const getGymStatusBadge = () => {
        if (!gym) return null;
        
        const statusConfigs = {
            approved: { label: '✅ Live', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' },
            pending: { label: '⏳ Pending Approval', color: 'bg-amber-500/20 text-amber-400 border-amber-500/20' },
            rejected: { label: '❌ Rejected', color: 'bg-rose-500/20 text-rose-400 border-rose-500/20' },
            suspended: { label: '⛔ Suspended', color: 'bg-red-500/20 text-red-400 border-red-500/20' },
        };
        
        const config = statusConfigs[gym.status] || statusConfigs.pending;
        return (
            <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${config.color}`}>
                {config.label}
            </span>
        );
    };

    // Get user initials
    const getUserInitials = () => {
        const name = auth?.user?.name || 'Owner';
        const names = name.split(' ');
        if (names.length >= 2) {
            return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    // Get CSRF token safely
    const getCsrfToken = () => {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        return metaTag ? metaTag.content : '';
    };

    const toggleDropdown = () => {
        if (!notificationsOpen) {
            // fetch fresh list every time it's opened
            fetch('/owner/notifications')
                .then(res => res.json())
                .then(data => {
                    setNotificationList(data.notifications);
                    setUnreadCount(data.unreadCount);
                })
                .catch(error => console.error('Error fetching notifications:', error));
        }
        setNotificationsOpen(!notificationsOpen);
    };

    const markRead = (notification) => {
        // Fix: Safely get CSRF token with null check
        const csrfToken = getCsrfToken();
        
        fetch(`/owner/notifications/${notification.id}/read`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Content-Type': 'application/json',
            },
        }).then(() => {
            setNotificationList(prev =>
                prev.map(n => n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        }).catch(error => console.error('Error marking notification as read:', error));
    };

    const NOTIFICATION_LABELS = {
        new_owner_application: 'New gym owner application',
        gym_pending_approval: 'Gym pending approval',
        new_report: 'New report filed',
        gym_review: 'New review posted',
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
            {/* 1. TOP HEADER */}
            <header className="sticky top-0 z-40 h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 transition-all">
                {/* Left Section: Mobile Menu + Logo + Gym Identity */}
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
                    <Link href="/owner/dashboard" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-[1px] shadow-lg shadow-amber-500/10">
                            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center text-amber-400 font-bold group-hover:bg-transparent group-hover:text-slate-950 transition-all duration-300">
                                🏋️
                            </div>
                        </div>
                        <span className="text-base font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                            GymFinder <span className="text-amber-500 font-semibold">Owner</span>
                        </span>
                    </Link>

                    {/* Gym Identity Bar */}
                    {gym && (
                        <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-800/80">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white">{gym.name}</span>
                                {getGymStatusBadge()}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {/* Quick Search */}
                    <form onSubmit={handleSearch} className="hidden lg:block relative w-48 xl:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                        />
                    </form>

                    {/* Notifications Dropdown Toggle */}
                    <div className="relative">
                        <button
                            onClick={toggleDropdown}
                            className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-400 transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[9px] font-bold text-slate-950 justify-center items-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                </span>
                            )}
                        </button>

                        {notificationsOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden z-20">
                                <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Notifications</span>
                                    {unreadCount > 0 && (
                                        <button 
                                            onClick={() => {
                                                const csrfToken = getCsrfToken();
                                                fetch('/owner/notifications/read-all', {
                                                    method: 'POST',
                                                    headers: {
                                                        'X-CSRF-TOKEN': csrfToken,
                                                        'Content-Type': 'application/json',
                                                    },
                                                })
                                                .then(() => {
                                                    setNotificationList(prev => 
                                                        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
                                                    );
                                                    setUnreadCount(0);
                                                })
                                                .catch(error => console.error('Error marking all as read:', error));
                                            }}
                                            className="text-[10px] font-bold text-amber-400 hover:text-amber-300 transition"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notificationList.length > 0 ? (
                                        notificationList.map((n) => (
                                            <button
                                                key={n.id}
                                                onClick={() => markRead(n)}
                                                className={`block w-full text-left px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/50 transition ${
                                                    !n.read_at ? 'bg-slate-800/30' : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {!n.read_at && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                                                    <span className="text-xs font-semibold text-slate-200">
                                                        {NOTIFICATION_LABELS[n.type] ?? n.type}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 mt-1">
                                                    {new Date(n.created_at).toLocaleString()}
                                                </p>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-500 px-4 py-6 text-center">No notifications yet.</p>
                                    )}
                                </div>
                                {notificationList.length > 0 && (
                                    <div className="px-4 py-2 border-t border-slate-800 text-center">
                                        <Link 
                                            href="/owner/notifications" 
                                            className="text-xs text-amber-400 hover:text-amber-300 transition"
                                            onClick={() => setNotificationsOpen(false)}
                                        >
                                            View all notifications →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

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
                                {auth?.user?.name || 'Gym Owner'}
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
                                        <p className="text-xs font-semibold text-white">{auth?.user?.name || 'Gym Owner'}</p>
                                        <p className="text-[10px] text-slate-400 truncate">{auth?.user?.email || 'owner@gymfinder.com'}</p>
                                    </div>
                                    <Link
                                        href="/owner/profile"
                                        className="block px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition"
                                    >
                                        My Profile
                                    </Link>
                                    <Link
                                        href="/owner/settings"
                                        className="block px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-amber-400 transition"
                                    >
                                        Account Settings
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

            {/* 2. GYM SETUP NUDGE - Only show if owner has no gym */}
            {!hasGym && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🏗️</span>
                        <div>
                            <span className="font-semibold text-amber-400">Finish setting up your gym!</span>
                            <span className="text-slate-300 ml-2">You haven't created your gym listing yet.</span>
                        </div>
                    </div>
                    <Link 
                        href="/owner/gym/create" 
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-1.5 rounded-lg transition text-xs shadow-lg shadow-amber-500/20"
                    >
                        Create Your Gym Now →
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
                                Manage Your Gym
                            </div>
                            <nav className="space-y-1">
                                {navItems.map((item) => {
                                    const active = isActive(item.path);
                                    const disabled = isItemDisabled(item);
                                    
                                    return (
                                        <Link
                                            key={item.name}
                                            href={disabled ? '#' : item.path}
                                            onClick={(e) => {
                                                if (disabled) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${active ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : disabled ? 'text-slate-600 cursor-not-allowed opacity-50' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`text-base transition-transform ${!disabled && 'group-hover:scale-110'} ${active ? 'opacity-100' : 'opacity-70'}`}>
                                                    {item.icon}
                                                </span>
                                                <span>{item.name}</span>
                                                {disabled && (
                                                    <span className="text-[8px] text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded">
                                                        Locked
                                                    </span>
                                                )}
                                            </div>
                                            {item.badge > 0 && (
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${active ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Gym Status Card */}
                        {gym && (
                            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-300">{gym.name}</span>
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-1">
                                    {gym.city?.name || 'Location not set'}
                                </div>
                                <div className="mt-2 pt-2 border-t border-slate-800/50 flex justify-between text-[10px]">
                                    <span className="text-slate-400">Views: {gym.total_views || 0}</span>
                                    <span className="text-slate-400">Rating: {gym.average_rating || 'N/A'}</span>
                                </div>
                            </div>
                        )}

                        {/* No Gym Yet - Setup Card */}
                        {!hasGym && (
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="text-amber-400">🚀</span>
                                    <span className="font-semibold text-amber-400">Get Started</span>
                                </div>
                                <p className="text-slate-400 text-[10px] mt-1">
                                    Create your gym listing to start managing your business on GymFinder.
                                </p>
                                <Link 
                                    href="/owner/gym/create" 
                                    className="mt-2 inline-block bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-lg transition text-[10px] w-full text-center"
                                >
                                    Create Your Gym
                                </Link>
                            </div>
                        )}
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
                                
                                {/* Mobile Gym Identity */}
                                {gym && (
                                    <div className="mb-4 p-3 bg-slate-900/50 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-white text-sm">{gym.name}</span>
                                            {getGymStatusBadge()}
                                        </div>
                                    </div>
                                )}

                                <nav className="space-y-1">
                                    {navItems.map((item) => {
                                        const disabled = isItemDisabled(item);
                                        return (
                                            <Link
                                                key={item.name}
                                                href={disabled ? '#' : item.path}
                                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium ${isActive(item.path) ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : disabled ? 'text-slate-600 cursor-not-allowed opacity-50' : 'text-slate-400'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span>{item.icon}</span>
                                                    <span>{item.name}</span>
                                                </div>
                                                {item.badge > 0 && (
                                                    <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
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
                    GymFinder Perak Owner Portal &bull; System Build <code className="text-slate-400 font-mono">2026.08.05</code>
                </div>
                <div className="flex gap-4">
                    <Link href="/owner/help" className="hover:text-slate-300 transition">Help</Link>
                    <Link href="/owner/support" className="hover:text-slate-300 transition">Support</Link>
                    <Link href="/owner/terms" className="hover:text-slate-300 transition">Terms</Link>
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
                            Are you sure you want to logout? You'll need to sign in again to access your owner dashboard.
                        </p>

                        {/* User Info */}
                        <div className="bg-white/5 rounded-xl p-3 mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20">
                                {getUserInitials()}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{auth?.user?.name || 'Gym Owner'}</p>
                                <p className="text-xs text-slate-400">{auth?.user?.email || 'owner@gymfinder.com'}</p>
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