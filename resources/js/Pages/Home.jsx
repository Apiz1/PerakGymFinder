import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import MainLayout from '@/Layouts/MainLayout';

export default function Home({ 
    gyms = {}, 
    filters = {}, 
    states = [], 
    districts = [], 
    cities = [], 
    categories = [], 
    facilities = [] 
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category_ids?.[0] || '');
    const [selectedState, setSelectedState] = useState(filters.state_id || '');
    const [selectedDistrict, setSelectedDistrict] = useState(filters.district_id || '');
    const [selectedCity, setSelectedCity] = useState(filters.city_id || '');
    const [selectedFacilities, setSelectedFacilities] = useState(filters.facility_ids || []);
    const [isLoading, setIsLoading] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [sortBy, setSortBy] = useState(filters.sort || 'rating');
    const [showMoreFilters, setShowMoreFilters] = useState(false);
    const [backgroundIndex, setBackgroundIndex] = useState(0);
    const [gymImages, setGymImages] = useState({});

    // Random background configurations
    const backgrounds = useMemo(() => [
        {
            gradient: 'from-blue-900 via-purple-900 to-pink-900',
            pattern: 'dots',
            accent: 'from-blue-400 via-purple-500 to-pink-500',
            glowColor: 'rgba(139, 92, 246, 0.15)'
        },
        {
            gradient: 'from-emerald-900 via-teal-900 to-cyan-900',
            pattern: 'grid',
            accent: 'from-emerald-400 via-teal-500 to-cyan-500',
            glowColor: 'rgba(16, 185, 129, 0.15)'
        },
        {
            gradient: 'from-amber-900 via-orange-900 to-red-900',
            pattern: 'circles',
            accent: 'from-amber-400 via-orange-500 to-red-500',
            glowColor: 'rgba(245, 158, 11, 0.15)'
        },
        {
            gradient: 'from-indigo-900 via-blue-900 to-cyan-900',
            pattern: 'waves',
            accent: 'from-indigo-400 via-blue-500 to-cyan-500',
            glowColor: 'rgba(99, 102, 241, 0.15)'
        },
        {
            gradient: 'from-rose-900 via-pink-900 to-fuchsia-900',
            pattern: 'squares',
            accent: 'from-rose-400 via-pink-500 to-fuchsia-500',
            glowColor: 'rgba(244, 63, 94, 0.15)'
        },
        {
            gradient: 'from-violet-900 via-purple-900 to-indigo-900',
            pattern: 'triangles',
            accent: 'from-violet-400 via-purple-500 to-indigo-500',
            glowColor: 'rgba(139, 92, 246, 0.15)'
        }
    ], []);

    // Unsplash Gym Images Collection
    const gymImageUrls = useMemo(() => [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1581009146145-b5b0502edc41?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1570829460005-c840387bb1ca?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=800&h=600&fit=crop',
    ], []);

    // Helper function to safely format rating
    const formatRating = (rating) => {
        if (rating === null || rating === undefined) return 'N/A';
        if (typeof rating === 'number') return rating.toFixed(1);
        const parsed = parseFloat(rating);
        return isNaN(parsed) ? 'N/A' : parsed.toFixed(1);
    };

    // Helper function to safely get numeric rating
    const getNumericRating = (rating) => {
        if (typeof rating === 'number') return rating;
        const parsed = parseFloat(rating);
        return isNaN(parsed) ? 0 : parsed;
    };

    // Get random image for a gym
    const getGymImage = (gymId) => {
        if (gymImages[gymId]) return gymImages[gymId];
        const index = gymId % gymImageUrls.length;
        const imageUrl = gymImageUrls[index];
        setGymImages(prev => ({ ...prev, [gymId]: imageUrl }));
        return imageUrl;
    };

    // Select random background on mount
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * backgrounds.length);
        setBackgroundIndex(randomIndex);
    }, []);

    const currentBg = backgrounds[backgroundIndex] || backgrounds[0];

    // Filter districts based on selected state
    const filteredDistricts = useMemo(() => {
        if (!selectedState) return districts;
        return districts.filter(d => d.state_id === parseInt(selectedState));
    }, [selectedState, districts]);

    // Filter cities based on selected district
    const filteredCities = useMemo(() => {
        if (!selectedDistrict) return cities;
        return cities.filter(c => c.district_id === parseInt(selectedDistrict));
    }, [selectedDistrict, cities]);

    // Debounced search for better UX
    const debouncedSearch = useCallback(
        debounce((term, category, state, district, city, facilities, sort) => {
            router.get(
                '/',
                { 
                    search: term, 
                    category_ids: category ? [category] : [],
                    state_id: state,
                    district_id: district,
                    city_id: city,
                    facility_ids: facilities,
                    sort: sort
                },
                { preserveState: true, replace: true }
            );
        }, 300),
        []
    );

    // Handle Search Submission with loading state
    const handleSearch = (e) => {
        e?.preventDefault();
        setIsLoading(true);
        router.get(
            '/',
            { 
                search: searchTerm, 
                category_ids: selectedCategory ? [selectedCategory] : [],
                state_id: selectedState,
                district_id: selectedDistrict,
                city_id: selectedCity,
                facility_ids: selectedFacilities,
                sort: sortBy
            },
            { 
                preserveState: true, 
                replace: true,
                onFinish: () => setIsLoading(false)
            }
        );
    };

    // Handle category filter
    const handleCategoryFilter = (categoryId) => {
        setSelectedCategory(categoryId);
        setIsLoading(true);
        router.get(
            '/',
            { 
                search: searchTerm, 
                category_ids: categoryId ? [categoryId] : [],
                state_id: selectedState,
                district_id: selectedDistrict,
                city_id: selectedCity,
                facility_ids: selectedFacilities,
                sort: sortBy
            },
            { 
                preserveState: true,
                onFinish: () => setIsLoading(false)
            }
        );
    };

    // Handle state change - reset district and city
    const handleStateChange = (stateId) => {
        setSelectedState(stateId);
        setSelectedDistrict('');
        setSelectedCity('');
        handleSearch(new Event('submit'));
    };

    // Handle district change - reset city
    const handleDistrictChange = (districtId) => {
        setSelectedDistrict(districtId);
        setSelectedCity('');
        handleSearch(new Event('submit'));
    };

    // Handle city change
    const handleCityChange = (cityId) => {
        setSelectedCity(cityId);
        handleSearch(new Event('submit'));
    };

    // Toggle facility selection
    const toggleFacility = (facilityId) => {
        setSelectedFacilities(prev => 
            prev.includes(facilityId)
                ? prev.filter(id => id !== facilityId)
                : [...prev, facilityId]
        );
    };

    // Handle sort change
    const handleSortChange = (sort) => {
        setSortBy(sort);
        setIsLoading(true);
        router.get(
            '/',
            { 
                search: searchTerm, 
                category_ids: selectedCategory ? [selectedCategory] : [],
                state_id: selectedState,
                district_id: selectedDistrict,
                city_id: selectedCity,
                facility_ids: selectedFacilities,
                sort: sort
            },
            { 
                preserveState: true,
                onFinish: () => setIsLoading(false)
            }
        );
    };

    // Clear all filters
    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedState('');
        setSelectedDistrict('');
        setSelectedCity('');
        setSelectedFacilities([]);
        setSearchTerm('');
        setSortBy('rating');
        router.get(
            '/',
            { sort: 'rating' },
            { preserveState: true, replace: true }
        );
    };

    // Extract Paginated Gym Items
    const gymList = gyms.data || [];

    // Quick stats calculation - FIXED
    const totalGyms = gyms.total || gymList.length;

    // Safely calculate average rating
    const avgRating = gymList.length > 0 
        ? gymList.reduce((acc, gym) => {
            const rating = getNumericRating(gym.average_rating);
            return acc + rating;
        }, 0) / gymList.length
        : 0;

    // Safely find top rated gym
    const topRatedGym = gymList.length > 0 ? gymList.reduce((a, b) => {
        const ratingA = getNumericRating(a.average_rating);
        const ratingB = getNumericRating(b.average_rating);
        return ratingA > ratingB ? a : b;
    }) : null;

    // Function to refresh background
    const refreshBackground = () => {
        const newIndex = (backgroundIndex + 1) % backgrounds.length;
        setBackgroundIndex(newIndex);
    };

    // Check if any filters are active
    const hasActiveFilters = selectedCategory || selectedState || selectedDistrict || selectedCity || selectedFacilities.length > 0 || searchTerm;

    // Helper to get gym show URL
    const getGymShowUrl = (gym) => {
        // Use the slug if available, otherwise use id
        if (gym.slug) {
            return `/gyms/${gym.slug}`;
        }
        return `/gyms/${gym.id}`;
    };

    return (
        <MainLayout>
            <div className="relative min-h-screen overflow-hidden">
                {/* Dynamic Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${currentBg.gradient} opacity-90`}></div>
                
                {/* Background Pattern Overlay */}
                <div className="absolute inset-0 opacity-10">
                    {currentBg.pattern === 'dots' && (
                        <div className="w-full h-full" style={{
                            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }}></div>
                    )}
                    {currentBg.pattern === 'grid' && (
                        <div className="w-full h-full" style={{
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                            backgroundSize: '50px 50px'
                        }}></div>
                    )}
                    {currentBg.pattern === 'circles' && (
                        <div className="w-full h-full" style={{
                            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                                            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
                                            radial-gradient(circle at 40% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
                            backgroundSize: '100% 100%'
                        }}></div>
                    )}
                    {currentBg.pattern === 'waves' && (
                        <div className="w-full h-full" style={{
                            backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 2px, 
                                            transparent 2px, transparent 8px)`,
                            backgroundSize: '20px 20px'
                        }}></div>
                    )}
                    {currentBg.pattern === 'squares' && (
                        <div className="w-full h-full" style={{
                            backgroundImage: `linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, 
                                            transparent 75%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1)),
                                            linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, 
                                            transparent 75%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1))`,
                            backgroundSize: '60px 60px',
                            backgroundPosition: '0 0, 30px 30px'
                        }}></div>
                    )}
                    {currentBg.pattern === 'triangles' && (
                        <div className="w-full h-full" style={{
                            backgroundImage: `polygon(0% 0%, 100% 0%, 50% 100%)`,
                            backgroundSize: '60px 60px'
                        }}></div>
                    )}
                </div>

                {/* Animated Floating Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full animate-float"
                            style={{
                                width: Math.random() * 6 + 2 + 'px',
                                height: Math.random() * 6 + 2 + 'px',
                                background: `rgba(255,255,255,${Math.random() * 0.3 + 0.1})`,
                                left: Math.random() * 100 + '%',
                                top: Math.random() * 100 + '%',
                                animationDuration: Math.random() * 20 + 10 + 's',
                                animationDelay: Math.random() * 10 + 's',
                                opacity: Math.random() * 0.5 + 0.3
                            }}
                        ></div>
                    ))}
                </div>

                {/* Glow Effects */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-3xl opacity-20"
                         style={{ background: currentBg.glowColor }}></div>
                    <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
                         style={{ background: currentBg.glowColor }}></div>
                    <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-10"
                         style={{ background: currentBg.glowColor }}></div>
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                    {/* Background Selector */}
                    <div className="fixed bottom-6 right-6 z-50 flex gap-2">
                        <button
                            onClick={refreshBackground}
                            className="glass-card px-4 py-2 rounded-xl text-xs font-semibold text-white hover:text-amber-400 transition-all hover:scale-105 backdrop-blur-xl flex items-center gap-2"
                            title="Change Background"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="hidden sm:inline">Change Theme</span>
                        </button>
                    </div>

                    {/* HERO SECTION */}
                    <div className="text-center max-w-4xl mx-auto pt-6 pb-8">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/90 text-xs font-bold uppercase tracking-wider mb-6 animate-pulse">
                            🏆 Malaysia • Perak Edition
                        </span>
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-tight drop-shadow-2xl">
                            Find Your Ultimate <br />
                            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentBg.accent} animate-gradient`}>
                                Iron Paradise
                            </span>
                        </h1>
                        <p className="text-white/80 text-base sm:text-lg mb-8 leading-relaxed max-w-2xl mx-auto drop-shadow-lg">
                            Explore local fitness centers, commercial gyms, and strength clubs in Perak 
                            with complete reviews, map directions, and WhatsApp contacts.
                        </p>

                        {/* STATS BADGES - FIXED */}
                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            <div className="glass-card px-6 py-3 rounded-xl backdrop-blur-xl bg-white/5 border-white/10">
                                <span className="text-2xl font-bold text-amber-400">{totalGyms}</span>
                                <span className="text-xs text-white/70 ml-2">Gyms</span>
                            </div>
                            <div className="glass-card px-6 py-3 rounded-xl backdrop-blur-xl bg-white/5 border-white/10">
                                <span className="text-2xl font-bold text-amber-400">
                                    {formatRating(avgRating)}
                                </span>
                                <span className="text-xs text-white/70 ml-2">⭐ Avg Rating</span>
                            </div>
                            {topRatedGym && (
                                <div className="glass-card px-6 py-3 rounded-xl backdrop-blur-xl bg-white/5 border-white/10">
                                    <span className="text-sm font-semibold text-white">🏆 {topRatedGym.name}</span>
                                    <span className="text-xs text-amber-400 ml-2">
                                        #{formatRating(topRatedGym.average_rating)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* CENTERED SEARCH BAR */}
                        <form onSubmit={handleSearch} className="hero-search-wrapper max-w-3xl mx-auto">
                            <div className="relative flex items-center">
                                <div className="absolute left-4 text-white/50">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        if (e.target.value.length > 2) {
                                            debouncedSearch(e.target.value, selectedCategory, selectedState, selectedDistrict, selectedCity, selectedFacilities, sortBy);
                                        }
                                    }}
                                    placeholder="Search by gym name, town, or district..."
                                    className="search-input w-full text-white placeholder-white/50 pl-12 pr-36 py-4 rounded-2xl text-sm sm:text-base focus:outline-none backdrop-blur-xl bg-black/30 border-white/20 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchTerm('');
                                            debouncedSearch('', selectedCategory, selectedState, selectedDistrict, selectedCity, selectedFacilities, sortBy);
                                        }}
                                        className="absolute right-28 text-white/50 hover:text-white transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="search-btn absolute right-2 text-white font-bold px-7 py-3 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 hover:scale-105"
                                >
                                    {isLoading ? 'Searching...' : 'Search'}
                                </button>
                            </div>
                        </form>

                        {/* POPULAR SEARCHES */}
                        <div className="mt-4">
                            <p className="text-xs text-white/50 mb-2">Popular searches:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {['Ipoh', 'Taiping', 'Kampar', 'Sitiawan'].map((term) => (
                                    <button
                                        key={term}
                                        onClick={() => {
                                            setSearchTerm(term);
                                            handleSearch(new Event('submit'));
                                        }}
                                        className="text-xs px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white/70 hover:text-amber-400 hover:bg-amber-500/20 border border-white/10 transition-all"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* FILTERS SECTION */}
                    <div className="mb-8">
                        <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                            {/* Filter Row */}
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-xs text-white/50 font-semibold">Filters:</span>
                                
                                {/* Category Filter */}
                                {categories.length > 0 && (
                                    <div className="relative">
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => handleCategoryFilter(e.target.value)}
                                            className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-white text-xs rounded-xl px-4 py-2 pr-8 focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer appearance-none min-w-[140px]"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 10px center',
                                                backgroundSize: '10px'
                                            }}
                                        >
                                            <option value="" className="bg-slate-800 text-white">All Categories</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id} className="bg-slate-800 text-white hover:bg-slate-700">
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* State Filter */}
                                {states.length > 0 && (
                                    <div className="relative">
                                        <select
                                            value={selectedState}
                                            onChange={(e) => handleStateChange(e.target.value)}
                                            className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-white text-xs rounded-xl px-4 py-2 pr-8 focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer appearance-none min-w-[140px]"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 10px center',
                                                backgroundSize: '10px'
                                            }}
                                        >
                                            <option value="">All States</option>
                                            {states.map((state) => (
                                                <option key={state.id} value={state.id} className="bg-slate-800 text-white hover:bg-slate-700">
                                                    {state.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* District Filter */}
                                {filteredDistricts.length > 0 && (
                                    <div className="relative">
                                        <select
                                            value={selectedDistrict}
                                            onChange={(e) => handleDistrictChange(e.target.value)}
                                            className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-white text-xs rounded-xl px-4 py-2 pr-8 focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer appearance-none min-w-[140px]"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 10px center',
                                                backgroundSize: '10px'
                                            }}
                                        >
                                            <option value="">All Districts</option>
                                            {filteredDistricts.map((district) => (
                                                <option key={district.id} value={district.id} className="bg-slate-800 text-white hover:bg-slate-700">
                                                    {district.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* City Filter */}
                                {filteredCities.length > 0 && (
                                    <div className="relative">
                                        <select
                                            value={selectedCity}
                                            onChange={(e) => handleCityChange(e.target.value)}
                                            className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-white text-xs rounded-xl px-4 py-2 pr-8 focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer appearance-none min-w-[140px]"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 10px center',
                                                backgroundSize: '10px'
                                            }}
                                        >
                                            <option value="">All Cities</option>
                                            {filteredCities.map((city) => (
                                                <option key={city.id} value={city.id} className="bg-slate-800 text-white hover:bg-slate-700">
                                                    {city.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* More Filters Toggle */}
                                <button
                                    onClick={() => setShowMoreFilters(!showMoreFilters)}
                                    className="text-xs text-white/50 hover:text-white/80 transition px-2 py-1"
                                >
                                    {showMoreFilters ? 'Less Filters ▲' : 'More Filters ▼'}
                                </button>

                                {/* Clear Filters */}
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs text-amber-400 hover:text-amber-300 transition px-2 py-1"
                                    >
                                        Clear All ✕
                                    </button>
                                )}
                            </div>

                            {/* More Filters - Facilities */}
                            {showMoreFilters && facilities.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-white/5">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-xs text-white/50 font-semibold mr-1">Facilities:</span>
                                        {facilities.map((facility) => (
                                            <button
                                                key={facility.id}
                                                onClick={() => toggleFacility(facility.id)}
                                                className={`text-xs px-3 py-1 rounded-full transition-all ${ 
                                                    selectedFacilities.includes(facility.id)
                                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                        : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
                                                }`}
                                            >
                                                {facility.icon || '🏋️'} {facility.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Active Filter Chips */}
                            {hasActiveFilters && (
                                <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                                    <span className="text-xs text-white/50 font-semibold mr-1">Active:</span>
                                    {selectedCategory && (
                                        <span className="inline-flex items-center gap-1 text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                                            {categories.find(c => c.id == selectedCategory)?.name}
                                            <button onClick={() => handleCategoryFilter('')} className="hover:text-amber-300">✕</button>
                                        </span>
                                    )}
                                    {selectedState && (
                                        <span className="inline-flex items-center gap-1 text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                                            {states.find(s => s.id == selectedState)?.name}
                                            <button onClick={() => handleStateChange('')} className="hover:text-amber-300">✕</button>
                                        </span>
                                    )}
                                    {selectedDistrict && (
                                        <span className="inline-flex items-center gap-1 text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                                            {districts.find(d => d.id == selectedDistrict)?.name}
                                            <button onClick={() => handleDistrictChange('')} className="hover:text-amber-300">✕</button>
                                        </span>
                                    )}
                                    {selectedCity && (
                                        <span className="inline-flex items-center gap-1 text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                                            {cities.find(c => c.id == selectedCity)?.name}
                                            <button onClick={() => handleCityChange('')} className="hover:text-amber-300">✕</button>
                                        </span>
                                    )}
                                    {selectedFacilities.map(id => {
                                        const facility = facilities.find(f => f.id === id);
                                        return facility && (
                                            <span key={id} className="inline-flex items-center gap-1 text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                                                {facility.name}
                                                <button onClick={() => toggleFacility(id)} className="hover:text-amber-300">✕</button>
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RESULTS SECTION */}
                    <div className="mt-8">
                        <div className="flex flex-wrap justify-between items-center mb-6 border-b border-white/10 pb-4">
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-wide drop-shadow-lg">
                                    {searchTerm ? `Results for "${searchTerm}"` : 'Recommended Locations'}
                                </h2>
                                <p className="text-xs text-white/60 mt-1">
                                    {totalGyms} gyms found • Page {gyms.current_page || 1} of {gyms.last_page || 1}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Sort By */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-white/40">Sort by:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => handleSortChange(e.target.value)}
                                       className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 text-slate-200 text-xs rounded-xl px-3 py-1.5 pr-8 focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 transition-all cursor-pointer appearance-none min-w-[140px] font-medium"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 10px center',
                                                backgroundSize: '10px'
                                            }}
                                    >
                                        <option value="rating">Rating (High→Low)</option>
                                        <option value="newest">Newest</option>
                                        <option value="name">Name A-Z</option>
                                    </select>
                                </div>

                                {/* VIEW TOGGLES */}
                                <div className="flex rounded-lg bg-black/30 backdrop-blur-sm p-1 border border-white/10">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 rounded transition-colors ${ 
                                            viewMode === 'grid' ? 'bg-amber-500/20 text-amber-400' : 'text-white/50 hover:text-white'
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded transition-colors ${ 
                                            viewMode === 'list' ? 'bg-amber-500/20 text-amber-400' : 'text-white/50 hover:text-white'
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {gymList.length > 0 ? (
                            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                                {gymList.map((gym, index) => {
                                    const gymImage = getGymImage(gym.id);
                                    const hasOwnImages = gym.images && gym.images.length > 0;
                                    const primaryImg = hasOwnImages 
                                        ? (gym.images.find((img) => img.is_primary)?.url || gym.images[0]?.url)
                                        : gymImage;

                                    const mapUrl = gym.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                        `${gym.name} ${gym.address}`
                                    )}`;

                                    const waNumber = gym.whatsapp_number ? gym.whatsapp_number.replace(/[^0-9]/g, '') : null;
                                    const waUrl = waNumber 
                                        ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi ${gym.name}, I found your gym on GymFinder Perak!`)}`
                                        : null;

                                    const isNew = new Date(gym.created_at) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
                                    const gymShowUrl = getGymShowUrl(gym);

                                    return (
                                        <Link
                                            key={gym.id}
                                            href={gymShowUrl}
                                            className="block group"
                                        >
                                            <div 
                                                className={`glass-card rounded-2xl overflow-hidden flex flex-col justify-between backdrop-blur-xl bg-white/5 border-white/10 ${
                                                    viewMode === 'list' ? 'md:flex-row md:h-48' : ''
                                                } hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                {/* Image Section */}
                                                {viewMode === 'grid' ? (
                                                    <div className="relative h-52 overflow-hidden bg-slate-900">
                                                        <img
                                                            src={primaryImg}
                                                            alt={gym.name}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            loading="lazy"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                                        
                                                        {/* New Badge */}
                                                        {isNew && (
                                                            <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold uppercase">
                                                                ✨ New
                                                            </div>
                                                        )}
                                                        
                                                        {/* Rating Badge */}
                                                        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                                                            <span className="text-amber-400 text-xs">⭐</span>
                                                            <span className="text-xs font-bold text-white">
                                                                {formatRating(gym.average_rating)}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* Open Status */}
                                                        {gym.is_open && (
                                                            <div className="absolute bottom-3 left-3 bg-emerald-500/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-white uppercase flex items-center gap-1">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                                                                Open Now
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="relative h-48 md:h-full md:w-48 flex-shrink-0 overflow-hidden bg-slate-900">
                                                        <img
                                                            src={primaryImg}
                                                            alt={gym.name}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            loading="lazy"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r"></div>
                                                        {gym.is_open && (
                                                            <div className="absolute bottom-3 left-3 bg-emerald-500/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-bold text-white uppercase flex items-center gap-1">
                                                                <span className="w-1 h-1 rounded-full bg-white animate-pulse"></span>
                                                                Open
                                                            </div>
                                                        )}
                                                        {isNew && (
                                                            <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-emerald-500/90 backdrop-blur-md text-white text-[8px] font-bold uppercase">
                                                                ✨ New
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Content Section */}
                                                <div className={`p-6 flex-1 flex flex-col justify-between ${
                                                    viewMode === 'list' ? 'md:flex-row md:items-center' : ''
                                                }`}>
                                                    <div className={viewMode === 'list' ? 'md:flex-1' : ''}>
                                                        {/* Gym Name */}
                                                        <div className="flex items-start justify-between">
                                                            <h3 className="text-xl font-bold text-white mb-1 tracking-tight group-hover:text-amber-400 transition-colors line-clamp-1">
                                                                {gym.name}
                                                            </h3>
                                                            {viewMode === 'grid' && (
                                                                <button 
                                                                    className="text-white/30 hover:text-amber-400 transition-colors ml-2 flex-shrink-0"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        // Toggle favorite
                                                                    }}
                                                                >
                                                                    ♡
                                                                </button>
                                                            )}
                                                        </div>
                                                        
                                                        <p className="text-xs text-white/60 mb-2 line-clamp-2 leading-relaxed">
                                                            {gym.address}
                                                        </p>
                                                        
                                                        {viewMode === 'list' && (
                                                            <div className="flex flex-wrap gap-2 mb-2">
                                                                <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded backdrop-blur-sm">
                                                                    📍 {gym.city?.name || 'Perak'}
                                                                </span>
                                                                <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded backdrop-blur-sm">
                                                                    ⭐ {formatRating(gym.average_rating)}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Facilities */}
                                                        {gym.facilities && gym.facilities.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                                {gym.facilities.slice(0, viewMode === 'list' ? 5 : 4).map((facility) => (
                                                                    <span
                                                                        key={facility.id}
                                                                        className="text-[10px] bg-white/10 text-white/70 border border-white/10 px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1"
                                                                    >
                                                                        {facility.icon || '✓'} {facility.name}
                                                                    </span>
                                                                ))}
                                                                {gym.facilities.length > 4 && viewMode === 'grid' && (
                                                                    <span className="text-[10px] text-white/40">
                                                                        +{gym.facilities.length - 4} more
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className={`${viewMode === 'list' ? 'md:ml-6 md:min-w-[200px]' : ''}`}>
                                                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                                                            {waUrl ? (
                                                                <a
                                                                    href={waUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center justify-center gap-2 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 font-bold text-xs py-2.5 px-3 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <span>💬 WhatsApp</span>
                                                                </a>
                                                            ) : (
                                                                <button
                                                                    disabled
                                                                    className="bg-white/5 text-white/30 text-xs font-semibold py-2.5 px-3 rounded-xl cursor-not-allowed backdrop-blur-sm"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    No WhatsApp
                                                                </button>
                                                            )}

                                                            <a
                                                                href={mapUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center justify-center gap-2 bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-white border border-amber-500/30 font-bold text-xs py-2.5 px-3 rounded-xl transition-all duration-300 hover:scale-105 backdrop-blur-sm"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <span>🗺️ Location</span>
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            /* Empty State with Clear Filters */
                            <div className="text-center py-20 glass-card rounded-3xl backdrop-blur-xl bg-white/5 border-white/10">
                                <span className="text-6xl mb-4 block">🔍</span>
                                <h3 className="text-2xl font-bold text-white mt-4">No Gyms Found</h3>
                                <p className="text-white/60 text-sm mt-2 max-w-md mx-auto">
                                    {hasActiveFilters 
                                        ? "We couldn't find any gyms matching your filters. Try adjusting your criteria."
                                        : "We couldn't find any gyms matching your search criteria."}
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-4 text-sm px-6 py-2.5 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 transition-all"
                                    >
                                        Clear All Filters
                                    </button>
                                )}
                                <div className="mt-6">
                                    <p className="text-xs text-white/40 mb-3">Try these suggestions:</p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {['Ipoh', 'Taiping', 'Kampar', 'Sitiawan'].map((suggestion) => (
                                            <button
                                                key={suggestion}
                                                onClick={() => {
                                                    setSearchTerm(suggestion);
                                                    handleSearch(new Event('submit'));
                                                }}
                                                className="text-sm px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30 transition-all backdrop-blur-sm"
                                            >
                                                Search "{suggestion}"
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* PAGINATION */}
                    {gyms.last_page > 1 && (
                        <div className="flex justify-center mt-12">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => router.get('/', { 
                                        page: gyms.current_page - 1, 
                                        search: searchTerm, 
                                        category_ids: selectedCategory ? [selectedCategory] : [],
                                        state_id: selectedState,
                                        district_id: selectedDistrict,
                                        city_id: selectedCity,
                                        facility_ids: selectedFacilities,
                                        sort: sortBy
                                    })}
                                    disabled={gyms.current_page <= 1}
                                    className="px-4 py-2 rounded-xl bg-black/30 backdrop-blur-sm text-white/70 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition border border-white/10"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 backdrop-blur-sm border border-amber-500/30">
                                    {gyms.current_page} / {gyms.last_page}
                                </span>
                                <button
                                    onClick={() => router.get('/', { 
                                        page: gyms.current_page + 1,
                                        search: searchTerm, 
                                        category_ids: selectedCategory ? [selectedCategory] : [],
                                        state_id: selectedState,
                                        district_id: selectedDistrict,
                                        city_id: selectedCity,
                                        facility_ids: selectedFacilities,
                                        sort: sortBy
                                    })}
                                    disabled={gyms.current_page >= gyms.last_page}
                                    className="px-4 py-2 rounded-xl bg-black/30 backdrop-blur-sm text-white/70 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition border border-white/10"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}