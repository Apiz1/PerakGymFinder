import React, { useState, useEffect, useMemo } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';

export default function MainLayout({ children }) {
    const { auth } = usePage().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

    const currentBg = backgrounds[backgroundIndex] || backgrounds[0];

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
                        {auth?.user ? (
                            <>
                                <button
                                    onClick={() => router.post(route('logout'))}
                                    className="text-sm font-semibold text-white/70 hover:text-red-400 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-white/5"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="text-sm font-semibold text-white/70 hover:text-white px-3 py-2 transition-all duration-300 hover:bg-white/5 rounded-xl"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href={route('register')}
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
                            {auth?.user ? (
                                <>
                                    <Link
                                        href={route('dashboard')}
                                        className="text-sm font-semibold text-white/80 hover:text-amber-400 px-4 py-3 rounded-xl hover:bg-white/5 transition-all"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={() => {
                                            router.post(route('logout'));
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="text-sm font-semibold text-white/80 hover:text-red-400 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-left"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-semibold text-white/80 hover:text-white px-4 py-3 rounded-xl hover:bg-white/5 transition-all"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        href={route('register')}
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