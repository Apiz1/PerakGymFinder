import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import Turnstile from '@/Components/Turnstile';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({ name: '', email: '', phone: '', password: '', password_confirmation: '', turnstile_token: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [passwordStrengthText, setPasswordStrengthText] = useState('');
    const [turnstileVerified, setTurnstileVerified] = useState(false);

    const checkPasswordStrength = (password) => {
        if (!password.length) { setPasswordStrength(0); setPasswordStrengthText(''); return; }
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
        setPasswordStrength(strength);
        setPasswordStrengthText(strength <= 2 ? 'Weak' : strength <= 4 ? 'Fair' : strength <= 5 ? 'Good' : 'Strong');
    };
    const changePassword = (event) => { setData('password', event.target.value); checkPasswordStrength(event.target.value); };
    const submit = (event) => {
        event.preventDefault();
        if (!turnstileVerified) { alert('Please complete the security verification.'); return; }
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };
    const strengthStyle = passwordStrength <= 2 ? 'bg-red-600' : passwordStrength <= 4 ? 'bg-amber-500' : passwordStrength <= 5 ? 'bg-sky-600' : 'bg-emerald-600';

    return (
        <>
            <Head title="Create account" />
            <style>{`.field-input{display:block;width:100%;border-radius:.75rem;border-color:#d6d3d1;padding:.75rem .75rem .75rem 2.5rem;font-size:.875rem;color:#1c1917}.field-input::placeholder{color:#a8a29e}.field-input:focus{border-color:#0c0a09;--tw-ring-color:#0c0a09}.field-icon{pointer-events:none;position:absolute;left:.75rem;top:50%;height:1.25rem;width:1.25rem;transform:translateY(-50%);color:#a8a29e}`}</style>
            <main className="min-h-screen bg-[#f7f7f5] p-4 sm:p-6">
                <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_24px_70px_rgba(28,25,23,0.10)] lg:grid-cols-[.9fr_1.1fr] sm:min-h-[calc(100vh-3rem)]">
                    <aside className="relative hidden overflow-hidden bg-stone-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.14) 1px, transparent 1px)', backgroundSize: '42px 42px' }} />
                        <Link href="/" className="relative inline-flex items-center gap-3" aria-label="GymFinder Perak home"><span className="grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-black tracking-tighter text-stone-950">GF</span><span><span className="block text-base font-bold tracking-[-0.03em]">GymFinder</span><span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-stone-400">Perak</span></span></Link>
                        <div className="relative max-w-sm"><p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-400">Start here</p><h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-[-0.05em]">A local guide for every kind of training.</h1><p className="mt-5 max-w-xs text-sm leading-6 text-stone-300">Keep track of gyms you love, get practical details, and build your fitness routine around Perak.</p></div>
                        <p className="relative text-xs text-stone-500">Local fitness directory · Perak, Malaysia</p>
                    </aside>

                    <section className="flex min-w-0 flex-col px-6 py-7 sm:px-12 sm:py-10 lg:px-16">
                        <div className="flex items-center justify-between lg:hidden"><Link href="/" className="inline-flex items-center gap-2" aria-label="GymFinder Perak home"><span className="grid h-9 w-9 place-items-center rounded-full bg-stone-950 text-xs font-black text-white">GF</span><span className="text-sm font-bold">GymFinder</span></Link></div>
                        <Link href="/" className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-stone-950 lg:mt-0"><ArrowLeft />Back to directory</Link>
                        <div className="mx-auto my-auto w-full max-w-md py-10">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-400">New member</p>
                            <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] text-stone-950">Create your account</h2>
                            <p className="mt-2 text-sm leading-6 text-stone-500">A few details and you’re ready to explore.</p>
                            <form onSubmit={submit} className="mt-8 space-y-5">
                                <Field label="Full name" id="name" icon={<UserIcon />}><TextInput id="name" name="name" value={data.name} className="field-input" placeholder="Your full name" autoComplete="name" isFocused={true} onChange={(event) => setData('name', event.target.value)} required /></Field><InputError message={errors.name} className="-mt-3 text-xs text-red-700" />
                                <Field label="Email address" id="email" icon={<MailIcon />}><TextInput id="email" type="email" name="email" value={data.email} className="field-input" placeholder="you@example.com" autoComplete="username" onChange={(event) => setData('email', event.target.value)} required /></Field><InputError message={errors.email} className="-mt-3 text-xs text-red-700" />
                                <Field label="Phone number" id="phone" icon={<PhoneIcon />}><TextInput id="phone" type="tel" name="phone" value={data.phone} className="field-input" placeholder="+60 12-345 6789" autoComplete="tel" onChange={(event) => setData('phone', event.target.value)} /></Field><p className="-mt-3 text-xs text-stone-400">Optional — used only for important account notifications.</p><InputError message={errors.phone} className="-mt-3 text-xs text-red-700" />
                                <PasswordField label="Password" id="password" value={data.password} visible={showPassword} onToggle={() => setShowPassword(!showPassword)} onChange={changePassword} />
                                {data.password.length > 0 && <div className="-mt-3"><div className="flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200"><div className={`h-full rounded-full transition-all ${strengthStyle}`} style={{ width: `${(passwordStrength / 7) * 100}%` }} /></div><span className="w-10 text-right text-xs font-semibold text-stone-600">{passwordStrengthText}</span></div><p className="mt-1.5 text-xs text-stone-400">{passwordStrength <= 2 ? 'Add uppercase, numbers, or symbols for a stronger password.' : passwordStrength === 3 ? 'Good start. More variety makes a safer password.' : 'Looking good.'}</p></div>}
                                <InputError message={errors.password} className="-mt-3 text-xs text-red-700" />
                                <PasswordField label="Confirm password" id="password_confirmation" value={data.password_confirmation} visible={showConfirmation} onToggle={() => setShowConfirmation(!showConfirmation)} onChange={(event) => setData('password_confirmation', event.target.value)} />
                                <InputError message={errors.password_confirmation} className="-mt-3 text-xs text-red-700" />
                                <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-4"><p className="mb-3 text-center text-xs font-medium text-stone-500">Security verification</p><div className="flex justify-center"><Turnstile onVerify={(token) => { setData('turnstile_token', token || ''); setTurnstileVerified(Boolean(token)); }} /></div></div>
                                {errors.turnstile_token && <p className="text-center text-xs font-medium text-red-700">{errors.turnstile_token}</p>}
                                <label className="flex cursor-pointer items-start gap-2.5"><input type="checkbox" id="terms" required className="mt-0.5 h-4 w-4 rounded border-stone-300 text-stone-950 focus:ring-stone-950" /><span className="text-xs leading-5 text-stone-500">I agree to the <a href="#" className="font-semibold text-stone-800 underline underline-offset-2 hover:text-stone-950">Terms of Service</a> and <a href="#" className="font-semibold text-stone-800 underline underline-offset-2 hover:text-stone-950">Privacy Policy</a>.</span></label>
                                <PrimaryButton className="flex w-full justify-center rounded-xl bg-stone-950 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 focus:bg-stone-700 active:bg-stone-950 disabled:opacity-50" disabled={processing || !turnstileVerified}>{processing ? <span className="flex items-center gap-2"><Spinner />Creating account…</span> : 'Create account'}</PrimaryButton>
                            </form>
                            <div className="relative my-8"><div className="border-t border-stone-200" /><span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-stone-400">Or sign up with</span></div>
                            <div className="grid grid-cols-2 gap-3"><button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-950"><GoogleIcon />Google</button><button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-950"><GitHubIcon />GitHub</button></div>
                            <p className="mt-7 text-center text-sm text-stone-500">Already have an account? <Link href={route('login')} className="font-semibold text-stone-950 underline decoration-stone-300 underline-offset-4 hover:decoration-stone-950">Sign in</Link></p>
                        </div>
                        <p className="text-center text-xs text-stone-400 lg:text-left">© {new Date().getFullYear()} GymFinder Perak</p>
                    </section>
                </div>
            </main>
        </>
    );
}

function Field({ label, id, icon, children }) { return <div><InputLabel htmlFor={id} value={label} className="text-sm font-semibold text-stone-700" /><div className="relative mt-2">{icon}{children}</div></div>; }
function PasswordField({ label, id, value, visible, onToggle, onChange }) { return <div><InputLabel htmlFor={id} value={label} className="text-sm font-semibold text-stone-700" /><div className="relative mt-2"><LockIcon /><TextInput id={id} type={visible ? 'text' : 'password'} name={id} value={value} className="field-input pr-12" placeholder="Enter a password" autoComplete="new-password" onChange={onChange} required /><button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 hover:text-stone-950" aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOffIcon /> : <EyeIcon />}</button></div></div>; }
function ArrowLeft() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m11 5-7 7 7 7m-7-7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function UserIcon() { return <svg className="field-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" /><path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>; }
function MailIcon() { return <svg className="field-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>; }
function PhoneIcon() { return <svg className="field-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3h2.1l1.2 4-1.7 1.7a14.5 14.5 0 0 0 6.7 6.7l1.7-1.7 4 1.2V17c0 2.2-1.8 4-4 4C9.3 21 3 14.7 3 7c0-2.2 1.8-4 4-4Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function LockIcon() { return <svg className="field-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.7" /><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>; }
function EyeIcon() { return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.7" /></svg>; }
function EyeOffIcon() { return <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 3 21 21M10.7 5.7A10 10 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3.2 3.8M6.2 6.2A17.6 17.6 0 0 0 2.5 12s3.5 6.5 9.5 6.5a10 10 0 0 0 3.5-.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><path d="M9.8 9.8a3.1 3.1 0 0 0 4.4 4.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>; }
function Spinner() { return <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity=".25" /><path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>; }
function GoogleIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.5h3.2c1.9-1.8 3.1-4.4 3.1-7.4Z" /><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2 1-3.5 1-2.7 0-5-1.8-5.9-4.3H2.8A10 10 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.1 13.8A6 6 0 0 1 5.8 12c0-.6.1-1.2.3-1.8V7.6H2.8A10 10 0 0 0 2 12c0 1.6.4 3.1.8 4.4l3.3-2.6Z" /><path fill="#EA4335" d="M12 5.9c1.6 0 3.1.6 4.2 1.6l3.1-3.1A10 10 0 0 0 2.8 7.6l3.3 2.6c.9-2.5 3.2-4.3 5.9-4.3Z" /></svg>; }
function GitHubIcon() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1 .6-1.3-2.2-.3-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.7 9.7 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.5 4.9.4.3.7.9.7 1.8V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" /></svg>; }
