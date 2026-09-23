import React, { useEffect, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';

function Mark() {
    return (
        <span className="grid h-9 w-9 place-items-center rounded-full bg-stone-950 text-sm font-black tracking-tighter text-stone-50">
            GF
        </span>
    );
}

function Avatar({ name, src, large = false }) {
    const initials = name
        ? name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase()
        : 'G';

    return (
        <span className={`${large ? 'h-11 w-11 text-sm' : 'h-8 w-8 text-[11px]'} inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-stone-200 font-bold text-stone-700`}>
            {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : initials}
        </span>
    );
}

function Chevron({ open = false }) {
    return (
        <svg className={`h-4 w-4 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="m5.5 7.5 4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function MainLayout({ children }) {
    const { auth } = usePage().props;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const user = auth?.user;
    const isLoggedIn = Boolean(user);
    const userName = user?.name || 'Guest';
    const userEmail = user?.email || '';
    const userAvatar = user?.avatar || null;
    const userRole = typeof user?.role === 'object' ? user.role?.name : user?.role || 'Member';

    const getRoute = (name, params = {}) => {
        try {
            return route(name, params);
        } catch {
            return {
                logout: '/logout', login: '/login', register: '/register',
                'owner-applications.create': '/apply-owner', profile: '/profile',
                'favorites.index': '/favorites',
            }[name] || '#'; 
        }
    };

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const onClick = (event) => {
            if (profileOpen && !event.target.closest('.profile-menu')) setProfileOpen(false);
        };
        document.addEventListener('click', onClick);
        return () => document.removeEventListener('click', onClick);
    }, [profileOpen]);

    useEffect(() => {
        document.body.style.overflow = logoutOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [logoutOpen]);

    const openLogout = () => {
        setProfileOpen(false);
        setMobileOpen(false);
        setLogoutOpen(true);
    };

    const NavLinks = ({ mobile = false }) => isLoggedIn ? (
        <>
            <Link
                href={getRoute('owner-applications.create')}
                onClick={() => setMobileOpen(false)}
                className={mobile ? 'rounded-xl px-3 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-200' : 'inline-flex items-center rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-stone-950 hover:bg-stone-950 hover:text-white'}
            >
                List your gym
            </Link>
            {mobile && (
                <>
                    <div className="my-2 border-t border-stone-200" />
                    <div className="flex items-center gap-3 px-3 py-2">
                        <Avatar name={userName} src={userAvatar} large />
                        <div className="min-w-0"><p className="truncate text-sm font-semibold text-stone-950">{userName}</p><p className="truncate text-xs text-stone-500">{userEmail}</p></div>
                    </div>
                    <Link href={getRoute('profile')} onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-200">My profile</Link>
                    <Link href={getRoute('favorites.index')} onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-200">My favorites</Link>
                    <Link href="/settings" onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-200">Settings</Link>
                    <button onClick={openLogout} className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-700 transition hover:bg-red-50">Sign out</button>
                </>
            )}
        </>
    ) : (
        <>
            <Link href={getRoute('login')} onClick={() => setMobileOpen(false)} className={mobile ? 'rounded-xl px-3 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-200' : 'text-sm font-medium text-stone-600 transition hover:text-stone-950'}>Log in</Link>
            <Link href={getRoute('register')} onClick={() => setMobileOpen(false)} className={mobile ? 'rounded-xl bg-stone-950 px-3 py-3 text-sm font-semibold text-white transition hover:bg-stone-800' : 'rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-700'}>Create account</Link>
        </>
    );

    return (
        <div className="min-h-screen bg-[#f7f7f5] text-stone-950">
            <header className={`sticky top-0 z-40 border-b transition-all ${scrolled ? 'border-stone-200/90 bg-[#f7f7f5]/95 shadow-[0_1px_12px_rgba(28,25,23,0.05)] backdrop-blur' : 'border-transparent bg-[#f7f7f5]'}`}>
                <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
                    <Link href="/" className="group flex items-center gap-3" aria-label="GymFinder Perak home">
                        <Mark />
                        <span className="leading-tight"><span className="block text-[15px] font-bold tracking-[-0.03em]">GymFinder</span><span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-stone-500">Perak</span></span>
                    </Link>

                    <nav className="hidden items-center gap-3 md:flex">
                        <NavLinks />
                        {isLoggedIn && (
                            <div className="profile-menu relative ml-1">
                                <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 rounded-full p-1 pr-2 transition hover:bg-stone-200" aria-expanded={profileOpen} aria-label="Open account menu">
                                    <Avatar name={userName} src={userAvatar} />
                                    <Chevron open={profileOpen} />
                                </button>
                                {profileOpen && (
                                    <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-stone-200 bg-white p-2 shadow-[0_18px_45px_rgba(28,25,23,0.14)]">
                                        <div className="flex items-center gap-3 px-3 py-3"><Avatar name={userName} src={userAvatar} large /><div className="min-w-0"><p className="truncate text-sm font-semibold">{userName}</p><p className="truncate text-xs text-stone-500">{userEmail}</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400">{userRole}</p></div></div>
                                        <div className="my-1 border-t border-stone-100" />
                                        <Link href={getRoute('profile')} onClick={() => setProfileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100">My profile</Link>
                                        <Link href={getRoute('favorites.index')} onClick={() => setProfileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100">My favorites</Link>
                                        <Link href="/settings" onClick={() => setProfileOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100">Settings</Link>
                                        <div className="my-1 border-t border-stone-100" />
                                        <button onClick={openLogout} className="block w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-700 transition hover:bg-red-50">Sign out</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>

                    <button onClick={() => setMobileOpen(!mobileOpen)} className="grid h-10 w-10 place-items-center rounded-full border border-stone-300 md:hidden" aria-label="Toggle menu" aria-expanded={mobileOpen}>
                        <span className="sr-only">Menu</span>
                        <span className="space-y-1.5"><span className={`block h-px w-4 bg-stone-900 transition ${mobileOpen ? 'translate-y-[3.5px] rotate-45' : ''}`} /><span className={`block h-px w-4 bg-stone-900 transition ${mobileOpen ? 'opacity-0' : ''}`} /><span className={`block h-px w-4 bg-stone-900 transition ${mobileOpen ? '-translate-y-[3.5px] -rotate-45' : ''}`} /></span>
                    </button>
                </div>
                {mobileOpen && <div className="border-t border-stone-200 bg-[#f7f7f5] px-5 pb-5 pt-3 md:hidden"><nav className="flex flex-col gap-1"><NavLinks mobile /></nav></div>}
            </header>

            <main className="min-h-[calc(100vh-72px)]">{children}</main>

            <footer className="border-t border-stone-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3"><Mark /><p className="text-sm text-stone-500">Find the right place to train in Perak.</p></div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-stone-500"><a href="#" className="hover:text-stone-950">About</a><a href="#" className="hover:text-stone-950">Contact</a><a href="#" className="hover:text-stone-950">Privacy</a><span className="text-stone-400">© {new Date().getFullYear()} GymFinder</span></div>
                </div>
            </footer>

            {logoutOpen && (
                <div className="fixed inset-0 z-50 grid place-items-center p-5" role="dialog" aria-modal="true" aria-labelledby="logout-title">
                    <button className="absolute inset-0 cursor-default bg-stone-950/30 backdrop-blur-sm" onClick={() => setLogoutOpen(false)} aria-label="Close dialog" />
                    <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_24px_70px_rgba(28,25,23,0.22)]">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">Account</p>
                        <h2 id="logout-title" className="mt-2 text-xl font-bold tracking-[-0.03em]">Sign out?</h2>
                        <p className="mt-2 text-sm leading-6 text-stone-500">You will need to log in again to manage your account.</p>
                        <div className="mt-6 flex gap-3"><button onClick={() => setLogoutOpen(false)} className="flex-1 rounded-full border border-stone-300 px-4 py-2.5 text-sm font-semibold transition hover:bg-stone-100">Cancel</button><button onClick={() => { setLogoutOpen(false); router.post(getRoute('logout')); }} className="flex-1 rounded-full bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700">Sign out</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}