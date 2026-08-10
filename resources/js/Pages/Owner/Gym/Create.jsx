import React, { useState, useEffect } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import OwnerLayout from '@/Layouts/OwnerLayout';

export default function Create({ prefill, states, districts, cities, facilities, categories }) {
    const [formData, setFormData] = useState({
        name: prefill?.name || '',
        description: prefill?.description || '',
        address: prefill?.address || '',
        state_id: prefill?.state_id || '',
        district_id: prefill?.district_id || '',
        city_id: prefill?.city_id || '',
        whatsapp_number: prefill?.whatsapp_number || '',
        phone_number: prefill?.phone_number || '',
        email: '',
        facility_ids: [],
        category_ids: [],
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
        setFormData(prev => ({ ...prev, district_id: '', city_id: '' }));
        setFilteredCities([]);
    }, [formData.state_id]);

    useEffect(() => {
        if (formData.district_id) {
            setFilteredCities(cities.filter(c => c.district_id === parseInt(formData.district_id)));
        } else {
            setFilteredCities([]);
        }
        setFormData(prev => ({ ...prev, city_id: '' }));
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

        router.post('/owner/gym', formData, {
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

    // Check if prefill data exists (from approved application)
    const hasPrefill = !!prefill;

    return (
        <>
            <Head title="Create Your Gym" />
            
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
                        🏗️ Create Your Gym
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                        Set Up Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Gym Listing</span>
                    </h1>
                    <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                        {hasPrefill 
                            ? 'Great! We\'ve pre-filled some details from your approved application. Review and complete your gym listing.'
                            : 'Fill in your gym details to create your listing on GymFinder Perak. Once submitted, it will be reviewed by our admin team.'
                        }
                    </p>
                </div>

                {/* Prefill Notice */}
                {hasPrefill && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                        <span className="text-emerald-400 text-lg">✅</span>
                        <div>
                            <p className="text-sm font-semibold text-emerald-400">Application Pre-filled</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Your approved application details have been pre-filled below. Please review and complete any missing information.
                            </p>
                        </div>
                    </div>
                )}

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

                                {/* Email */}
                                <div>
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

                            {/* Description */}
                            <div className="mt-4">
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                    placeholder="Describe your gym, what makes it special, and what members can expect..."
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
                                        Creating Gym...
                                    </span>
                                ) : (
                                    'Create Your Gym'
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

                {/* Info Box */}
                <div className="mt-8 glass-card rounded-2xl p-6 backdrop-blur-xl bg-white/5 border-white/10">
                    <div className="flex items-start gap-4">
                        <div className="text-2xl">ℹ️</div>
                        <div>
                            <h3 className="text-sm font-bold text-white">What happens next?</h3>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                Once you submit your gym listing, our admin team will review it for quality and accuracy. 
                                You'll receive a notification once your gym is approved. This process typically takes 1-3 business days.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                                <span>📋 Fill in details</span>
                                <span>📸 Add photos later</span>
                                <span>⏰ Set operating hours</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Persistent Layout Setup - This is the only place the layout should be applied
Create.layout = (page) => <OwnerLayout>{page}</OwnerLayout>;