import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { debounce } from 'lodash';
import MainLayout from '@/Layouts/MainLayout';

const gymImageUrls = [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1581009146145-b5b0502edc41?w=800&h=600&fit=crop',
];

const Select = ({ children, ...props }) => (
    <select {...props} className="min-w-[145px] appearance-none rounded-lg border border-stone-300 bg-white px-3 py-2 pr-8 text-xs font-medium text-stone-700 outline-none transition focus:border-stone-950 focus:ring-2 focus:ring-stone-200">
        {children}
    </select>
);

export default function Home({ gyms = {}, filters = {}, states = [], districts = [], cities = [], categories = [], facilities = [] }) {
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
    const [gymImages, setGymImages] = useState({});

    const filteredDistricts = useMemo(() => !selectedState ? districts : districts.filter((d) => d.state_id === parseInt(selectedState)), [selectedState, districts]);
    const filteredCities = useMemo(() => !selectedDistrict ? cities : cities.filter((c) => c.district_id === parseInt(selectedDistrict)), [selectedDistrict, cities]);
    const gymList = gyms.data || [];
    const totalGyms = gyms.total || gymList.length;
    const numericRating = (rating) => Number.isFinite(Number(rating)) ? Number(rating) : 0;
    const formatRating = (rating) => Number.isFinite(Number(rating)) ? Number(rating).toFixed(1) : 'N/A';
    const avgRating = gymList.length ? gymList.reduce((sum, gym) => sum + numericRating(gym.average_rating), 0) / gymList.length : 0;
    const topRatedGym = gymList.length ? gymList.reduce((best, gym) => numericRating(best.average_rating) > numericRating(gym.average_rating) ? best : gym) : null;
    const hasActiveFilters = selectedCategory || selectedState || selectedDistrict || selectedCity || selectedFacilities.length > 0 || searchTerm;

    const request = (values, options = {}) => router.get('/', values, { preserveState: true, replace: true, onFinish: () => setIsLoading(false), ...options });
    const currentQuery = (overrides = {}) => ({
        search: searchTerm, category_ids: selectedCategory ? [selectedCategory] : [], state_id: selectedState,
        district_id: selectedDistrict, city_id: selectedCity, facility_ids: selectedFacilities, sort: sortBy, ...overrides,
    });
    const debouncedSearch = useCallback(debounce((term, category, state, district, city, selected, sort) => {
        router.get('/', { search: term, category_ids: category ? [category] : [], state_id: state, district_id: district, city_id: city, facility_ids: selected, sort }, { preserveState: true, replace: true });
    }, 300), []);
    useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

    const handleSearch = (event) => { event?.preventDefault(); setIsLoading(true); request(currentQuery()); };
    const handleCategoryFilter = (id) => { setSelectedCategory(id); setIsLoading(true); request(currentQuery({ category_ids: id ? [id] : [] })); };
    const handleStateChange = (id) => { setSelectedState(id); setSelectedDistrict(''); setSelectedCity(''); setIsLoading(true); request(currentQuery({ state_id: id, district_id: '', city_id: '' })); };
    const handleDistrictChange = (id) => { setSelectedDistrict(id); setSelectedCity(''); setIsLoading(true); request(currentQuery({ district_id: id, city_id: '' })); };
    const handleCityChange = (id) => { setSelectedCity(id); setIsLoading(true); request(currentQuery({ city_id: id })); };
    const handleSortChange = (sort) => { setSortBy(sort); setIsLoading(true); request(currentQuery({ sort })); };
    const toggleFacility = (id) => setSelectedFacilities((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]);
    const clearFilters = () => { setSelectedCategory(''); setSelectedState(''); setSelectedDistrict(''); setSelectedCity(''); setSelectedFacilities([]); setSearchTerm(''); setSortBy('rating'); router.get('/', { sort: 'rating' }, { preserveState: true, replace: true }); };
    const getGymImage = (id) => {
        if (gymImages[id]) return gymImages[id];
        const image = gymImageUrls[id % gymImageUrls.length];
        setGymImages((previous) => ({ ...previous, [id]: image }));
        return image;
    };
    const chooseSearch = (term) => { setSearchTerm(term); setIsLoading(true); request(currentQuery({ search: term })); };
    const showUrl = (gym) => `/gyms/${gym.slug || gym.id}`;
    const optionLabel = (items, id) => items.find((item) => item.id == id)?.name;

    return (
        <MainLayout>
            <div className="bg-[#f7f7f5]">
                <section className="border-b border-stone-200 bg-[#eeece7]">
                    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Fitness directory · Perak, Malaysia</p>
                        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                            <div>
                                <h1 className="max-w-3xl text-4xl font-bold tracking-[-0.05em] text-stone-950 sm:text-5xl">A better place to find your next gym.</h1>
                                <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">Search local fitness centres, compare the essentials, and get directions or contact the gym directly.</p>
                            </div>
                            <div className="grid grid-cols-2 divide-x divide-stone-300 border-y border-stone-300 py-3 text-center sm:min-w-[285px]">
                                <div className="px-5"><p className="text-2xl font-bold tracking-tight">{totalGyms}</p><p className="mt-1 text-xs text-stone-500">listed gyms</p></div>
                                <div className="px-5"><p className="text-2xl font-bold tracking-tight">{formatRating(avgRating)}</p><p className="mt-1 text-xs text-stone-500">average rating</p></div>
                            </div>
                        </div>
                        {topRatedGym && <p className="mt-8 text-sm text-stone-500"><span className="font-semibold text-stone-900">Top rated:</span> {topRatedGym.name} · {formatRating(topRatedGym.average_rating)}</p>}
                    </div>
                </section>

                <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
                    <form onSubmit={handleSearch} className="rounded-2xl border border-stone-200 bg-white p-3 shadow-[0_8px_24px_rgba(28,25,23,0.06)] sm:flex sm:items-center sm:gap-3">
                        <label className="flex min-w-0 flex-1 items-center gap-3 px-3">
                            <svg className="h-5 w-5 shrink-0 text-stone-400" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                            <input value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); if (event.target.value.length > 2) debouncedSearch(event.target.value, selectedCategory, selectedState, selectedDistrict, selectedCity, selectedFacilities, sortBy); }} className="min-w-0 flex-1 py-3 text-sm text-stone-900 outline-none placeholder:text-stone-400" placeholder="Search by gym, town, or district" />
                            {searchTerm && <button type="button" onClick={() => { setSearchTerm(''); debouncedSearch('', selectedCategory, selectedState, selectedDistrict, selectedCity, selectedFacilities, sortBy); }} className="text-xs font-semibold text-stone-400 hover:text-stone-950">Clear</button>}
                        </label>
                        <button type="submit" disabled={isLoading} className="mt-2 w-full rounded-xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60 sm:mt-0 sm:w-auto">{isLoading ? 'Searching…' : 'Search'}</button>
                    </form>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-500"><span>Popular:</span>{['Ipoh', 'Taiping', 'Kampar', 'Sitiawan'].map((term) => <button key={term} onClick={() => chooseSearch(term)} className="rounded-full border border-stone-300 bg-white px-3 py-1.5 font-medium text-stone-600 transition hover:border-stone-950 hover:text-stone-950">{term}</button>)}</div>

                    <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="mr-1 text-xs font-bold uppercase tracking-wider text-stone-400">Filter</span>
                            {categories.length > 0 && <Select value={selectedCategory} onChange={(event) => handleCategoryFilter(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>}
                            {states.length > 0 && <Select value={selectedState} onChange={(event) => handleStateChange(event.target.value)}><option value="">All states</option>{states.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>}
                            {filteredDistricts.length > 0 && <Select value={selectedDistrict} onChange={(event) => handleDistrictChange(event.target.value)}><option value="">All districts</option>{filteredDistricts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>}
                            {filteredCities.length > 0 && <Select value={selectedCity} onChange={(event) => handleCityChange(event.target.value)}><option value="">All cities</option>{filteredCities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>}
                            <button onClick={() => setShowMoreFilters(!showMoreFilters)} className="px-2 py-2 text-xs font-semibold text-stone-600 hover:text-stone-950">{showMoreFilters ? 'Fewer filters' : 'More filters'}</button>
                            {hasActiveFilters && <button onClick={clearFilters} className="px-2 py-2 text-xs font-semibold text-red-700 hover:text-red-900">Clear all</button>}
                        </div>
                        {showMoreFilters && facilities.length > 0 && <div className="mt-4 border-t border-stone-100 pt-4"><p className="mb-2 text-xs font-semibold text-stone-500">Facilities</p><div className="flex flex-wrap gap-2">{facilities.map((item) => <button key={item.id} onClick={() => toggleFacility(item.id)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${selectedFacilities.includes(item.id) ? 'border-stone-950 bg-stone-950 text-white' : 'border-stone-300 text-stone-600 hover:border-stone-950'}`}>{item.name}</button>)}</div></div>}
                        {hasActiveFilters && <div className="mt-4 flex flex-wrap gap-2 border-t border-stone-100 pt-4">{selectedCategory && <FilterChip label={optionLabel(categories, selectedCategory)} onRemove={() => handleCategoryFilter('')} />}{selectedState && <FilterChip label={optionLabel(states, selectedState)} onRemove={() => handleStateChange('')} />}{selectedDistrict && <FilterChip label={optionLabel(districts, selectedDistrict)} onRemove={() => handleDistrictChange('')} />}{selectedCity && <FilterChip label={optionLabel(cities, selectedCity)} onRemove={() => handleCityChange('')} />}{selectedFacilities.map((id) => <FilterChip key={id} label={optionLabel(facilities, id)} onRemove={() => toggleFacility(id)} />)}</div>}
                    </section>

                    <section className="mt-10">
                        <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                            <div><h2 className="text-2xl font-bold tracking-[-0.035em]">{searchTerm ? `Results for “${searchTerm}”` : 'Browse gyms'}</h2><p className="mt-1 text-sm text-stone-500">{totalGyms} gyms found · Page {gyms.current_page || 1} of {gyms.last_page || 1}</p></div>
                            <div className="flex items-center gap-3"><label className="flex items-center gap-2 text-xs text-stone-500">Sort <Select value={sortBy} onChange={(event) => handleSortChange(event.target.value)}><option value="rating">Top rated</option><option value="newest">Newest</option><option value="name">Name A–Z</option></Select></label><div className="flex rounded-lg border border-stone-300 p-1"><button onClick={() => setViewMode('grid')} aria-label="Grid view" className={`grid h-8 w-8 place-items-center rounded ${viewMode === 'grid' ? 'bg-stone-950 text-white' : 'text-stone-500 hover:text-stone-950'}`}><GridIcon /></button><button onClick={() => setViewMode('list')} aria-label="List view" className={`grid h-8 w-8 place-items-center rounded ${viewMode === 'list' ? 'bg-stone-950 text-white' : 'text-stone-500 hover:text-stone-950'}`}><ListIcon /></button></div></div>
                        </div>
                        {gymList.length ? <div className={`mt-6 grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>{gymList.map((gym) => <GymCard key={gym.id} gym={gym} image={gym.images?.find((item) => item.is_primary)?.url || gym.images?.[0]?.url || getGymImage(gym.id)} isList={viewMode === 'list'} rating={formatRating(gym.average_rating)} href={showUrl(gym)} />)}</div> : <EmptyState active={hasActiveFilters} clear={clearFilters} choose={chooseSearch} />}
                    </section>
                    {gyms.last_page > 1 && <div className="mt-10 flex justify-center gap-2"><button disabled={gyms.current_page <= 1} onClick={() => router.get('/', { ...currentQuery(), page: gyms.current_page - 1 })} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40">Previous</button><span className="rounded-lg bg-stone-950 px-4 py-2 text-sm font-semibold text-white">{gyms.current_page} / {gyms.last_page}</span><button disabled={gyms.current_page >= gyms.last_page} onClick={() => router.get('/', { ...currentQuery(), page: gyms.current_page + 1 })} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40">Next</button></div>}
                </div>
            </div>
        </MainLayout>
    );
}

function FilterChip({ label, onRemove }) { return <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-700">{label}<button onClick={onRemove} aria-label={`Remove ${label}`} className="text-stone-400 hover:text-stone-950">×</button></span>; }
function GridIcon() { return <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M1 1h5v5H1V1Zm9 0h5v5h-5V1ZM1 10h5v5H1v-5Zm9 0h5v5h-5v-5Z" /></svg>; }
function ListIcon() { return <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 4h11M3 8h11M3 12h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M1 4h.01M1 8h.01M1 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>; }

function GymCard({ gym, image, isList, rating, href }) {
    const mapUrl = gym.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${gym.name} ${gym.address}`)}`;
    const number = gym.whatsapp_number?.replace(/[^0-9]/g, '');
    const whatsappUrl = number ? `https://wa.me/${number}?text=${encodeURIComponent(`Hi ${gym.name}, I found your gym on GymFinder Perak!`)}` : null;
    const isNew = new Date(gym.created_at) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    return <article className={`group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(28,25,23,0.10)] ${isList ? 'md:flex' : ''}`}>
        <Link href={href} className={`relative block shrink-0 overflow-hidden bg-stone-200 ${isList ? 'h-52 md:h-auto md:w-64' : 'h-52'}`}><img src={image} alt={gym.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />{isNew && <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700 shadow-sm">New</span>}{gym.is_open && <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-stone-950 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"><i className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Open now</span>}</Link>
        <div className="flex min-w-0 flex-1 flex-col p-5"><div className="flex items-start justify-between gap-3"><div><Link href={href} className="text-lg font-bold tracking-[-0.025em] text-stone-950 hover:underline">{gym.name}</Link><p className="mt-1 text-sm leading-5 text-stone-500">{gym.address}</p></div><span className="shrink-0 rounded-full border border-stone-200 px-2.5 py-1 text-xs font-bold text-stone-700">{rating}</span></div><div className="mt-4 flex flex-wrap gap-1.5">{gym.city?.name && <span className="rounded-md bg-stone-100 px-2 py-1 text-[11px] font-medium text-stone-600">{gym.city.name}</span>}{gym.facilities?.slice(0, isList ? 5 : 4).map((item) => <span key={item.id} className="rounded-md bg-stone-100 px-2 py-1 text-[11px] font-medium text-stone-600">{item.name}</span>)}</div><div className="mt-5 grid grid-cols-2 gap-2 border-t border-stone-100 pt-4">{whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} className="rounded-lg bg-stone-950 px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-stone-700">WhatsApp</a> : <button disabled className="cursor-not-allowed rounded-lg bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-400">No WhatsApp</button>}<a href={mapUrl} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} className="rounded-lg border border-stone-300 px-3 py-2 text-center text-xs font-semibold text-stone-700 transition hover:border-stone-950 hover:text-stone-950">Directions</a></div></div>
    </article>;
}

function EmptyState({ active, clear, choose }) { return <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-16 text-center"><h3 className="text-xl font-bold">No gyms found</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">{active ? 'Try removing a few filters or searching a nearby town.' : 'There are no gyms that match this search yet.'}</p>{active && <button onClick={clear} className="mt-5 rounded-lg bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white">Clear filters</button>}<div className="mt-6 flex flex-wrap justify-center gap-2">{['Ipoh', 'Taiping', 'Kampar', 'Sitiawan'].map((term) => <button key={term} onClick={() => choose(term)} className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 hover:border-stone-950">Search {term}</button>)}</div></div>; }
