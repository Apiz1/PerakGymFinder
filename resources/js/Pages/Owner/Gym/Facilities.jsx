import React, { useState, useEffect } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import OwnerLayout from '@/Layouts/OwnerLayout';

export default function Facilities({ 
    gym, 
    facilities = [], 
    categories = [], 
    selectedFacilityIds = [], 
    selectedCategoryIds = [] 
}) {
    const [selectedFacilities, setSelectedFacilities] = useState(selectedFacilityIds || []);
    const [selectedCategories, setSelectedCategories] = useState(selectedCategoryIds || []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState(null);
    const [searchFacility, setSearchFacility] = useState('');
    const [searchCategory, setSearchCategory] = useState('');

    // Auto-hide notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const toggleFacility = (facilityId) => {
        setSelectedFacilities(prev => 
            prev.includes(facilityId)
                ? prev.filter(id => id !== facilityId)
                : [...prev, facilityId]
        );
    };

    const toggleCategory = (categoryId) => {
        setSelectedCategories(prev => 
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        router.put('/owner/gym/facilities', {
            facility_ids: selectedFacilities,
            category_ids: selectedCategories
        }, {
            onSuccess: () => {
                setIsSubmitting(false);
                setNotification({
                    type: 'success',
                    message: 'Facilities and categories updated successfully!'
                });
            },
            onError: (errors) => {
                setIsSubmitting(false);
                setErrors(errors);
                setNotification({
                    type: 'error',
                    message: 'Failed to update. Please try again.'
                });
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const closeNotification = () => {
        setNotification(null);
    };

    // Filter facilities based on search
    const filteredFacilities = facilities.filter(facility =>
        facility.name.toLowerCase().includes(searchFacility.toLowerCase())
    );

    // Filter categories based on search
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchCategory.toLowerCase())
    );

    return (
        <>
            <Head title="Facilities & Categories" />
            
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
                        🏷️ Facilities & Categories
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                        Manage <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Tags</span>
                    </h1>
                    <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                        Select the facilities your gym offers and the categories that best describe your gym.
                    </p>
                </div>

                {/* Stats Bar */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🏋️</span>
                            <div>
                                <span className="text-xs text-slate-400">Facilities</span>
                                <p className="text-sm font-bold text-white">
                                    {selectedFacilities.length} / {facilities.length} selected
                                </p>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-800"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">📂</span>
                            <div>
                                <span className="text-xs text-slate-400">Categories</span>
                                <p className="text-sm font-bold text-white">
                                    {selectedCategories.length} / {categories.length} selected
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-xs text-slate-400">
                            <span className="text-emerald-400">●</span> Selected
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="glass-card rounded-2xl p-6 sm:p-8 backdrop-blur-xl bg-white/5 border-white/10">
                    <form onSubmit={handleSubmit}>
                        {/* Facilities Section */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <span>🏋️</span> Facilities
                                </h2>
                                <span className="text-xs text-slate-500">
                                    {selectedFacilities.length} selected
                                </span>
                            </div>

                            {/* Search */}
                            <div className="relative mb-4">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    value={searchFacility}
                                    onChange={(e) => setSearchFacility(e.target.value)}
                                    placeholder="Search facilities..."
                                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                />
                            </div>

                            {/* Facilities Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {filteredFacilities.length > 0 ? (
                                    filteredFacilities.map((facility) => (
                                        <button
                                            key={facility.id}
                                            type="button"
                                            onClick={() => toggleFacility(facility.id)}
                                            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm ${
                                                selectedFacilities.includes(facility.id)
                                                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/10'
                                                    : 'border-slate-700/50 text-slate-400 hover:border-slate-600 hover:bg-white/5'
                                            }`}
                                        >
                                            <span className="text-lg">{facility.icon || '🏋️'}</span>
                                            <span className="font-medium">{facility.name}</span>
                                            {selectedFacilities.includes(facility.id) && (
                                                <span className="ml-auto text-emerald-400">✓</span>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-8 text-slate-500">
                                        <p className="text-sm">No facilities found matching your search.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-white/10 my-8"></div>

                        {/* Categories Section */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center gap-2">
                                    <span>📂</span> Categories
                                </h2>
                                <span className="text-xs text-slate-500">
                                    {selectedCategories.length} selected
                                </span>
                            </div>

                            {/* Search */}
                            <div className="relative mb-4">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    value={searchCategory}
                                    onChange={(e) => setSearchCategory(e.target.value)}
                                    placeholder="Search categories..."
                                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                />
                            </div>

                            {/* Categories Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {filteredCategories.length > 0 ? (
                                    filteredCategories.map((category) => (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => toggleCategory(category.id)}
                                            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all text-sm ${
                                                selectedCategories.includes(category.id)
                                                    ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-lg shadow-amber-500/10'
                                                    : 'border-slate-700/50 text-slate-400 hover:border-slate-600 hover:bg-white/5'
                                            }`}
                                        >
                                            <span className="font-medium">{category.name}</span>
                                            {selectedCategories.includes(category.id) && (
                                                <span className="text-amber-400">✓</span>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-8 text-slate-500">
                                        <p className="text-sm">No categories found matching your search.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-6 border-t border-white/10">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Saving Changes...
                                    </span>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                            <Link
                                href="/owner/dashboard"
                                className="flex-1 text-center text-sm font-semibold text-white/60 hover:text-white px-6 py-3 rounded-xl transition-all hover:bg-white/5"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Tips Box */}
                <div className="mt-8 glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                    <div className="flex items-start gap-4">
                        <div className="text-2xl">💡</div>
                        <div>
                            <h3 className="text-sm font-bold text-white">Tips for facilities & categories</h3>
                            <ul className="mt-2 space-y-1 text-xs text-slate-400">
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span>Select all facilities your gym actually offers to help users find you</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span>Choose categories that best represent your gym's specialty</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span>Be specific - users often filter by these tags when searching</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400">•</span>
                                    <span>Update tags whenever you add new equipment or services</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Persistent Layout Setup
Facilities.layout = (page) => <OwnerLayout>{page}</OwnerLayout>;