import React, { useState, useEffect } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import OwnerLayout from '@/Layouts/OwnerLayout';

export default function Memberships({ gym, plans = [] }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmData, setConfirmData] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        billing_cycle: 'monthly',
        description: '',
    });
    const [errors, setErrors] = useState({});

    // Auto-hide notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            price: '',
            billing_cycle: 'monthly',
            description: '',
        });
        setErrors({});
        setEditingPlan(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const openEditModal = (plan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            price: plan.price,
            billing_cycle: plan.billing_cycle,
            description: plan.description || '',
        });
        setErrors({});
        setShowAddModal(true);
    };

    const closeModal = () => {
        setShowAddModal(false);
        resetForm();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const url = editingPlan 
            ? `/owner/gym/memberships/${editingPlan.id}`
            : '/owner/gym/memberships';
        
        const method = editingPlan ? 'put' : 'post';

        router[method](url, formData, {
            onSuccess: () => {
                setIsSubmitting(false);
                closeModal();
                setNotification({
                    type: 'success',
                    message: editingPlan 
                        ? 'Membership plan updated successfully!'
                        : 'Membership plan added successfully!'
                });
            },
            onError: (errors) => {
                setIsSubmitting(false);
                setErrors(errors);
                setNotification({
                    type: 'error',
                    message: 'Please fix the errors and try again.'
                });
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    // Show toggle confirmation modal
    const confirmToggle = (plan) => {
        setConfirmData(plan);
        setConfirmAction('toggle');
        setShowConfirmModal(true);
    };

    // Show delete confirmation modal
    const confirmDelete = (plan) => {
        setConfirmData(plan);
        setConfirmAction('delete');
        setShowConfirmModal(true);
    };

    // Execute the action after confirmation
    const executeAction = () => {
        setShowConfirmModal(false);
        const plan = confirmData;

        if (confirmAction === 'toggle') {
            router.post(`/owner/gym/memberships/${plan.id}/toggle`, {}, {
                onSuccess: () => {
                    setNotification({
                        type: 'success',
                        message: plan.is_active ? 'Plan deactivated.' : 'Plan activated.'
                    });
                },
                onError: () => {
                    setNotification({
                        type: 'error',
                        message: 'Failed to toggle plan status.'
                    });
                }
            });
        } else if (confirmAction === 'delete') {
            router.delete(`/owner/gym/memberships/${plan.id}`, {
                onSuccess: () => {
                    setNotification({
                        type: 'success',
                        message: 'Membership plan removed.'
                    });
                },
                onError: () => {
                    setNotification({
                        type: 'error',
                        message: 'Failed to delete plan.'
                    });
                }
            });
        }
    };

    const closeNotification = () => {
        setNotification(null);
    };

    // Get billing cycle label
    const getBillingCycleLabel = (cycle) => {
        const labels = {
            'monthly': 'Monthly',
            'yearly': 'Yearly',
            'one_time': 'One Time'
        };
        return labels[cycle] || cycle;
    };

    // Get billing cycle color
    const getBillingCycleColor = (cycle) => {
        const colors = {
            'monthly': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'yearly': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            'one_time': 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        };
        return colors[cycle] || 'bg-slate-800 text-slate-300';
    };

    // Format price
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-MY', {
            style: 'currency',
            currency: 'MYR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(price);
    };

    // Get modal content based on action
    const getModalContent = () => {
        if (confirmAction === 'toggle') {
            const isActive = confirmData?.is_active;
            return {
                title: isActive ? 'Deactivate Plan' : 'Activate Plan',
                message: `Are you sure you want to ${isActive ? 'deactivate' : 'activate'} "${confirmData?.name}"?`,
                icon: isActive ? '⏸️' : '▶️',
                buttonText: isActive ? 'Yes, Deactivate' : 'Yes, Activate',
                buttonColor: isActive 
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
            };
        } else if (confirmAction === 'delete') {
            return {
                title: 'Delete Plan',
                message: `Are you sure you want to permanently delete "${confirmData?.name}"? This action cannot be undone.`,
                icon: '🗑️',
                buttonText: 'Yes, Delete',
                buttonColor: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
            };
        }
        return null;
    };

    const modalContent = getModalContent();

    return (
        <>
            <Head title="Membership Plans" />
            
            <div className="max-w-5xl mx-auto">
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

                {/* Header */}
                <div className="text-center mb-8">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
                        💳 Membership Plans
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                        Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Plans</span>
                    </h1>
                    <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                        Create and manage membership plans for your gym. Plans are displayed on your gym's public listing.
                    </p>
                </div>

                {/* Stats Bar */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">💳</span>
                            <div>
                                <span className="text-xs text-slate-400">Total Plans</span>
                                <p className="text-sm font-bold text-white">{plans.length}</p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-800"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">✅</span>
                            <div>
                                <span className="text-xs text-slate-400">Active</span>
                                <p className="text-sm font-bold text-emerald-400">
                                    {plans.filter(p => p.is_active).length}
                                </p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-800"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">⏸️</span>
                            <div>
                                <span className="text-xs text-slate-400">Inactive</span>
                                <p className="text-sm font-bold text-slate-400">
                                    {plans.filter(p => !p.is_active).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={openAddModal}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm"
                    >
                        + Add Plan
                    </button>
                </div>

                {/* Plans Grid */}
                {plans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {plans.map((plan) => (
                            <div 
                                key={plan.id} 
                                className={`glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border ${
                                    plan.is_active 
                                        ? 'border-white/10' 
                                        : 'border-white/5 opacity-60'
                                } hover:border-amber-500/30 transition-all group`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border ${getBillingCycleColor(plan.billing_cycle)}`}>
                                            {getBillingCycleLabel(plan.billing_cycle)}
                                        </span>
                                    </div>
                                    <div className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                        plan.is_active 
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' 
                                            : 'bg-slate-700/50 text-slate-400 border border-slate-700/50'
                                    }`}>
                                        {plan.is_active ? 'Active' : 'Inactive'}
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="mb-3">
                                    <span className="text-3xl font-black text-amber-400">
                                        {formatPrice(plan.price)}
                                    </span>
                                    <span className="text-xs text-slate-400 ml-1">
                                        / {getBillingCycleLabel(plan.billing_cycle).toLowerCase()}
                                    </span>
                                </div>

                                {/* Description */}
                                {plan.description && (
                                    <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                                        {plan.description}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                                    <button
                                        onClick={() => openEditModal(plan)}
                                        className="flex-1 bg-slate-800/50 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition border border-slate-700/50"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => confirmToggle(plan)}
                                        className={`flex-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition border ${
                                            plan.is_active
                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500 hover:text-slate-950'
                                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950'
                                        }`}
                                    >
                                        {plan.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(plan)}
                                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all"
                                        title="Delete Plan"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card rounded-2xl p-12 text-center backdrop-blur-xl bg-white/5 border-white/10">
                        <div className="text-6xl mb-4">💳</div>
                        <h3 className="text-xl font-bold text-white mb-2">No Membership Plans</h3>
                        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                            Create your first membership plan to showcase your pricing to potential members.
                        </p>
                        <button
                            onClick={openAddModal}
                            className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20"
                        >
                            + Add Your First Plan
                        </button>
                    </div>
                )}

                {/* Tips Box */}
                <div className="mt-8 glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                    <div className="flex items-start gap-4">
                        <div className="text-2xl">💡</div>
                        <div>
                            <h3 className="text-sm font-bold text-white">Tips for membership plans</h3>
                            <ul className="mt-2 space-y-1 text-xs text-slate-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span>Create multiple tiers to cater to different budgets</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span>Clear pricing helps users make informed decisions</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span>Deactivate seasonal plans instead of deleting them</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span>Include key benefits in the description</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closeModal}
                    ></div>
                    
                    {/* Modal */}
                    <div className="relative max-w-md w-full bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">
                                {editingPlan ? 'Edit Plan' : 'Add New Plan'}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Plan Name */}
                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Plan Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                    placeholder="e.g. Basic Membership"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-400 mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Price */}
                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Price (RM) <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                    placeholder="0.00"
                                    required
                                />
                                {errors.price && (
                                    <p className="text-xs text-red-400 mt-1">{errors.price}</p>
                                )}
                            </div>

                            {/* Billing Cycle */}
                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Billing Cycle <span className="text-red-400">*</span>
                                </label>
                                <select
                                    name="billing_cycle"
                                    value={formData.billing_cycle}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white"
                                    required
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                    <option value="one_time">One Time</option>
                                </select>
                                {errors.billing_cycle && (
                                    <p className="text-xs text-red-400 mt-1">{errors.billing_cycle}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                    placeholder="What's included in this plan?"
                                />
                                {errors.description && (
                                    <p className="text-xs text-red-400 mt-1">{errors.description}</p>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : (
                                        editingPlan ? 'Update Plan' : 'Add Plan'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && modalContent && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowConfirmModal(false)}
                    ></div>
                    
                    {/* Modal */}
                    <div className="relative max-w-md w-full bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                confirmAction === 'delete' 
                                    ? 'bg-red-500/10 border border-red-500/20' 
                                    : 'bg-amber-500/10 border border-amber-500/20'
                            }`}>
                                <span className={`text-3xl ${
                                    confirmAction === 'delete' ? 'text-red-400' : 'text-amber-400'
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

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeAction}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all duration-200 hover:scale-105 ${modalContent.buttonColor}`}
                            >
                                {modalContent.buttonText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Persistent Layout Setup
Memberships.layout = (page) => <OwnerLayout>{page}</OwnerLayout>;