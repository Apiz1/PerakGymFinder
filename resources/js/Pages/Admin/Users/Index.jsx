import React, { useState, useEffect, useRef } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ users, filters, roleCounts }) {
    const [search, setSearch] = useState(filters.search || '');
    const [processingId, setProcessingId] = useState(null);
    const [notification, setNotification] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmData, setConfirmData] = useState(null);
    const isFirstRender = useRef(true);

    // Filter role tabs helper
    const currentRole = filters.role || '';

    // Debounced Search Effect
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                route('admin.users.index'),
                { role: currentRole || undefined, search: search || undefined },
                { preserveState: true, replace: true }
            );
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    // Auto-hide notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Role Badge Component Helper - Improved with better text visibility
    const renderRoleBadge = (role) => {
        switch (role) {
            case 'super_admin':
                return (
                    <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-purple-900/50 text-purple-200 border border-purple-600/50">
                        Super Admin
                    </span>
                );
            case 'gym_owner':
                return (
                    <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-emerald-900/50 text-emerald-200 border border-emerald-600/50">
                        Gym Owner
                    </span>
                );
            case 'user':
                return (
                    <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-blue-900/50 text-blue-200 border border-blue-600/50">
                        User
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {role || 'Unknown'}
                    </span>
                );
        }
    };

    // Open confirmation modal for toggle active
    const confirmToggleActive = (userId, currentStatus, userName) => {
        const action = currentStatus ? 'deactivate' : 'activate';
        setConfirmData({
            userId,
            currentStatus,
            userName,
            action
        });
        setShowConfirmModal(true);
    };

    // Handle toggle active after confirmation
    const handleToggleActive = () => {
        if (!confirmData) return;

        const { userId, currentStatus, userName } = confirmData;
        const action = currentStatus ? 'deactivate' : 'activate';

        setProcessingId(userId);
        setShowConfirmModal(false);

        router.post(
            route('admin.users.toggle-active', userId),
            {},
            {
                onFinish: () => setProcessingId(null),
                preserveScroll: true,
                onSuccess: () => {
                    setNotification({
                        type: 'success',
                        message: currentStatus ? 'Account deactivated.' : 'Account activated.'
                    });
                    setConfirmData(null);
                },
                onError: (errors) => {
                    setNotification({
                        type: 'error',
                        message: errors.message || 'Failed to toggle account status.'
                    });
                    setConfirmData(null);
                }
            }
        );
    };

    // Quick Action Handlers
    const handleUpdateRole = (userId, role, confirmMessage) => {
        if (confirmMessage && !confirm(confirmMessage)) return;

        setProcessingId(userId);
        router.post(
            route('admin.users.role', userId),
            { role },
            {
                onFinish: () => setProcessingId(null),
                preserveScroll: true,
                onSuccess: () => {
                    setNotification({
                        type: 'success',
                        message: `Role updated successfully!`
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

    const handleFilterRole = (roleValue) => {
        router.get(
            route('admin.users.index'),
            { role: roleValue || undefined, search: search || undefined },
            { preserveState: true, replace: true }
        );
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
                day: 'numeric'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    const totalUsers = roleCounts?.all || users.total || 0;

    // Get role options for dropdown
    const roleOptions = [
        { value: 'user', label: 'User' },
        { value: 'gym_owner', label: 'Gym Owner' },
        { value: 'super_admin', label: 'Super Admin' },
    ];

    // Get modal content
    const getModalContent = () => {
        if (!confirmData) return null;
        const { action, userName } = confirmData;
        const isDeactivate = action === 'deactivate';
        return {
            title: isDeactivate ? 'Deactivate Account' : 'Activate Account',
            message: `Are you sure you want to ${action} "${userName}"'s account?${
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
            <Head title="User Management" />

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

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">User Management</h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Manage user accounts, roles, and account status across the platform.
                    </p>
                </div>
            </div>

            {/* ROLE COUNTER TABS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { key: '', label: 'All Users', count: totalUsers, color: 'text-slate-200' },
                    { key: 'user', label: 'Users', count: roleCounts?.user || 0, color: 'text-blue-400' },
                    { key: 'gym_owner', label: 'Gym Owners', count: roleCounts?.gym_owner || 0, color: 'text-emerald-400' },
                    { key: 'super_admin', label: 'Super Admins', count: roleCounts?.super_admin || 0, color: 'text-purple-400' },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleFilterRole(tab.key)}
                        className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                            currentRole === tab.key
                                ? 'bg-slate-900 border-amber-500/60 ring-1 ring-amber-500/20'
                                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-400">{tab.label}</span>
                        </div>
                        <div className={`text-2xl font-black mt-2 ${tab.color}`}>
                            {tab.count}
                        </div>
                    </button>
                ))}
            </div>

            {/* FILTER BAR & SEARCH */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-sm">
                <div className="relative w-full sm:w-80">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                        🔍
                    </span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-all placeholder:text-slate-600"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-500 hover:text-slate-300"
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="text-xs text-slate-500 font-mono w-full sm:w-auto text-right">
                    Showing <span className="text-slate-200 font-bold">{users.data?.length || 0}</span> of <span className="text-slate-200 font-bold">{users.total || 0}</span> users
                </div>
            </div>

            {/* DATA TABLE CARD */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950/80 uppercase text-[10px] font-bold tracking-wider text-slate-400 border-b border-slate-800">
                            <tr>
                                <th scope="col" className="px-6 py-4">User</th>
                                <th scope="col" className="px-6 py-4">Role</th>
                                <th scope="col" className="px-6 py-4">Status</th>
                                <th scope="col" className="px-6 py-4">Joined</th>
                                <th scope="col" className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                            {users.data && users.data.length > 0 ? (
                                users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                                        {/* User */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-amber-500/20">
                                                    {user.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-sm">{user.name}</div>
                                                    <div className="text-[10px] text-slate-500 truncate max-w-[150px]">
                                                        {user.email}
                                                    </div>
                                                    {user.phone && (
                                                        <div className="text-[10px] text-slate-600">
                                                            {user.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role */}
                                        <td className="px-6 py-4">
                                            {renderRoleBadge(user.role?.name)}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            {user.is_active ? (
                                                <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        {/* Joined */}
                                        <td className="px-6 py-4 text-slate-400">
                                            {formatDate(user.created_at)}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* View Details */}
                                                <Link
                                                    href={route('admin.users.show', user.id)}
                                                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 font-bold transition-all text-xs"
                                                >
                                                    View
                                                </Link>

                                                {/* Role Dropdown */}
                                                {user.id !== window._auth?.user?.id && (
                                                    <select
                                                        value={user.role?.name || ''}
                                                        onChange={(e) => handleUpdateRole(
                                                            user.id,
                                                            e.target.value,
                                                            `Change ${user.name}'s role to ${e.target.value}?`
                                                        )}
                                                        disabled={processingId === user.id}
                                                        className="bg-slate-900/90 border border-slate-600/60 text-slate-100 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50 cursor-pointer hover:border-slate-500/80 min-w-[110px] [&>option]:bg-slate-900 [&>option]:text-slate-100 [&>option]:py-1"
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
                                                )}

                                                {/* Toggle Active - Opens confirmation modal */}
                                                {user.id !== window._auth?.user?.id && (
                                                    <button
                                                        disabled={processingId === user.id}
                                                        onClick={() => confirmToggleActive(user.id, user.is_active, user.name)}
                                                        className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs disabled:opacity-50 ${
                                                            user.is_active
                                                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500 hover:text-slate-950'
                                                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950'
                                                        }`}
                                                    >
                                                        {user.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        <div className="text-3xl mb-2">👤</div>
                                        <p className="font-semibold text-slate-400">No users found matching the criteria.</p>
                                        <p className="text-[11px] text-slate-600 mt-1">Try adjusting your filters or search terms.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION FOOTER */}
                {users.links && users.links.length > 3 && (
                    <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                        <div className="text-xs text-slate-500">
                            Page <span className="text-slate-300 font-bold">{users.current_page}</span> of <span className="text-slate-300 font-bold">{users.last_page}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {users.links.map((link, key) => (
                                link.url ? (
                                    <Link
                                        key={key}
                                        href={link.url}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 text-xs rounded-lg transition-all border ${
                                            link.active
                                                ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                                        }`}
                                    />
                                ) : (
                                    <span
                                        key={key}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className="px-3 py-1.5 text-xs text-slate-600 border border-transparent cursor-not-allowed"
                                    />
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        ℹ️
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">User Management Guidelines</h3>
                        <ul className="mt-2 space-y-1 text-xs text-slate-400">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">Roles:</strong> Users can be assigned different roles with varying permissions</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">Active/Inactive:</strong> Deactivated accounts cannot log in</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">View:</strong> Click View to see full user details and manage their gym associations</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">Self-protection:</strong> You cannot change your own role or deactivate your own account</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && modalContent && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => {
                            setShowConfirmModal(false);
                            setConfirmData(null);
                        }}
                    ></div>
                    
                    {/* Modal */}
                    <div className="relative max-w-md w-full bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                confirmData?.action === 'deactivate' 
                                    ? 'bg-amber-500/10 border border-amber-500/20' 
                                    : 'bg-emerald-500/10 border border-emerald-500/20'
                            }`}>
                                <span className={`text-3xl ${
                                    confirmData?.action === 'deactivate' ? 'text-amber-400' : 'text-emerald-400'
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
                        {confirmData && (
                            <div className="bg-white/5 rounded-xl p-3 mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-amber-500/20">
                                    {confirmData.userName?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{confirmData.userName}</p>
                                    <p className="text-xs text-slate-400">
                                        Current status: {confirmData.currentStatus ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setConfirmData(null);
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
Index.layout = (page) => <AdminLayout>{page}</AdminLayout>;