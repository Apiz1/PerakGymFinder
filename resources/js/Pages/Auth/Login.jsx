import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Turnstile from '@/Components/Turnstile';
import { Head, Link, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '', password: '', remember: false, turnstile_token: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [turnstileVerified, setTurnstileVerified] = useState(false);
    const [turnstileError, setTurnstileError] = useState(false);
    const turnstileRef = useRef(null);

    const resetTurnstile = () => {
        setTurnstileVerified(false);
        setData('turnstile_token', '');
        setTurnstileError(false);
        if (window.turnstile && turnstileRef.current) window.turnstile.reset(turnstileRef.current);
    };

    const submit = (event) => {
        event.preventDefault();
        if (!turnstileVerified) {
            setTurnstileError(true);
            alert('Please complete the security verification.');
            return;
        }
        post(route('login'), {
            onError: (formErrors) => {
                resetTurnstile();
                if (formErrors.email || formErrors.password) setTurnstileError(false);
            },
            onFinish: () => {
                reset('password');
                if (Object.keys(errors).length > 0) resetTurnstile();
            },
        });
    };

    const verifyTurnstile = (token) => {
        setData('turnstile_token', token || '');
        setTurnstileVerified(Boolean(token));
        setTurnstileError(!token);
    };

    const expireTurnstile = () => {
        setTurnstileVerified(false);
        setData('turnstile_token', '');
        if (window.turnstile && turnstileRef.current) window.turnstile.reset(turnstileRef.current);
    };

    return (
        <>
            <Head title="Log in" />
            <main className="min-h-screen bg-[#f7f7f5] p-4 sm:p-6">
                <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_24px_70px_rgba(28,25,23,0.10)] lg:grid-cols-[.9fr_1.1fr] sm:min-h-[calc(100vh-3rem)]">
                    <aside className="relative hidden overflow-hidden bg-stone-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.14) 1px, transparent 1px)', backgroundSize: '42px 42px' }} />
                        <div className="relative">
                            <Link href="/" className="inline-flex items-center gap-3" aria-label="GymFinder Perak home">
                                <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-black tracking-tighter text-stone-950">GF</span>
                                <span><span className="block text-base font-bold tracking-[-0.03em]">GymFinder</span><span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-stone-400">Perak</span></span>
                            </Link>
                        </div>
                        <div className="relative max-w-sm">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-400">Your local training guide</p>
                            <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-[-0.05em]">Find a place that keeps you moving.</h1>
                            <p className="mt-5 max-w-xs text-sm leading-6 text-stone-300">Save your favourite gyms, manage listings, and stay connected to Perak’s fitness community.</p>
                        </div>
                        <p className="relative text-xs text-stone-500">Local fitness directory · Perak, Malaysia</p>
                    </aside>

                    <section className="flex min-w-0 flex-col px-6 py-7 sm:px-12 sm:py-10 lg:px-16">
                        <div className="flex items-center justify-between lg:hidden">
                            <Link href="/" className="inline-flex items-center gap-2" aria-label="GymFinder Perak home"><span className="grid h-9 w-9 place-items-center rounded-full bg-stone-950 text-xs font-black text-white">GF</span><span className="text-sm font-bold">GymFinder</span></Link>
                        </div>
                        <Link href="/" className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-stone-950 lg:mt-0"><ArrowLeft />Back to directory</Link>
                        <div className="mx-auto my-auto w-full max-w-md py-12">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-400">Member access</p>
                            <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] text-stone-950">Welcome back</h2>
                            <p className="mt-2 text-sm leading-6 text-stone-500">Sign in to continue to your account.</p>

                            {status && <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{status}</div>}

                            <form onSubmit={submit} className="mt-8 space-y-5">
                                <div>
                                    <InputLabel htmlFor="email" value="Email address" className="text-sm font-semibold text-stone-700" />
                                    <div className="relative mt-2"><MailIcon /><TextInput id="email" type="email" name="email" value={data.email} className="block w-full rounded-xl border-stone-300 py-3 pl-10 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-950 focus:ring-stone-950" placeholder="you@example.com" autoComplete="username" isFocused={true} onChange={(event) => setData('email', event.target.value)} /></div>
                                    <InputError message={errors.email} className="mt-2 text-xs text-red-700" />
                                </div>
                                <div>
                                    <div className="flex items-baseline justify-between gap-4"><InputLabel htmlFor="password" value="Password" className="text-sm font-semibold text-stone-700" />{canResetPassword && <Link href={route('password.request')} className="text-xs font-semibold text-stone-600 hover:text-stone-950 hover:underline">Forgot password?</Link>}</div>
                                    <div className="relative mt-2"><LockIcon /><TextInput id="password" type={showPassword ? 'text' : 'password'} name="password" value={data.password} className="block w-full rounded-xl border-stone-300 py-3 pl-10 pr-12 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-950 focus:ring-stone-950" placeholder="Enter your password" autoComplete="current-password" onChange={(event) => setData('password', event.target.value)} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 hover:text-stone-950" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOffIcon /> : <EyeIcon />}</button></div>
                                    <InputError message={errors.password} className="mt-2 text-xs text-red-700" />
                                </div>
                                <label className="flex w-fit cursor-pointer items-center gap-2.5"><Checkbox name="remember" checked={data.remember} onChange={(event) => setData('remember', event.target.checked)} className="rounded border-stone-300 text-stone-950 focus:ring-stone-950" /><span className="text-sm text-stone-600">Keep me signed in</span></label>
                                <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-4"><p className="mb-3 text-center text-xs font-medium text-stone-500">Security verification</p><div className="flex justify-center"><Turnstile ref={turnstileRef} onVerify={verifyTurnstile} onError={() => verifyTurnstile('')} onExpired={expireTurnstile} /></div></div>
                                {turnstileError && <p className="text-center text-xs font-medium text-red-700">Please complete the security verification.</p>}
                                {errors.turnstile_token && <p className="text-center text-xs font-medium text-red-700">{errors.turnstile_token}</p>}
                                <PrimaryButton className="flex w-full justify-center rounded-xl bg-stone-950 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 focus:bg-stone-700 active:bg-stone-950 disabled:opacity-50" disabled={processing || !turnstileVerified}>{processing ? <span className="flex items-center gap-2"><Spinner />Signing in…</span> : 'Sign in'}</PrimaryButton>
                            </form>

                            <div className="relative my-8"><div className="border-t border-stone-200" /><span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-stone-400">Or continue with</span></div>
                            <div className="grid grid-cols-2 gap-3"><button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-950"><GoogleIcon />Google</button><button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-950"><GitHubIcon />GitHub</button></div>
                            <p className="mt-7 text-center text-sm text-stone-500">New to GymFinder? <Link href={route('register')} className="font-semibold text-stone-950 underline decoration-stone-300 underline-offset-4 hover:decoration-stone-950">Create an account</Link></p>
                        </div>
                        <p className="text-center text-xs text-stone-400 lg:text-left">© {new Date().getFullYear()} GymFinder Perak</p>
                    </section>
                </div>
            </main>
        </>
    );
}

function ArrowLeft() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m11 5-7 7 7 7m-7-7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function MailIcon() { return <svg className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>; }
function LockIcon() { return <svg className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>; }
function EyeIcon() { return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.7" /></svg>; }
function EyeOffIcon() { return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 3 21 21M10.7 5.7A10 10 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3.2 3.8M6.2 6.2A17.6 17.6 0 0 0 2.5 12s3.5 6.5 9.5 6.5a10 10 0 0 0 3.5-.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><path d="M9.8 9.8a3.1 3.1 0 0 0 4.4 4.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>; }
function Spinner() { return <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity=".25" /><path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>; }
function GoogleIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.5h3.2c1.9-1.8 3.1-4.4 3.1-7.4Z" /><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2 1-3.5 1-2.7 0-5-1.8-5.9-4.3H2.8v2.6A10 10 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.1 13.8A6 6 0 0 1 5.8 12c0-.6.1-1.2.3-1.8V7.6H2.8A10 10 0 0 0 2 12c0 1.6.4 3.1.8 4.4l3.3-2.6Z" /><path fill="#EA4335" d="M12 5.9c1.6 0 3.1.6 4.2 1.6l3.1-3.1A10 10 0 0 0 2.8 7.6l3.3 2.6c.9-2.5 3.2-4.3 5.9-4.3Z" /></svg>; }
function GitHubIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1 .6-1.3-2.2-.3-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.7 9.7 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.5 4.9.4.3.7.9.7 1.8V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" /></svg>; }
