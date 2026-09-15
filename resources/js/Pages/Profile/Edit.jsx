import MainLayout from '@/Layouts/MainLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { key: 'profile', label: 'Profile Information', icon: '👤' },
        { key: 'password', label: 'Password', icon: '🔒' },
        { key: 'danger', label: 'Danger Zone', icon: '⚠️' },
    ];

    const getUserInitials = () => {
        const name = auth?.user?.name || 'User';
        const names = name.split(' ');
        if (names.length >= 2) {
            return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
        }
        return name.charAt(0).toUpperCase();
    };

    return (
        <MainLayout>
            <Head title="Profile" />

            {/* Page Header */}
            <section className="border-b border-stone-200 bg-[#eeece7]">
                <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-12">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">
                        Account
                    </p>
                    <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-stone-950 sm:text-4xl">
                        Profile settings
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
                        Manage your account information, security preferences, and personal details.
                    </p>
                </div>
            </section>

            <div className="bg-[#f7f7f5] py-10">
                <div className="mx-auto max-w-5xl px-5 sm:px-8">
                    {/* Profile Header Card */}
                    <div className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 sm:p-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-stone-950 text-xl font-bold text-white shadow-[0_8px_24px_rgba(28,25,23,0.15)]">
                                {getUserInitials()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-xl font-bold tracking-[-0.025em] text-stone-950">
                                        {auth?.user?.name || 'User'}
                                    </h2>
                                    {auth?.user?.email_verified_at && (
                                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                                                <path d="M10.28 2.28a.75.75 0 0 0-1.06 0L5 6.5 2.78 4.28a.75.75 0 0 0-1.06 1.06l2.75 2.75a.75.75 0 0 0 1.06 0l4.75-4.75a.75.75 0 0 0 0-1.06Z" />
                                            </svg>
                                            Verified
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 truncate text-sm text-stone-500">
                                    {auth?.user?.email || 'No email'}
                                </p>
                                <p className="mt-0.5 text-xs text-stone-400">
                                    Member since {new Date().toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                            <Link
                                href="/"
                                className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 transition hover:border-stone-950 hover:text-stone-950"
                            >
                                Back to home
                            </Link>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="mb-6 flex gap-2 overflow-x-auto border-b border-stone-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                                    activeTab === tab.key
                                        ? 'border-stone-950 text-stone-950'
                                        : 'border-transparent text-stone-500 hover:text-stone-950'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-6">
                        {activeTab === 'profile' && (
                            <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8">
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold tracking-[-0.025em] text-stone-950">
                                        Profile information
                                    </h3>
                                    <p className="mt-1 text-sm text-stone-500">
                                        Update your account's profile information and email address.
                                    </p>
                                </div>
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                    className="max-w-xl"
                                />
                            </div>
                        )}

                        {activeTab === 'password' && (
                            <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8">
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold tracking-[-0.025em] text-stone-950">
                                        Update password
                                    </h3>
                                    <p className="mt-1 text-sm text-stone-500">
                                        Ensure your account is using a long, random password to stay secure.
                                    </p>
                                </div>
                                <UpdatePasswordForm className="max-w-xl" />
                            </div>
                        )}

                        {activeTab === 'danger' && (
                            <div className="rounded-2xl border border-red-200 bg-white p-6 sm:p-8">
                                <div className="mb-6">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">⚠️</span>
                                        <h3 className="text-lg font-bold tracking-[-0.025em] text-red-900">
                                            Delete account
                                        </h3>
                                    </div>
                                    <p className="mt-1 text-sm text-stone-500">
                                        Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain.
                                    </p>
                                </div>
                                <DeleteUserForm className="max-w-xl" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}