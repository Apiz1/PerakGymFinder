import React, { useState } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ facilities, categories }) {
    const [isProcessing, setProcessing] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [deleteData, setDeleteData] = useState(null);
    const [formData, setFormData] = useState({ name: '', icon: '' });
    const [errors, setErrors] = useState({});

    // Open add modal
    const openAddModal = (type) => {
        setModalType(type);
        setFormData({ name: '', icon: '' });
        setErrors({});
        setShowAddModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowAddModal(false);
        setModalType(null);
        setFormData({ name: '', icon: '' });
        setErrors({});
    };

    // Open delete confirmation modal
    const openDeleteModal = (type, id, name) => {
        setDeleteData({ type, id, name });
        setShowDeleteModal(true);
    };

    // Close delete modal
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDeleteData(null);
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Handle add submission
    const handleAddSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        let url = '';
        let data = { name: formData.name };

        if (modalType === 'facility') {
            url = route('admin.taxonomy.facilities.store');
            data.icon = formData.icon || null;
        } else if (modalType === 'category') {
            url = route('admin.taxonomy.categories.store');
        } else {
            return;
        }

        router.post(url, data, {
            onSuccess: () => {
                setProcessing(false);
                closeModal();
                setNotification({
                    type: 'success',
                    message: `${formData.name} added successfully!`
                });
            },
            onError: (errors) => {
                setProcessing(false);
                setErrors(errors);
                setNotification({
                    type: 'error',
                    message: 'Failed to add. Please try again.'
                });
            },
            onFinish: () => {
                setProcessing(false);
            }
        });
    };

    // Handle delete confirmation
    const confirmDelete = () => {
        if (!deleteData) return;

        const { type, id } = deleteData;
        setProcessing(true);
        setShowDeleteModal(false);

        let url = '';
        if (type === 'facility') {
            url = route('admin.taxonomy.facilities.destroy', id);
        } else if (type === 'category') {
            url = route('admin.taxonomy.categories.destroy', id);
        } else {
            return;
        }

        router.delete(url, {
            onSuccess: () => {
                setProcessing(false);
                setDeleteData(null);
                setNotification({
                    type: 'success',
                    message: `${deleteData.name} removed successfully!`
                });
            },
            onError: (errors) => {
                setProcessing(false);
                setDeleteData(null);
                setNotification({
                    type: 'error',
                    message: errors.message || 'Failed to delete. Please try again.'
                });
            },
            onFinish: () => {
                setProcessing(false);
            }
        });
    };

    const closeNotification = () => {
        setNotification(null);
    };

    // Get modal title
    const getModalTitle = () => {
        return modalType === 'facility' ? 'Add New Facility' : 'Add New Category';
    };

    // Get modal placeholder
    const getModalPlaceholder = () => {
        return modalType === 'facility' ? 'Enter facility name...' : 'Enter category name...';
    };

    // Get delete modal content
    const getDeleteModalContent = () => {
        if (!deleteData) return null;
        const { type, name } = deleteData;
        const typeLabels = {
            facility: 'Facility',
            category: 'Category'
        };
        return {
            title: `Delete ${typeLabels[type]}`,
            message: `Are you sure you want to delete "${name}"? This will remove it from all gyms that currently use it.`,
            icon: '🗑️',
            buttonText: 'Yes, Delete',
            buttonColor: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
        };
    };

    const deleteModalContent = getDeleteModalContent();

    // Get total counts
    const totalFacilities = facilities?.length || 0;
    const totalCategories = categories?.length || 0;

    return (
        <div className="space-y-6 pb-12">
            <Head title="Taxonomy Management" />

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
                    <h1 className="text-2xl font-black text-white tracking-tight">Taxonomy Management</h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Manage facilities and categories that gym owners can select for their listings.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => openAddModal('facility')}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm"
                    >
                        + Add Facility
                    </button>
                    <button
                        onClick={() => openAddModal('category')}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm"
                    >
                        + Add Category
                    </button>
                </div>
            </div>

            {/* STATS BAR */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🏋️</span>
                    <div>
                        <span className="text-xs text-slate-400">Facilities</span>
                        <p className="text-sm font-bold text-white">{totalFacilities}</p>
                    </div>
                </div>
                <div className="h-8 w-px bg-slate-800"></div>
                <div className="flex items-center gap-2">
                    <span className="text-lg">📂</span>
                    <div>
                        <span className="text-xs text-slate-400">Categories</span>
                        <p className="text-sm font-bold text-white">{totalCategories}</p>
                    </div>
                </div>
            </div>

            {/* TAXONOMY GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Facilities Section */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                            <span>🏋️</span> Facilities
                            <span className="text-xs font-normal text-slate-400">
                                ({totalFacilities})
                            </span>
                        </h2>
                        <button
                            onClick={() => openAddModal('facility')}
                            className="text-xs text-amber-400 hover:text-amber-300 transition"
                        >
                            + Add
                        </button>
                    </div>

                    <div className="p-4">
                        {facilities && facilities.length > 0 ? (
                            <div className="space-y-2">
                                {facilities.map((facility) => (
                                    <div 
                                        key={facility.id} 
                                        className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 transition group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{facility.icon || '🏋️'}</span>
                                            <div>
                                                <span className="font-semibold text-white text-sm">{facility.name}</span>
                                                <span className="text-xs text-slate-400 ml-2">
                                                    ({facility.gyms_count || 0} gyms)
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openDeleteModal('facility', facility.id, facility.name)}
                                            disabled={isProcessing}
                                            className="text-xs text-rose-400 hover:text-rose-300 transition px-2 py-1 rounded-lg hover:bg-rose-500/10 disabled:opacity-50"
                                            title="Delete Facility"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-3xl mb-2">🏋️</div>
                                <p className="text-sm text-slate-400">No facilities added yet.</p>
                                <button
                                    onClick={() => openAddModal('facility')}
                                    className="mt-2 text-xs text-amber-400 hover:text-amber-300 transition"
                                >
                                    + Add your first facility
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Categories Section */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                            <span>📂</span> Categories
                            <span className="text-xs font-normal text-slate-400">
                                ({totalCategories})
                            </span>
                        </h2>
                        <button
                            onClick={() => openAddModal('category')}
                            className="text-xs text-blue-400 hover:text-blue-300 transition"
                        >
                            + Add
                        </button>
                    </div>

                    <div className="p-4">
                        {categories && categories.length > 0 ? (
                            <div className="space-y-2">
                                {categories.map((category) => (
                                    <div 
                                        key={category.id} 
                                        className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 transition group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">📂</span>
                                            <div>
                                                <span className="font-semibold text-white text-sm">{category.name}</span>
                                                <span className="text-xs text-slate-400 ml-2">
                                                    ({category.gyms_count || 0} gyms)
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openDeleteModal('category', category.id, category.name)}
                                            disabled={isProcessing}
                                            className="text-xs text-rose-400 hover:text-rose-300 transition px-2 py-1 rounded-lg hover:bg-rose-500/10 disabled:opacity-50"
                                            title="Delete Category"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-3xl mb-2">📂</div>
                                <p className="text-sm text-slate-400">No categories added yet.</p>
                                <button
                                    onClick={() => openAddModal('category')}
                                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition"
                                >
                                    + Add your first category
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        💡
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Taxonomy Management Tips</h3>
                        <ul className="mt-2 space-y-1 text-xs text-slate-400">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">Facilities:</strong> These are amenities gyms can offer (e.g., Parking, Sauna, Personal Training)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">Categories:</strong> These are gym types (e.g., CrossFit, Yoga, General Fitness)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">Deletion:</strong> Removing a facility or category will detach it from all gyms</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">Usage:</strong> The count shows how many gyms are currently using each tag</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Add Modal */}
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
                                {getModalTitle()}
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                    placeholder={getModalPlaceholder()}
                                    required
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-400 mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Icon field - only for facilities */}
                            {modalType === 'facility' && (
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        Icon <span className="text-xs text-slate-400">(emoji or text)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="icon"
                                        value={formData.icon}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        placeholder="e.g. 🏋️ or Parking"
                                    />
                                    {errors.icon && (
                                        <p className="text-xs text-red-400 mt-1">{errors.icon}</p>
                                    )}
                                </div>
                            )}

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
                                    disabled={isProcessing || !formData.name.trim()}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Adding...
                                        </span>
                                    ) : (
                                        'Add'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && deleteModalContent && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={closeDeleteModal}
                    ></div>
                    
                    {/* Modal */}
                    <div className="relative max-w-md w-full bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <span className="text-3xl text-red-400">🗑️</span>
                            </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-xl font-bold text-white text-center mb-2">
                            {deleteModalContent.title}
                        </h3>
                        <p className="text-sm text-slate-400 text-center mb-6">
                            {deleteModalContent.message}
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={closeDeleteModal}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all duration-200 hover:scale-105 ${deleteModalContent.buttonColor}`}
                            >
                                {deleteModalContent.buttonText}
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