import React, { useState } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Show({ user }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });
    const [errors, setErrors] = useState({});

    // Safe route helper
    const safeRoute = (name, params = {}) => {
        try {
            return route(name, params);
        } catch (e) {
            console.warn(`Route "${name}" not found, using fallback`);
            if (name === 'admin.users.index') return '/admin/users';
            if (name === 'admin.users.update') return `/admin/users/${params?.id || ''}`;
            if (name === 'admin.users.role') return `/admin/users/${params?.id || ''}/role`;
            if (name === 'admin.users.toggle-active') return `/admin/users/${params?.id || ''}/toggle-active`;
            return '#';
        }
    };

    // Role Badge Component Helper
    const renderRoleBadge = (role) => {
        switch (role) {
            case 'super_admin':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                        Super Admin
                    </span>
                );
            case 'gym_owner':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Gym Owner
                    </span>
                );
            case 'user':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-sm shadow-blue-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                        User
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-slate-700/50 text-slate-300 border border-slate-600/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        {role || 'Unknown'}
                    </span>
                );
        }
    };

    // Status Badge
    const renderStatusBadge = (isActive) => {
        return isActive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active
            </span>
        ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-rose-600/30 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                Inactive
            </span>
        );
    };

    // Open confirmation modal for toggle active
    const confirmToggleActive = () => {
        setConfirmAction('toggle');
        setShowConfirmModal(true);
    };

    // Quick Action Handlers
    const handleUpdateRole = (role) => {
        if (!confirm(`Are you sure you want to change ${user.name}'s role to ${role}?`)) return;

        setIsProcessing(true);
        const url = safeRoute('admin.users.role', { id: user.id });

        router.post(
            url,
            { role },
            {
                onFinish: () => setIsProcessing(false),
                preserveScroll: true,
                onSuccess: () => {
                    setNotification({
                        type: 'success',
                        message: `Role updated to ${role} successfully!`
                    });
                },
                onError: (errors) => {
                    setNotification({
                        type: 'error',
                        message: errors.message || 'Failed to update role.'
                    });
                }
            }
        );
    };

    const handleToggleActive = () => {
        setIsProcessing(true);
        setShowConfirmModal(false);

        const url = safeRoute('admin.users.toggle-active', { id: user.id });

        router.post(
            url,
            {},
            {
                onFinish: () => setIsProcessing(false),
                preserveScroll: true,
                onSuccess: () => {
                    setNotification({
                        type: 'success',
                        message: user.is_active ? 'Account deactivated.' : 'Account activated.'
                    });
                    setConfirmAction(null);
                },
                onError: (errors) => {
                    setNotification({
                        type: 'error',
                        message: errors.message || 'Failed to toggle account status.'
                    });
                    setConfirmAction(null);
                }
            }
        );
    };

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setErrors({});

        const url = safeRoute('admin.users.update', { id: user.id });

        router.put(
            url,
            formData,
            {
                onFinish: () => setIsProcessing(false),
                preserveScroll: true,
                onSuccess: () => {
                    setIsEditing(false);
                    setNotification({
                        type: 'success',
                        message: 'User details updated successfully!'
                    });
                },
                onError: (errors) => {
                    setErrors(errors);
                    setNotification({
                        type: 'error',
                        message: 'Failed to update user details.'
                    });
                }
            }
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const closeNotification = () => {
        setNotification(null);
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString('en-MY', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    // If user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="text-4xl mb-4">👤</div>
                    <h2 className="text-xl font-bold text-white">User Not Found</h2>
                    <p className="text-slate-400 text-sm mt-2">The user you're looking for doesn't exist.</p>
                    <Link
                        href={safeRoute('admin.users.index')}
                        className="inline-block mt-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition"
                    >
                        Back to Users
                    </Link>
                </div>
            </div>
        );
    }

    // Get role options for dropdown
    const roleOptions = [
        { value: 'user', label: 'User' },
        { value: 'gym_owner', label: 'Gym Owner' },
        { value: 'super_admin', label: 'Super Admin' },
    ];

    const isOwnAccount = user.id === window._auth?.user?.id;

    // Get modal content
    const getModalContent = () => {
        const isDeactivate = user.is_active;
        return {
            title: isDeactivate ? 'Deactivate Account' : 'Activate Account',
            message: `Are you sure you want to ${isDeactivate ? 'deactivate' : 'activate'} "${user.name}"'s account?${
                isDeactivate ? ' They will not be able to log in until reactivated.' : ' They will regain full access to their account.'
            }`,
            icon: isDeactivate ? '⏸️' : '▶️',
            buttonText: isDeactivate ? 'Yes, Deactivate' : 'Yes, Activate',
            buttonColor: isDeactivate 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
        };
    };

    const modalContent = getModalContent();

    return (
        <div className="space-y-6 pb-12">
            <Head title={`User: ${user.name}`} />

            {/* Notification */}
            {notification && (
                <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 animate-in slide-in-from-top-2 duration-300 ${
                    notification.type === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                    <span className="text-lg mt-0.5">
                        {notification.type === 'success' ? '✅' : '❌'}
                    </span>
                    <div className="flex-1">
                        <p className="text-sm font-medium">{notification.message}</p>
                    </div>
                    <button 
                        onClick={closeNotification}
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* TOP BREADCRUMB & BACK BUTTON */}
            <div className="flex items-center justify-between">
                <Link
                    href={safeRoute('admin.users.index')}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Users</span>
                </Link>

                <div className="flex items-center gap-2">
                    {renderStatusBadge(user.is_active)}
                </div>
            </div>

            {/* HERO HEADER & QUICK ACTIONS */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl text-white font-bold shadow-lg shadow-amber-500/20">
                            {user.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl font-black text-white tracking-tight">
                                    {user.name}
                                </h1>
                                {renderRoleBadge(user.role?.name)}
                            </div>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                                <span>📧</span>
                                <span>{user.email}</span>
                                {user.phone && (
                                    <>
                                        <span className="text-slate-500">•</span>
                                        <span>📱 {user.phone}</span>
                                    </>
                                )}
                                <span className="text-slate-500">•</span>
                                <span>Joined {formatDate(user.created_at)}</span>
                            </p>
                        </div>
                    </div>

                    {/* Quick Action Control Bar */}
                    {!isOwnAccount && (
                        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                            <select
                                value={user.role?.name || ''}
                                onChange={(e) => handleUpdateRole(e.target.value)}
                                disabled={isProcessing}
                                className="bg-slate-900/90 border border-slate-600/60 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50 cursor-pointer hover:border-slate-500/80 min-w-[120px]"
                            >
                                {roleOptions.map((option) => (
                                    <option 
                                        key={option.value} 
                                        value={option.value}
                                        className="bg-slate-900 text-slate-100 hover:bg-slate-800"
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            {/* Compact Toggle Button - Opens confirmation modal */}
                            <button
                                disabled={isProcessing}
                                onClick={confirmToggleActive}
                                className={`px-4 py-2 rounded-lg font-bold text-xs transition-all disabled:opacity-50 ${
                                    user.is_active
                                        ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500'
                                        : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500'
                                }`}
                            >
                                {isProcessing ? '...' : (user.is_active ? 'Deactivate' : 'Activate')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Information */}
                    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <span>👤</span> Profile Information
                            </h3>
                            {!isOwnAccount && !isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
                                >
                                    Edit Profile
                                </button>
                            )}
                            {isEditing && (
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            name: user.name || '',
                                            email: user.email || '',
                                            phone: user.phone || '',
                                        });
                                        setErrors({});
                                    }}
                                    className="text-xs font-semibold text-slate-400 hover:text-slate-300 transition"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                                        Full Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-slate-950/80 border border-white/10 rounded-lg text-white text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-red-400 mt-1">{errors.name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                                        Email Address <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-slate-950/80 border border-white/10 rounded-lg text-white text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-red-400 mt-1">{errors.email}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-slate-950/80 border border-white/10 rounded-lg text-white text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                    />
                                    {errors.phone && (
                                        <p className="text-xs text-red-400 mt-1">{errors.phone}</p>
                                    )}
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="submit"
                                        disabled={isProcessing}
                                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
                                    >
                                        {isProcessing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between py-2 border-b border-slate-800/60">
                                    <span className="text-slate-500">Full Name</span>
                                    <span className="text-white font-semibold">{user.name}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800/60">
                                    <span className="text-slate-500">Email</span>
                                    <span className="text-white font-semibold">{user.email}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-800/60">
                                    <span className="text-slate-500">Phone</span>
                                    <span className="text-white font-semibold">{user.phone || 'Not provided'}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-500">Role</span>
                                    <span>{renderRoleBadge(user.role?.name)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Gym Information (if gym owner) */}
                    {user.role?.name === 'gym_owner' && user.gyms && user.gyms.length > 0 && (
                        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                <span>🏋️</span> Managed Gyms
                            </h3>
                            <div className="space-y-2">
                                {user.gyms.map((gym) => (
                                    <Link
                                        key={gym.id}
                                        href={route('admin.gyms.show', gym.id)}
                                        className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 transition group"
                                    >
                                        <div>
                                            <span className="font-semibold text-white text-sm">{gym.name}</span>
                                            <div className="text-[10px] text-slate-400">
                                                Status: {gym.status || 'N/A'}
                                            </div>
                                        </div>
                                        <span className="text-xs text-amber-400 group-hover:text-amber-300 transition">
                                            View →
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Metadata */}
                <div className="space-y-6">
                    {/* Account Information */}
                    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <span>ℹ️</span> Account Information
                        </h3>
                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-2 border-b border-slate-800/60">
                                <span className="text-slate-500">User ID</span>
                                <span className="text-white font-mono font-semibold">#{user.id}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800/60">
                                <span className="text-slate-500">Role</span>
                                <span>{renderRoleBadge(user.role?.name)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800/60">
                                <span className="text-slate-500">Status</span>
                                <span>{renderStatusBadge(user.is_active)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800/60">
                                <span className="text-slate-500">Created</span>
                                <span className="text-white text-right">
                                    {formatDate(user.created_at)}
                                </span>
                            </div>
                            {user.updated_at && user.updated_at !== user.created_at && (
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-500">Last Updated</span>
                                    <span className="text-white text-right">
                                        {formatDate(user.updated_at)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <span>📊</span> Quick Stats
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                <span className="text-xs text-slate-400">Role</span>
                                <span className="text-xs font-semibold text-white capitalize">
                                    {user.role?.name?.replace('_', ' ') || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                <span className="text-xs text-slate-400">Gyms Managed</span>
                                <span className="text-xs font-semibold text-white">
                                    {user.gyms?.length || 0}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                <span className="text-xs text-slate-400">Account Status</span>
                                <span className="text-xs font-semibold">
                                    {user.is_active ? '✅ Active' : '❌ Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-800/80">
                <Link
                    href={safeRoute('admin.users.index')}
                    className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-6 py-2.5 rounded-xl border border-slate-700 font-bold text-xs transition-all"
                >
                    <span>←</span> Back to Users
                </Link>
                
                {!isOwnAccount && (
                    <button
                        disabled={isProcessing}
                        onClick={confirmToggleActive}
                        className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all disabled:opacity-50 ${
                            user.is_active
                                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500'
                                : 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950 hover:border-emerald-500'
                        }`}
                    >
                        {isProcessing ? '...' : (user.is_active ? 'Deactivate Account' : 'Activate Account')}
                    </button>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && modalContent && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => {
                            setShowConfirmModal(false);
                            setConfirmAction(null);
                        }}
                    ></div>
                    
                    {/* Modal */}
                    <div className="relative max-w-md w-full bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                user.is_active 
                                    ? 'bg-amber-500/10 border border-amber-500/20' 
                                    : 'bg-emerald-500/10 border border-emerald-500/20'
                            }`}>
                                <span className={`text-3xl ${
                                    user.is_active ? 'text-amber-400' : 'text-emerald-400'
                                }`}>
                                    {modalContent.icon}
                                </span>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-xl font-bold text-white text-center mb-2">
                            {modalContent.title}
                        </h3>
                        <p className="text-sm text-slate-400 text-center mb-6">
                            {modalContent.message}
                        </p>

                        {/* User Info */}
                        <div className="bg-white/5 rounded-xl p-3 mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-amber-500/20">
                                {user.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">{user.name}</p>
                                <p className="text-xs text-slate-400">
                                    Current status: {user.is_active ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setConfirmAction(null);
                                }}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleToggleActive}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all duration-200 hover:scale-105 ${modalContent.buttonColor}`}
                            >
                                {modalContent.buttonText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Persistent Inertia Layout Assignment
Show.layout = (page) => <AdminLayout>{page}</AdminLayout>;