import React, { useState, useEffect, useMemo } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';

export default function MainLayout({ children }) {
    const { auth } = usePage().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [backgroundIndex, setBackgroundIndex] = useState(0);

    // Random background configurations (matching Home page)
    const backgrounds = useMemo(() => [
        {
            gradient: 'from-blue-900 via-purple-900 to-pink-900',
            pattern: 'dots',
            glowColor: 'rgba(139, 92, 246, 0.15)'
        },
        {
            gradient: 'from-emerald-900 via-teal-900 to-cyan-900',
            pattern: 'grid',
            glowColor: 'rgba(16, 185, 129, 0.15)'
        },
        {
            gradient: 'from-amber-900 via-orange-900 to-red-900',
            pattern: 'circles',
            glowColor: 'rgba(245, 158, 11, 0.15)'
        },
        {
            gradient: 'from-indigo-900 via-blue-900 to-cyan-900',
            pattern: 'waves',
            glowColor: 'rgba(99, 102, 241, 0.15)'
        },
        {
            gradient: 'from-rose-900 via-pink-900 to-fuchsia-900',
            pattern: 'squares',
            glowColor: 'rgba(244, 63, 94, 0.15)'
        },
        {
            gradient: 'from-violet-900 via-purple-900 to-indigo-900',
            pattern: 'triangles',
            glowColor: 'rgba(139, 92, 246, 0.15)'
        }
    ], []);

    // Select random background on mount
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * backgrounds.length);
        setBackgroundIndex(randomIndex);
    }, []);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown-wrapper')) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isProfileDropdownOpen]);

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

    const currentBg = backgrounds[backgroundIndex] || backgrounds[0];

    // Safe route helper to prevent errors - REMOVED profile.settings
    const getRoute = (name, params = {}) => {
        try {
            return route(name, params);
        } catch (e) {
            console.warn(`Route "${name}" not found, using fallback`);
            const fallbackRoutes = {
                'logout': '/logout',
                'login': '/login',
                'register': '/register',
                'owner-applications.create': '/apply-owner',
                'owner-applications.status': '/apply-owner/status',
                'profile.edit': '/profile',
                'dashboard': '/dashboard',
                'home': '/',
            };
            return fallbackRoutes[name] || '#';
        }
    };

    // Check if user is logged in
    const isLoggedIn = !!auth?.user;
    const user = auth?.user;
    const userName = user?.name || 'Guest';
    const userEmail = user?.email || '';
    const userAvatar = user?.avatar || null;
    
    // Get user role name safely - FIXED: handle both string and object
    const getUserRole = () => {
        if (!user?.role) return 'Member';
        // If role is an object with name property
        if (typeof user.role === 'object' && user.role.name) {
            return user.role.name;
        }
        // If role is a string
        if (typeof user.role === 'string') {
            return user.role;
        }
        return 'Member';
    };

    const userRole = getUserRole();

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!userName) return 'G';
        const names = userName.split(' ');
        if (names.length >= 2) {
            return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
        }
        return userName.charAt(0).toUpperCase();
    };

    // Handle logout with modal
    const handleLogoutClick = () => {
        setIsProfileDropdownOpen(false);
        setIsLogoutModalOpen(true);
    };

    // Confirm logout
    const confirmLogout = () => {
        setIsLogoutModalOpen(false);
        router.post(getRoute('logout'));
    };

    // Cancel logout
    const cancelLogout = () => {
        setIsLogoutModalOpen(false);
    };

    // Toggle profile dropdown
    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Dynamic Background */}
            <div className={`fixed inset-0 bg-gradient-to-br ${currentBg.gradient} opacity-90 -z-20`}></div>
            
            {/* Background Pattern Overlay */}
            <div className="fixed inset-0 opacity-10 -z-10">
                {currentBg.pattern === 'dots' && (
                    <div className="w-full h-full" style={{
                        backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}></div>
                )}
                {currentBg.pattern === 'grid' && (
                    <div className="w-full h-full" style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                                        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}></div>
                )}
                {currentBg.pattern === 'circles' && (
                    <div className="w-full h-full" style={{
                        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                                        radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
                                        radial-gradient(circle at 40% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
                        backgroundSize: '100% 100%'
                    }}></div>
                )}
                {currentBg.pattern === 'waves' && (
                    <div className="w-full h-full" style={{
                        backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 2px, 
                                        transparent 2px, transparent 8px)`,
                        backgroundSize: '20px 20px'
                    }}></div>
                )}
                {currentBg.pattern === 'squares' && (
                    <div className="w-full h-full" style={{
                        backgroundImage: `linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, 
                                        transparent 75%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1)),
                                        linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, 
                                        transparent 75%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1))`,
                        backgroundSize: '60px 60px',
                        backgroundPosition: '0 0, 30px 30px'
                    }}></div>
                )}
                {currentBg.pattern === 'triangles' && (
                    <div className="w-full h-full" style={{
                        backgroundImage: `polygon(0% 0%, 100% 0%, 50% 100%)`,
                        backgroundSize: '60px 60px'
                    }}></div>
                )}
            </div>

            {/* Floating Particles */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-5">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full animate-float"
                        style={{
                            width: Math.random() * 4 + 1 + 'px',
                            height: Math.random() * 4 + 1 + 'px',
                            background: `rgba(255,255,255,${Math.random() * 0.2 + 0.05})`,
                            left: Math.random() * 100 + '%',
                            top: Math.random() * 100 + '%',
                            animationDuration: Math.random() * 20 + 15 + 's',
                            animationDelay: Math.random() * 10 + 's',
                            opacity: Math.random() * 0.3 + 0.1
                        }}
                    ></div>
                ))}
            </div>

            {/* Glow Effects */}
            <div className="fixed inset-0 -z-15">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-3xl opacity-20"
                     style={{ background: currentBg.glowColor }}></div>
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
                     style={{ background: currentBg.glowColor }}></div>
            </div>

            {/* HEADER */}
            <header className={`sticky top-0 z-50 transition-all duration-300 ${
                scrolled 
                    ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl' 
                    : 'bg-black/40 backdrop-blur-lg border-b border-white/5'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
                    {/* Brand Logo */}
                    <Link href="/" className="flex items-center gap-2 md:gap-3 group">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-lg md:text-xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-amber-500/10">
                            🏋️‍♂️
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base md:text-xl font-extrabold tracking-tight text-white group-hover:text-amber-400 transition-colors duration-300">
                                GymFinder <span className="text-amber-500">Perak</span>
                            </span>
                            <span className="hidden sm:block text-[8px] md:text-[10px] text-white/50 uppercase tracking-widest font-semibold">
                                Local Fitness Directory
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-4">
                        {isLoggedIn ? (
                            <>
                                {/* Become Gym Owner Button - Only visible when logged in */}
                                <Link
                                    href={getRoute('owner-applications.create')}
                                    className="text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/50"
                                >
                                    🏪 Become Gym Owner
                                </Link>
                                
                                {/* Profile Dropdown */}
                                <div className="profile-dropdown-wrapper relative">
                                    <button
                                        onClick={toggleProfileDropdown}
                                        className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-3 py-2 rounded-xl transition-all duration-300 group"
                                    >
                                        {/* Avatar */}
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-amber-500/20">
                                            {userAvatar ? (
                                                <img src={userAvatar} alt={userName} className="w-full h-full rounded-lg object-cover" />
                                            ) : (
                                                getUserInitials()
                                            )}
                                        </div>
                                        
                                        {/* User Info - FIXED: using userRole variable */}
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
                                                {userName}
                                            </span>
                                            <span className="text-[10px] text-white/40">
                                                {userRole}
                                            </span>
                                        </div>
                                        
                                        {/* Chevron Icon */}
                                        <svg className={`w-4 h-4 text-white/40 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Profile Dropdown Menu */}
                                    {isProfileDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            {/* User Info Header */}
                                            <div className="px-4 py-4 border-b border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-amber-500/20">
                                                        {userAvatar ? (
                                                            <img src={userAvatar} alt={userName} className="w-full h-full rounded-xl object-cover" />
                                                        ) : (
                                                            getUserInitials()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{userName}</p>
                                                        <p className="text-xs text-white/40">{userEmail}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-2">
                                                <Link
                                                    href={getRoute('profile.edit')}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                                    onClick={() => setIsProfileDropdownOpen(false)}
                                                >
                                                    <span className="text-lg">👤</span>
                                                    <span>My Profile</span>
                                                </Link>
                                                <Link
                                                    href="/settings"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                                    onClick={() => setIsProfileDropdownOpen(false)}
                                                >
                                                    <span className="text-lg">⚙️</span>
                                                    <span>Settings</span>
                                                </Link>
                                                
                                                {/* Divider */}
                                                <div className="my-1 border-t border-white/5"></div>
                                                
                                                {/* Logout */}
                                                <button
                                                    onClick={handleLogoutClick}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full text-left"
                                                >
                                                    <span className="text-lg">🚪</span>
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href={getRoute('login')}
                                    className="text-sm font-semibold text-white/70 hover:text-white px-3 py-2 transition-all duration-300 hover:bg-white/5 rounded-xl"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href={getRoute('register')}
                                    className="text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-105 hover:shadow-amber-500/50"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                        aria-label="Toggle menu"
                    >
                        <div className="w-5 h-5 flex flex-col justify-center items-center gap-1.5">
                            <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${
                                isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                            }`}></span>
                            <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${
                                isMobileMenuOpen ? 'opacity-0' : ''
                            }`}></span>
                            <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${
                                isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                            }`}></span>
                        </div>
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                <div className={`md:hidden transition-all duration-300 overflow-hidden ${
                    isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                    <div className="px-4 py-4 border-t border-white/5 bg-black/60 backdrop-blur-xl">
                        <div className="flex flex-col gap-2">
                            {isLoggedIn ? (
                                <>
                                    {/* Become Gym Owner - Mobile */}
                                    <Link
                                        href={getRoute('owner-applications.create')}
                                        className="text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-3 rounded-xl text-center hover:scale-105 transition-all"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        🏪 Become Gym Owner
                                    </Link>
                                    
                                    {/* Mobile Profile Items */}
                                    <div className="border-t border-white/5 my-2 pt-2">
                                        <div className="flex items-center gap-3 px-4 py-2">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20">
                                                {userAvatar ? (
                                                    <img src={userAvatar} alt={userName} className="w-full h-full rounded-xl object-cover" />
                                                ) : (
                                                    getUserInitials()
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{userName}</p>
                                                <p className="text-xs text-white/40">{userEmail}</p>
                                            </div>
                                        </div>
                                        
                                        <Link
                                            href={getRoute('profile.edit')}
                                            className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <span>👤</span> My Profile
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <span>⚙️</span> Settings
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogoutClick();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all w-full text-left"
                                        >
                                            <span>🚪</span> Logout
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href={getRoute('login')}
                                        className="text-sm font-semibold text-white/80 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-all"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href={getRoute('register')}
                                        className="text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 rounded-xl text-center hover:scale-105 transition-all"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 relative z-10">{children}</main>

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
                            Are you sure you want to logout? You'll need to sign in again to access your account.
                        </p>

                        {/* User Info */}
                        <div className="bg-white/5 rounded-xl p-3 mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-amber-500/20">
                                {userAvatar ? (
                                    <img src={userAvatar} alt={userName} className="w-full h-full rounded-xl object-cover" />
                                ) : (
                                    getUserInitials()
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{userName}</p>
                                <p className="text-xs text-slate-400">{userEmail}</p>
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

            {/* FOOTER */}
            <footer className="bg-black/40 backdrop-blur-lg border-t border-white/5 py-8 md:py-12 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <div className="flex items-center gap-2 justify-center md:justify-start">
                                <span className="text-lg font-bold text-amber-500">GymFinder Perak</span>
                                <span className="px-2 py-0.5 text-[8px] font-bold bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 uppercase tracking-wider">
                                    Beta
                                </span>
                            </div>
                            <p className="text-xs text-white/40 mt-1 max-w-md">
                                Discovering iron paradises across Ipoh, Taiping, Teluk Intan, and Manjung.
                            </p>
                        </div>
                        
                        <div className="flex flex-col items-center md:items-end gap-2">
                            <div className="flex gap-4">
                                <a href="#" className="text-white/30 hover:text-amber-400 transition-colors text-xs">
                                    About
                                </a>
                                <a href="#" className="text-white/30 hover:text-amber-400 transition-colors text-xs">
                                    Contact
                                </a>
                                <a href="#" className="text-white/30 hover:text-amber-400 transition-colors text-xs">
                                    Privacy
                                </a>
                            </div>
                            <div className="text-[10px] text-white/20">
                                © {new Date().getFullYear()} GymFinder MY. All rights reserved.
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}