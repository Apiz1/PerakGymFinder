import React, { useState, useEffect } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

export default function Create({ unclaimedGyms, states, districts, cities, facilities, categories }) {
    const [applicationType, setApplicationType] = useState('claim');
    const [selectedGym, setSelectedGym] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        state_id: '',
        district_id: '',
        city_id: '',
        whatsapp_number: '',
        phone_number: '',
        description: '',
        facilities: [],
        categories: [],
    });
    const [businessDoc, setBusinessDoc] = useState(null);
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
    }, [formData.state_id, districts]);

    useEffect(() => {
        if (formData.district_id) {
            setFilteredCities(cities.filter(c => c.district_id === parseInt(formData.district_id)));
        } else {
            setFilteredCities([]);
        }
        setFormData(prev => ({ ...prev, city_id: '' }));
    }, [formData.district_id, cities]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            if (name === 'facilities') {
                setFormData(prev => ({
                    ...prev,
                    facilities: checked 
                        ? [...prev.facilities, parseInt(value)]
                        : prev.facilities.filter(id => id !== parseInt(value))
                }));
            } else if (name === 'categories') {
                setFormData(prev => ({
                    ...prev,
                    categories: checked 
                        ? [...prev.categories, parseInt(value)]
                        : prev.categories.filter(id => id !== parseInt(value))
                }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, business_doc: 'File size must be less than 5MB' }));
                return;
            }
            if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
                setErrors(prev => ({ ...prev, business_doc: 'Only PDF, JPG, JPEG, and PNG files are allowed' }));
                return;
            }
            setBusinessDoc(file);
            setErrors(prev => ({ ...prev, business_doc: null }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const formDataObj = new FormData();
        
        // Add basic fields
        formDataObj.append('application_type', applicationType);
        if (businessDoc) {
            formDataObj.append('business_doc', businessDoc);
        }

        if (applicationType === 'claim') {
            formDataObj.append('gym_id', selectedGym);
        } else {
            formDataObj.append('name', formData.name);
            formDataObj.append('address', formData.address);
            formDataObj.append('state_id', formData.state_id);
            formDataObj.append('district_id', formData.district_id);
            formDataObj.append('city_id', formData.city_id);
            formDataObj.append('whatsapp_number', formData.whatsapp_number);
            formDataObj.append('phone_number', formData.phone_number);
            formDataObj.append('description', formData.description);
            
            // Add facilities and categories
            formData.facilities.forEach(id => {
                formDataObj.append('facilities[]', id);
            });
            formData.categories.forEach(id => {
                formDataObj.append('categories[]', id);
            });
        }

        router.post('/apply-owner', formDataObj, {
            onError: (errors) => {
                setErrors(errors);
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const selectedGymData = unclaimedGyms?.find(g => g.id === parseInt(selectedGym));

    // Custom select styles to fix visibility
    const selectStyles = "w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none cursor-pointer [&>option]:bg-slate-900 [&>option]:text-white";

    return (
        <MainLayout>
            <Head title="Become a Gym Owner" />
            
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
                        🏪 Gym Owner Application
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
                        Become a <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Gym Owner</span>
                    </h1>
                    <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                        Apply to manage a gym listing on GymFinder Perak. You can claim an existing unclaimed gym 
                        or submit a brand new gym to our directory.
                    </p>
                </div>

                {/* Application Form */}
                <div className="glass-card rounded-2xl p-6 sm:p-8 backdrop-blur-xl bg-white/5 border-white/10">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Application Type Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-3">
                                Application Type
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setApplicationType('claim');
                                        setSelectedGym('');
                                    }}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                                        applicationType === 'claim'
                                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/20'
                                            : 'border-slate-700/50 text-slate-400 hover:border-slate-600 hover:bg-white/5'
                                    }`}
                                >
                                    <div className="text-2xl mb-2">📋</div>
                                    <div className="font-bold text-sm">Claim Existing Gym</div>
                                    <div className="text-xs mt-1 opacity-70">Take over an unclaimed gym listing</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setApplicationType('new');
                                        setSelectedGym('');
                                    }}
                                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                                        applicationType === 'new'
                                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/20'
                                            : 'border-slate-700/50 text-slate-400 hover:border-slate-600 hover:bg-white/5'
                                    }`}
                                >
                                    <div className="text-2xl mb-2">🏗️</div>
                                    <div className="font-bold text-sm">Register New Gym</div>
                                    <div className="text-xs mt-1 opacity-70">Add a brand new gym to the directory</div>
                                </button>
                            </div>
                        </div>

                        {/* Claim Existing Gym */}
                        {applicationType === 'claim' && (
                            <div>
                                <label className="block text-sm font-semibold text-white mb-2">
                                    Select a Gym to Claim <span className="text-red-400">*</span>
                                </label>
                                <select
                                    value={selectedGym}
                                    onChange={(e) => setSelectedGym(e.target.value)}
                                    className={selectStyles}
                                    required
                                >
                                    <option value="">Select a gym...</option>
                                    {unclaimedGyms?.map((gym) => (
                                        <option key={gym.id} value={gym.id}>
                                            {gym.name} - {gym.address}
                                        </option>
                                    ))}
                                </select>
                                {selectedGymData && (
                                    <div className="mt-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <span className="text-emerald-400">🏋️</span>
                                            <div>
                                                <p className="text-sm font-semibold text-white">{selectedGymData.name}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{selectedGymData.address}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {unclaimedGyms?.length === 0 && (
                                    <div className="mt-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                        <p className="text-xs text-amber-400 flex items-center gap-2">
                                            <span>⚠️</span>
                                            No unclaimed gyms available. Please register a new gym instead.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* New Gym Details */}
                        {applicationType === 'new' && (
                            <div className="space-y-6">
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
                                            className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                            placeholder="Enter gym name"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                                <span>⚠️</span> {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label className="block text-sm font-semibold text-white mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="text"
                                            name="phone_number"
                                            value={formData.phone_number}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                            placeholder="e.g. 012-3456789"
                                        />
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        Address <span className="text-red-400">*</span>
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows="2"
                                        className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        placeholder="Enter full address"
                                        required
                                    />
                                    {errors.address && (
                                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                            <span>⚠️</span> {errors.address}
                                        </p>
                                    )}
                                </div>

                                {/* Location Selection */}
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

                                {/* WhatsApp Number */}
                                <div>
                                    <label className="block text-sm font-semibold text-white mb-2">
                                        WhatsApp Number
                                    </label>
                                    <input
                                        type="text"
                                        name="whatsapp_number"
                                        value={formData.whatsapp_number}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        placeholder="e.g. 60123456789"
                                    />
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
                                        className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        placeholder="Describe your gym, facilities, and what makes it special..."
                                    />
                                </div>

                                {/* Facilities */}
                                {facilities?.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-semibold text-white mb-3">
                                            Facilities
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {facilities.map((facility) => (
                                                <label
                                                    key={facility.id}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all text-sm ${
                                                        formData.facilities.includes(facility.id)
                                                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/10'
                                                            : 'border-slate-700/50 text-slate-400 hover:border-slate-600 hover:bg-white/5'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        name="facilities"
                                                        value={facility.id}
                                                        checked={formData.facilities.includes(facility.id)}
                                                        onChange={handleInputChange}
                                                        className="hidden"
                                                    />
                                                    <span className="text-sm font-medium">{facility.name}</span>
                                                    {formData.facilities.includes(facility.id) && (
                                                        <span className="text-emerald-400">✓</span>
                                                    )}
                                                </label>
                                            ))}
                                        </div>
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
                                                        formData.categories.includes(category.id)
                                                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/10'
                                                            : 'border-slate-700/50 text-slate-400 hover:border-slate-600 hover:bg-white/5'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        name="categories"
                                                        value={category.id}
                                                        checked={formData.categories.includes(category.id)}
                                                        onChange={handleInputChange}
                                                        className="hidden"
                                                    />
                                                    <span className="text-sm font-medium">{category.name}</span>
                                                    {formData.categories.includes(category.id) && (
                                                        <span className="text-emerald-400">✓</span>
                                                    )}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Business Document Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Business Document <span className="text-red-400">*</span>
                                <span className="text-xs text-slate-400 font-normal block mt-1">
                                    Upload your SSM registration, business license, or any official document 
                                    proving your business ownership (PDF, JPG, PNG - Max 5MB)
                                </span>
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                    className="w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-400 transition-all cursor-pointer"
                                    required
                                />
                            </div>
                            {businessDoc && (
                                <div className="mt-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                    <p className="text-xs text-emerald-400 flex items-center gap-2">
                                        <span>✅</span>
                                        <span className="font-medium">{businessDoc.name}</span>
                                        <span className="text-slate-400">({(businessDoc.size / 1024).toFixed(1)} KB)</span>
                                    </p>
                                </div>
                            )}
                            {errors.business_doc && (
                                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                    <span>⚠️</span> {errors.business_doc}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Submitting...
                                    </span>
                                ) : (
                                    'Submit Application'
                                )}
                            </button>
                            <Link
                                href="/"
                                className="flex-1 text-center text-sm font-semibold text-white/60 hover:text-white px-6 py-3.5 rounded-xl transition-all hover:bg-white/5"
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
                                After submitting your application, our admin team will review your submission 
                                and business document. You'll receive a notification once your application is 
                                approved or rejected. This process typically takes 1-3 business days.
                            </p>
                            <Link 
                                href="/apply-owner/status" 
                                className="inline-block mt-3 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                Check application status →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}