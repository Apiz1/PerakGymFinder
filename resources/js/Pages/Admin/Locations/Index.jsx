import React, { useState } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Index({ states }) {
    const [expandedStates, setExpandedStates] = useState({});
    const [expandedDistricts, setExpandedDistricts] = useState({});
    const [isProcessing, setProcessing] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [selectedParent, setSelectedParent] = useState(null);
    const [deleteData, setDeleteData] = useState(null);
    const [formData, setFormData] = useState({ name: '' });
    const [errors, setErrors] = useState({});

    // Toggle state expansion
    const toggleState = (stateId) => {
        setExpandedStates(prev => ({
            ...prev,
            [stateId]: !prev[stateId]
        }));
        // Close all districts when closing a state
        if (expandedStates[stateId]) {
            setExpandedDistricts(prev => {
                const newState = { ...prev };
                Object.keys(newState).forEach(key => {
                    if (key.startsWith(`${stateId}-`)) {
                        delete newState[key];
                    }
                });
                return newState;
            });
        }
    };

    // Toggle district expansion
    const toggleDistrict = (stateId, districtId) => {
        const key = `${stateId}-${districtId}`;
        setExpandedDistricts(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Open add modal
    const openAddModal = (type, parentId = null) => {
        setModalType(type);
        setSelectedParent(parentId);
        setFormData({ name: '' });
        setErrors({});
        setShowAddModal(true);
    };

    // Close modal
    const closeModal = () => {
        setShowAddModal(false);
        setModalType(null);
        setSelectedParent(null);
        setFormData({ name: '' });
        setErrors({});
    };

    // Open delete confirmation modal
    const openDeleteModal = (type, id, name, parentName = '') => {
        setDeleteData({ type, id, name, parentName });
        setShowDeleteModal(true);
    };

    // Close delete modal
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDeleteData(null);
    };

    // Handle form input change
    const handleInputChange = (e) => {
        setFormData({ name: e.target.value });
        if (errors.name) {
            setErrors({});
        }
    };

    // Handle add submission
    const handleAddSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        let url = '';
        let data = { name: formData.name };

        switch (modalType) {
            case 'state':
                url = route('admin.locations.states.store');
                break;
            case 'district':
                url = route('admin.locations.districts.store');
                data.state_id = selectedParent;
                break;
            case 'city':
                url = route('admin.locations.cities.store');
                data.district_id = selectedParent;
                break;
            default:
                return;
        }

        router.post(url, data, {
            onSuccess: () => {
                setProcessing(false);
                closeModal();
                setNotification({
                    type: 'success',
                    message: `${modalType.charAt(0).toUpperCase() + modalType.slice(1)} added successfully!`
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

        const { type, id, name } = deleteData;
        setProcessing(true);
        setShowDeleteModal(false);

        let url = '';
        switch (type) {
            case 'state':
                url = route('admin.locations.states.destroy', id);
                break;
            case 'district':
                url = route('admin.locations.districts.destroy', id);
                break;
            case 'city':
                url = route('admin.locations.cities.destroy', id);
                break;
            default:
                return;
        }

        router.delete(url, {
            onSuccess: () => {
                setProcessing(false);
                setDeleteData(null);
                setNotification({
                    type: 'success',
                    message: `${name} deleted successfully!`
                });
            },
            onError: (errors) => {
                setProcessing(false);
                setDeleteData(null);
                setNotification({
                    type: 'error',
                    message: errors.message || 'Failed to delete. This location may be in use.'
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
        switch (modalType) {
            case 'state':
                return 'Add New State';
            case 'district':
                return 'Add New District';
            case 'city':
                return 'Add New City';
            default:
                return 'Add New Location';
        }
    };

    // Get modal placeholder
    const getModalPlaceholder = () => {
        switch (modalType) {
            case 'state':
                return 'Enter state name...';
            case 'district':
                return 'Enter district name...';
            case 'city':
                return 'Enter city name...';
            default:
                return 'Enter name...';
        }
    };

    // Get parent name for modal
    const getParentName = () => {
        if (!selectedParent) return '';
        for (const state of states) {
            if (state.id === selectedParent) return state.name;
            for (const district of state.districts) {
                if (district.id === selectedParent) return district.name;
            }
        }
        return '';
    };

    // Get delete modal content
    const getDeleteModalContent = () => {
        if (!deleteData) return null;
        const { type, name, parentName } = deleteData;
        const typeLabels = {
            state: 'State',
            district: 'District',
            city: 'City'
        };
        return {
            title: `Delete ${typeLabels[type]}`,
            message: `Are you sure you want to delete "${name}"?${
                parentName ? ` This ${type} belongs to "${parentName}".` : ''
            } This action cannot be undone if it's not being used.`,
            icon: '🗑️',
            buttonText: 'Yes, Delete',
            buttonColor: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
        };
    };

    const deleteModalContent = getDeleteModalContent();

    return (
        <div className="space-y-6 pb-12">
            <Head title="Location Management" />

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
                    <h1 className="text-2xl font-black text-white tracking-tight">Location Management</h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Manage states, districts, and cities for gym locations across Malaysia.
                    </p>
                </div>
                <button
                    onClick={() => openAddModal('state')}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm"
                >
                    + Add State
                </button>
            </div>

            {/* STATS BAR */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🏛️</span>
                    <div>
                        <span className="text-xs text-slate-400">States</span>
                        <p className="text-sm font-bold text-white">{states.length}</p>
                    </div>
                </div>
                <div className="h-8 w-px bg-slate-800"></div>
                <div className="flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    <div>
                        <span className="text-xs text-slate-400">Districts</span>
                        <p className="text-sm font-bold text-white">
                            {states.reduce((acc, state) => acc + (state.districts?.length || 0), 0)}
                        </p>
                    </div>
                </div>
                <div className="h-8 w-px bg-slate-800"></div>
                <div className="flex items-center gap-2">
                    <span className="text-lg">🏙️</span>
                    <div>
                        <span className="text-xs text-slate-400">Cities</span>
                        <p className="text-sm font-bold text-white">
                            {states.reduce((acc, state) => 
                                acc + state.districts?.reduce((subAcc, district) => 
                                    subAcc + (district.cities?.length || 0), 0
                                ) || 0, 0
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* LOCATION TREE */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
                    <h2 className="text-sm font-bold text-white tracking-wide">Location Hierarchy</h2>
                </div>

                <div className="p-4 space-y-3">
                    {states.length > 0 ? (
                        states.map((state) => (
                            <div key={state.id} className="glass-card rounded-xl overflow-hidden backdrop-blur-xl bg-white/5 border-white/10">
                                {/* State Header */}
                                <div 
                                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                                    onClick={() => toggleState(state.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">🏛️</span>
                                        <div>
                                            <span className="font-bold text-white">{state.name}</span>
                                            <span className="text-xs text-slate-400 ml-2">
                                                ({state.districts?.length || 0} districts) • {state.gyms_count || 0} gyms
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openAddModal('district', state.id);
                                            }}
                                            className="text-xs text-amber-400 hover:text-amber-300 transition px-2 py-1 rounded-lg hover:bg-amber-500/10"
                                            title="Add District"
                                        >
                                            + Add District
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openDeleteModal('state', state.id, state.name);
                                            }}
                                            disabled={isProcessing}
                                            className="text-xs text-rose-400 hover:text-rose-300 transition px-2 py-1 rounded-lg hover:bg-rose-500/10 disabled:opacity-50"
                                            title="Delete State"
                                        >
                                            Delete
                                        </button>
                                        <span className="text-slate-500 text-sm ml-2">
                                            {expandedStates[state.id] ? '▼' : '▶'}
                                        </span>
                                    </div>
                                </div>

                                {/* Districts */}
                                {expandedStates[state.id] && (
                                    <div className="border-t border-white/5 p-4 pl-10 space-y-2">
                                        {state.districts && state.districts.length > 0 ? (
                                            state.districts.map((district) => (
                                                <div key={district.id} className="glass-card rounded-xl overflow-hidden backdrop-blur-xl bg-white/3 border-white/5">
                                                    {/* District Header */}
                                                    <div 
                                                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors"
                                                        onClick={() => toggleDistrict(state.id, district.id)}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-lg">📍</span>
                                                            <div>
                                                                <span className="font-semibold text-white text-sm">{district.name}</span>
                                                                <span className="text-xs text-slate-400 ml-2">
                                                                    ({district.cities?.length || 0} cities)
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openAddModal('city', district.id);
                                                                }}
                                                                className="text-xs text-amber-400 hover:text-amber-300 transition px-2 py-1 rounded-lg hover:bg-amber-500/10"
                                                                title="Add City"
                                                            >
                                                                + Add City
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openDeleteModal('district', district.id, district.name, state.name);
                                                                }}
                                                                disabled={isProcessing}
                                                                className="text-xs text-rose-400 hover:text-rose-300 transition px-2 py-1 rounded-lg hover:bg-rose-500/10 disabled:opacity-50"
                                                                title="Delete District"
                                                            >
                                                                Delete
                                                            </button>
                                                            <span className="text-slate-500 text-sm ml-2">
                                                                {expandedDistricts[`${state.id}-${district.id}`] ? '▼' : '▶'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Cities */}
                                                    {expandedDistricts[`${state.id}-${district.id}`] && (
                                                        <div className="border-t border-white/5 p-3 pl-10 space-y-1">
                                                            {district.cities && district.cities.length > 0 ? (
                                                                district.cities.map((city) => (
                                                                    <div 
                                                                        key={city.id} 
                                                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors"
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="text-lg">🏙️</span>
                                                                            <span className="text-sm text-white">{city.name}</span>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => openDeleteModal('city', city.id, city.name, district.name)}
                                                                            disabled={isProcessing}
                                                                            className="text-xs text-rose-400 hover:text-rose-300 transition px-2 py-0.5 rounded-lg hover:bg-rose-500/10 disabled:opacity-50"
                                                                            title="Delete City"
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="text-center py-4">
                                                                    <p className="text-xs text-slate-500">No cities in this district yet.</p>
                                                                    <button
                                                                        onClick={() => openAddModal('city', district.id)}
                                                                        className="mt-2 text-xs text-amber-400 hover:text-amber-300 transition"
                                                                    >
                                                                        + Add City
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4">
                                                <p className="text-xs text-slate-500">No districts in this state yet.</p>
                                                <button
                                                    onClick={() => openAddModal('district', state.id)}
                                                    className="mt-2 text-xs text-amber-400 hover:text-amber-300 transition"
                                                >
                                                    + Add District
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-4">🗺️</div>
                            <h3 className="text-lg font-bold text-white mb-2">No Locations Yet</h3>
                            <p className="text-sm text-slate-400 max-w-md mx-auto">
                                Start by adding your first state to begin building the location hierarchy.
                            </p>
                            <button
                                onClick={() => openAddModal('state')}
                                className="mt-4 inline-block bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20"
                            >
                                + Add First State
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        💡
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Location Management Tips</h3>
                        <ul className="mt-2 space-y-1 text-xs text-slate-400">
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">Hierarchy:</strong> States contain districts, which contain cities</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">Deletion:</strong> Locations with gyms assigned cannot be deleted</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">Expansion:</strong> Click on any location to expand and view child locations</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <span><strong className="text-white">Stats:</strong> Gym counts show how many gyms are in each state</span>
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

                        {/* Parent Info */}
                        {selectedParent && modalType !== 'state' && (
                            <div className="mb-4 p-3 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                <p className="text-xs text-slate-400">Adding to:</p>
                                <p className="text-sm font-semibold text-white">{getParentName()}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Name <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
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

                        {/* Parent Info */}
                        {deleteData?.parentName && (
                            <div className="mb-6 p-3 bg-slate-800/30 rounded-xl border border-slate-700/50">
                                <p className="text-xs text-slate-400">Parent Location:</p>
                                <p className="text-sm font-semibold text-white">{deleteData.parentName}</p>
                            </div>
                        )}

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