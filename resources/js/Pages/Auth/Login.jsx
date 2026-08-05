import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [backgroundIndex, setBackgroundIndex] = useState(0);

    // Random background configurations
    const backgrounds = useMemo(() => [
        {
            gradient: 'from-blue-900 via-purple-900 to-pink-900',
            pattern: 'dots',
            glowColor: 'rgba(139, 92, 246, 0.2)'
        },
        {
            gradient: 'from-emerald-900 via-teal-900 to-cyan-900',
            pattern: 'grid',
            glowColor: 'rgba(16, 185, 129, 0.2)'
        },
        {
            gradient: 'from-amber-900 via-orange-900 to-red-900',
            pattern: 'circles',
            glowColor: 'rgba(245, 158, 11, 0.2)'
        },
        {
            gradient: 'from-indigo-900 via-blue-900 to-cyan-900',
            pattern: 'waves',
            glowColor: 'rgba(99, 102, 241, 0.2)'
        },
        {
            gradient: 'from-rose-900 via-pink-900 to-fuchsia-900',
            pattern: 'squares',
            glowColor: 'rgba(244, 63, 94, 0.2)'
        },
        {
            gradient: 'from-violet-900 via-purple-900 to-indigo-900',
            pattern: 'triangles',
            glowColor: 'rgba(139, 92, 246, 0.2)'
        }
    ], []);

    // Select random background on mount
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * backgrounds.length);
        setBackgroundIndex(randomIndex);
    }, []);

    const currentBg = backgrounds[backgroundIndex] || backgrounds[0];

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
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
                {[...Array(20)].map((_, i) => (
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

            {/* Back to Home Link */}
            <div className="relative z-10 p-4">
                <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-all duration-300 group"
                >
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="text-sm font-medium">Back to Home</span>
                </Link>
            </div>

            {/* Login Content */}
            <div className="flex-1 flex items-center justify-center p-4 relative z-10">
                <div className="w-full max-w-md">
                    {/* Brand Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-500/20 border border-amber-500/30 shadow-lg shadow-amber-500/10 mb-4">
                            <span className="text-4xl">🏋️‍♂️</span>
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-white/50 text-sm mt-2">
                            Sign in to continue your fitness journey
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="glass-card rounded-2xl p-8 backdrop-blur-xl bg-white/5 border-white/10">
                        {status && (
                            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium text-center">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <InputLabel 
                                    htmlFor="email" 
                                    value="Email Address" 
                                    className="text-white/70 text-xs font-semibold uppercase tracking-wider"
                                />
                                <div className="mt-1 relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="block w-full pl-10 pr-3 py-3 bg-white/5 border-white/10 text-white placeholder-white/30 rounded-xl focus:border-amber-500 focus:ring-amber-500/20 transition-all"
                                        placeholder="you@example.com"
                                        autoComplete="username"
                                        isFocused={true}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-2 text-rose-400 text-xs" />
                            </div>

                            {/* Password Field */}
                            <div>
                                <div className="flex items-center justify-between">
                                    <InputLabel 
                                        htmlFor="password" 
                                        value="Password" 
                                        className="text-white/70 text-xs font-semibold uppercase tracking-wider"
                                    />
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-xs text-white/40 hover:text-amber-400 transition-colors"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                                <div className="mt-1 relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <TextInput
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        className="block w-full pl-10 pr-12 py-3 bg-white/5 border-white/10 text-white placeholder-white/30 rounded-xl focus:border-amber-500 focus:ring-amber-500/20 transition-all"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-2 text-rose-400 text-xs" />
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500/20"
                                />
                                <span className="ms-2 text-sm text-white/60">
                                    Remember me
                                </span>
                            </div>

                            {/* Submit Button */}
                            <PrimaryButton 
                                className="w-full justify-center py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={processing}
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    'Sign In'
                                )}
                            </PrimaryButton>

                            {/* Register Link */}
                            <div className="text-center">
                                <p className="text-sm text-white/40">
                                    Don't have an account?{' '}
                                    <Link 
                                        href={route('register')} 
                                        className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                                    >
                                        Create one now
                                    </Link>
                                </p>
                            </div>
                        </form>

                        {/* Social Login Divider */}
                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-4 bg-transparent text-white/30">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all duration-300 text-sm font-medium">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    Google
                                </button>
                                <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all duration-300 text-sm font-medium">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.03-2.682-.103-.253-.447-1.27.098-2.646 0 0 .84-.269 2.75 1.025.8-.223 1.65-.334 2.5-.334.85 0 1.7.111 2.5.334 1.91-1.294 2.75-1.025 2.75-1.025.545 1.376.201 2.393.099 2.646.64.698 1.03 1.591 1.03 2.682 0 3.841-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                                    </svg>
                                    GitHub
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Demo Credentials */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-white/30">
                            Demo: demo@example.com / password
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}