import React, { useState, useEffect } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Edit({ gym, states, districts, cities, facilities, categories }) {
    const [formData, setFormData] = useState({
        name: gym?.name || '',
        slug: gym?.slug || '',
        description: gym?.description || '',
        address: gym?.address || '',
        state_id: gym?.state_id || '',
        district_id: gym?.district_id || '',
        city_id: gym?.city_id || '',
        latitude: gym?.latitude || '',
        longitude: gym?.longitude || '',
        whatsapp_number: gym?.whatsapp_number || '',
        phone_number: gym?.phone_number || '',
        email: gym?.email || '',
        website: gym?.website || '',
        google_maps_url: gym?.google_maps_url || '',
        facility_ids: gym?.facilities?.map(f => f.id) || [],
        category_ids: gym?.categories?.map(c => c.id) || [],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Filter districts and cities based on selections
    const [filteredDistricts, setFilteredDistricts] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);

    useEffect(() => {
        if (formData.state_id) {
            setFilteredDistricts(districts.filter(d => d.state_id === parseInt(formData.state_id)));
        } else {
            setFilteredDistricts([]);
        }
        // Only reset if the current district doesn't belong to the new state
        const currentDistrict = districts.find(d => d.id === parseInt(formData.district_id));
        if (currentDistrict && currentDistrict.state_id !== parseInt(formData.state_id)) {
            setFormData(prev => ({ ...prev, district_id: '', city_id: '' }));
            setFilteredCities([]);
        }
    }, [formData.state_id]);

    useEffect(() => {
        if (formData.district_id) {
            setFilteredCities(cities.filter(c => c.district_id === parseInt(formData.district_id)));
        } else {
            setFilteredCities([]);
        }
        const currentCity = cities.find(c => c.id === parseInt(formData.city_id));
        if (currentCity && currentCity.district_id !== parseInt(formData.district_id)) {
            setFormData(prev => ({ ...prev, city_id: '' }));
        }
    }, [formData.district_id]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            if (name === 'facility_ids') {
                setFormData(prev => ({
                    ...prev,
                    facility_ids: checked 
                        ? [...prev.facility_ids, parseInt(value)]
                        : prev.facility_ids.filter(id => id !== parseInt(value))
                }));
            } else if (name === 'category_ids') {
                setFormData(prev => ({
                    ...prev,
                    category_ids: checked 
                        ? [...prev.category_ids, parseInt(value)]
                        : prev.category_ids.filter(id => id !== parseInt(value))
                }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        router.put(route('admin.gyms.update', gym.id), formData, {
            onError: (errors) => {
                setErrors(errors);
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    // Custom select styles
    const selectStyles = "w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white";

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfigs = {
            approved: { label: '✅ Live', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' },
            pending: { label: '⏳ Pending Approval', color: 'bg-amber-500/20 text-amber-400 border-amber-500/20' },
            rejected: { label: '❌ Rejected', color: 'bg-rose-500/20 text-rose-400 border-rose-500/20' },
            suspended: { label: '⛔ Suspended', color: 'bg-red-500/20 text-red-400 border-red-500/20' },
        };
        return statusConfigs[status] || statusConfigs.pending;
    };

    const statusConfig = getStatusBadge(gym?.status);

    return (
        <AdminLayout>
            <Head title={`Edit ${gym?.name || 'Gym'}`} />
            
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
                        ✏️ Edit Gym
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                        Edit <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">{gym?.name || 'Gym'}</span>
                    </h1>
                    <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                        Update gym details, manage facilities, categories, and listing information.
                    </p>
                </div>

                {/* Status Banner */}
                <div className={`mb-6 p-4 rounded-xl border ${statusConfig.color} bg-opacity-5 flex items-start gap-3`}>
                    <span className="text-lg">📌</span>
                    <div>
                        <p className="text-sm font-semibold text-white">
                            Listing Status: <span className={statusConfig.color}>{statusConfig.label}</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {gym?.status === 'approved' 
                                ? 'This gym is live and visible to the public.'
                                : gym?.status === 'pending'
                                    ? 'This gym is pending approval. Review before publishing.'
                                    : 'This gym is not currently visible to the public.'}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="glass-card rounded-2xl p-6 sm:p-8 backdrop-blur-xl bg-white/5 border-white/10">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Information */}
                        <div>
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                <span>📋</span> Basic Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Gym Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        Gym Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        placeholder="Enter gym name"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                            <span>⚠️</span> {errors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Slug */}
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        Slug <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        placeholder="gym-name"
                                        required
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        URL-friendly version of the gym name
                                    </p>
                                    {errors.slug && (
                                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                            <span>⚠️</span> {errors.slug}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mt-4">
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="4"
                                    className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                    placeholder="Describe the gym, what makes it special, and what members can expect..."
                                />
                                {errors.description && (
                                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                        <span>⚠️</span> {errors.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                <span>📍</span> Location
                            </h2>
                            
                            {/* Address */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Address <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    rows="2"
                                    className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                    placeholder="Enter full address"
                                    required
                                />
                                {errors.address && (
                                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                        <span>⚠️</span> {errors.address}
                                    </p>
                                )}
                            </div>

                            {/* State, District, City */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        State <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        name="state_id"
                                        value={formData.state_id}
                                        onChange={handleInputChange}
                                        className={selectStyles}
                                        required
                                    >
                                        <option value="">Select State</option>
                                        {states?.map((state) => (
                                            <option key={state.id} value={state.id}>
                                                {state.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.state_id && (
                                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                            <span>⚠️</span> {errors.state_id}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        District <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        name="district_id"
                                        value={formData.district_id}
                                        onChange={handleInputChange}
                                        className={selectStyles}
                                        required
                                        disabled={!formData.state_id}
                                    >
                                        <option value="">Select District</option>
                                        {filteredDistricts?.map((district) => (
                                            <option key={district.id} value={district.id}>
                                                {district.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.district_id && (
                                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                            <span>⚠️</span> {errors.district_id}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        City <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        name="city_id"
                                        value={formData.city_id}
                                        onChange={handleInputChange}
                                        className={selectStyles}
                                        required
                                        disabled={!formData.district_id}
                                    >
                                        <option value="">Select City</option>
                                        {filteredCities?.map((city) => (
                                            <option key={city.id} value={city.id}>
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.city_id && (
                                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                            <span>⚠️</span> {errors.city_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Latitude & Longitude */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        Latitude
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="latitude"
                                        value={formData.latitude}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        placeholder="e.g. 4.5975"
                                    />
                                    {errors.latitude && (
                                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                            <span>⚠️</span> {errors.latitude}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        Longitude
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="longitude"
                                        value={formData.longitude}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        placeholder="e.g. 101.0901"
                                    />
                                    {errors.longitude && (
                                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                            <span>⚠️</span> {errors.longitude}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                <span>📞</span> Contact Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        name="phone_number"
                                        value={formData.phone_number}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        placeholder="e.g. 012-3456789"
                                    />
                                    {errors.phone_number && (
                                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                            <span>⚠️</span> {errors.phone_number}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        WhatsApp Number
                                    </label>
                                    <input
                                        type="text"
                                        name="whatsapp_number"
                                        value={formData.whatsapp_number}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        placeholder="e.g. 60123456789"
                                    />
                                    {errors.whatsapp_number && (
                                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                            <span>⚠️</span> {errors.whatsapp_number}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="mt-4">
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                    placeholder="gym@example.com"
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                        <span>⚠️</span> {errors.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Website & Maps */}
                        <div>
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                <span>🌐</span> Website & Maps
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        placeholder="https://www.yourgym.com"
                                    />
                                    {errors.website && (
                                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                            <span>⚠️</span> {errors.website}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        Google Maps URL
                                    </label>
                                    <input
                                        type="url"
                                        name="google_maps_url"
                                        value={formData.google_maps_url}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        placeholder="https://maps.google.com/..."
                                    />
                                    {errors.google_maps_url && (
                                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                            <span>⚠️</span> {errors.google_maps_url}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Facilities & Categories */}
                        <div>
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                <span>🏷️</span> Facilities & Categories
                            </h2>
                            
                            {/* Facilities */}
                            {facilities?.length > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-semibold text-white mb-3">
                                        Facilities
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {facilities.map((facility) => (
                                            <label
                                                key={facility.id}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all text-sm ${
                                                    formData.facility_ids.includes(facility.id)
                                                        ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-lg shadow-amber-500/10'
                                                        : 'border-slate-700/50 text-slate-400 hover:border-slate-600 hover:bg-white/5'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    name="facility_ids"
                                                    value={facility.id}
                                                    checked={formData.facility_ids.includes(facility.id)}
                                                    onChange={handleInputChange}
                                                    className="hidden"
                                                />
                                                <span className="text-sm font-medium">{facility.name}</span>
                                                {formData.facility_ids.includes(facility.id) && (
                                                    <span className="text-amber-400">✓</span>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                    {errors.facility_ids && (
                                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                            <span>⚠️</span> {errors.facility_ids}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Categories */}
                            {categories?.length > 0 && (
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-3">
                                        Categories
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((category) => (
                                            <label
                                                key={category.id}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all text-sm ${
                                                    formData.category_ids.includes(category.id)
                                                        ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-lg shadow-amber-500/10'
                                                        : 'border-slate-700/50 text-slate-400 hover:border-slate-600 hover:bg-white/5'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    name="category_ids"
                                                    value={category.id}
                                                    checked={formData.category_ids.includes(category.id)}
                                                    onChange={handleInputChange}
                                                    className="hidden"
                                                />
                                                <span className="text-sm font-medium">{category.name}</span>
                                                {formData.category_ids.includes(category.id) && (
                                                    <span className="text-amber-400">✓</span>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                    {errors.category_ids && (
                                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                            <span>⚠️</span> {errors.category_ids}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Last Updated Info */}
                        <div className="text-xs text-slate-500 flex items-center gap-2 pt-2 border-t border-white/5">
                            <span>🕐</span>
                            <span>Last updated: {gym?.updated_at ? new Date(gym.updated_at).toLocaleDateString() : 'N/A'}</span>
                            <span className="text-slate-600">•</span>
                            <span>Status: {gym?.status || 'N/A'}</span>
                            <span className="text-slate-600">•</span>
                            <span>ID: #{gym?.id}</span>
                        </div>

                        {/* Submit Button */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10">
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
                                href={route('admin.gyms.show', gym.id)}
                                className="flex-1 text-center text-sm font-semibold text-white/60 hover:text-white px-6 py-3 rounded-xl transition-all hover:bg-white/5"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Danger Zone */}
                <div className="mt-8 glass-card rounded-2xl p-6 backdrop-blur-xl bg-rose-500/5 border-rose-500/20">
                    <div className="flex items-start gap-4">
                        <div className="text-2xl">⚠️</div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-rose-400">Danger Zone</h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Permanently delete this gym listing and all associated data. This action cannot be undone.
                            </p>
                            <button
                                onClick={() => {
                                    if (confirm(`Are you sure you want to permanently delete "${gym?.name}"? This action cannot be undone.`)) {
                                        router.delete(route('admin.gyms.destroy', gym.id));
                                    }
                                }}
                                className="mt-3 inline-flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white font-bold px-4 py-2 rounded-xl transition-all border border-rose-500/20 text-xs"
                            >
                                🗑️ Delete Gym
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
