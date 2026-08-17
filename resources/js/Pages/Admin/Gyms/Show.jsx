import React, { useState } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Show({ gym }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [isProcessing, setIsProcessing] = useState(false);

    // Status Badge Color Mapper
    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'pending':
                return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'rejected':
                return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            case 'suspended':
                return 'bg-slate-800 text-slate-400 border-slate-700';
            default:
                return 'bg-slate-800 text-slate-300 border-slate-700';
        }
    };

    // Generic Action Handler for Status Changes
    const handleStatusChange = (actionName, routeName) => {
        if (confirm(`Are you sure you want to ${actionName} this gym listing?`)) {
            setIsProcessing(true);
            router.post(
                route(routeName, gym.id),
                {},
                {
                    onFinish: () => setIsProcessing(false),
                }
            );
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <Head title={`Gym: ${gym.name}`} />

            {/* 1. TOP BREADCRUMB & BACK BUTTON */}
            <div className="flex items-center justify-between">
                <Link
                    href={route('admin.gyms.index')}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Gym Directory</span>
                </Link>

                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getStatusBadge(gym.status)}`}>
                        {gym.status}
                    </span>
                </div>
            </div>

            {/* 2. HERO HEADER & QUICK ACTIONS */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
                    <div className="flex items-start gap-4">
                       {gym.images && gym.images.length > 0 ? (
                            <img
                                src={gym.images[0].url || gym.images[0].image_path}
                                alt={gym.name}
                                className="w-20 h-20 rounded-xl object-cover border border-slate-700/80 shadow-md flex-shrink-0"
                                onError={(e) => {
                                    // Fallback to placeholder if image fails to load
                                    e.target.src = 'https://via.placeholder.com/80x80?text=🏋️';
                                }}
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl text-slate-500 flex-shrink-0">
                                🏋️‍♂️
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-black text-white tracking-tight">{gym.name}</h1>
                                {gym.owner ? (
                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                        Claimed Listing
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                                        Unclaimed
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                <span>📍</span>
                                <span>{gym.address}</span>
                                {gym.city && <span>• {gym.city.name}</span>}
                                {gym.district && <span>, {gym.district.name}</span>}
                                {gym.state && <span>, {gym.state.name}</span>}
                            </p>
                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                                <div>
                                    Owner: <span className="text-slate-200 font-semibold">{gym.owner ? gym.owner.name : 'Unassigned'}</span>
                                </div>
                                {gym.reviews && (
                                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                                        <span>★</span>
                                        <span>
                                            {(gym.reviews.reduce((acc, r) => acc + r.rating, 0) / (gym.reviews.length || 1)).toFixed(1)}
                                        </span>
                                        <span className="text-slate-500 text-[11px]">({gym.reviews.length} reviews)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Action Control Bar */}
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                        <Link
                            href={route('admin.gyms.edit', gym.id)}
                            className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-all"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Edit Listing</span>
                        </Link>

                        {gym.status !== 'approved' && (
                            <button
                                disabled={isProcessing}
                                onClick={() => handleStatusChange('approve', 'admin.gyms.approve')}
                                className="flex-1 lg:flex-none bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
                            >
                                Approve Listing
                            </button>
                        )}

                        {gym.status !== 'rejected' && gym.status !== 'approved' && (
                            <button
                                disabled={isProcessing}
                                onClick={() => handleStatusChange('reject', 'admin.gyms.reject')}
                                className="flex-1 lg:flex-none bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all border border-rose-500/20 disabled:opacity-50"
                            >
                                Reject
                            </button>
                        )}

                        {gym.status === 'approved' && (
                            <button
                                disabled={isProcessing}
                                onClick={() => handleStatusChange('suspend', 'admin.gyms.suspend')}
                                className="flex-1 lg:flex-none bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition-all border border-amber-500/20 disabled:opacity-50"
                            >
                                Suspend Gym
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. CONTENT NAVIGATION TABS */}
            <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
                {[
                    { id: 'overview', label: 'Overview & Info', icon: '📋' },
                    { id: 'facilities', label: `Facilities & Categories (${(gym.facilities?.length || 0) + (gym.categories?.length || 0)})`, icon: '🏋️' },
                    { id: 'hours', label: 'Operating Hours', icon: '🕒' },
                    { id: 'plans', label: `Plans (${gym.membership_plans?.length || 0})`, icon: '💳' },
                    { id: 'reviews', label: `Reviews (${gym.reviews?.length || 0})`, icon: '⭐' },
                    { id: 'reports', label: `Reports (${gym.reports?.length || 0})`, icon: '⚠️', alert: gym.reports?.length > 0 },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                        {tab.alert && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                        )}
                    </button>
                ))}
            </div>

            {/* 4. TAB CONTENTS */}
            <div className="space-y-6">
                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Details */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">About the Gym</h3>
                                <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                                    {gym.description || 'No description provided for this gym listing.'}
                                </p>
                            </div>

                            {/* Photos Gallery */}
                            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
                                    Gallery ({gym.images?.length || 0})
                                </h3>
                                {gym.images && gym.images.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {gym.images.map((img, idx) => (
                                            <a
                                                key={idx}
                                                href={img.url || img.image_path}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="group relative rounded-xl overflow-hidden border border-slate-800 aspect-video bg-slate-950"
                                            >
                                                <img
                                                    src={img.url || img.image_path}
                                                    alt="Gym upload"
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    onError={(e) => {
                                                        // Fallback to placeholder if image fails to load
                                                        e.target.src = 'https://via.placeholder.com/600x400?text=GymFinder+Perak';
                                                    }}
                                                />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500">No images uploaded for this listing.</p>
                                )}
                            </div>
                        </div>

                        {/* Contact & Meta Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">Contact Information</h3>
                                <ul className="space-y-3 text-xs">
                                    <li className="flex justify-between py-2 border-b border-slate-800/60">
                                        <span className="text-slate-500">Phone</span>
                                        <span className="text-slate-200 font-medium">{gym.phone_number || 'N/A'}</span>
                                    </li>
                                    <li className="flex justify-between py-2 border-b border-slate-800/60">
                                        <span className="text-slate-500">WhatsApp</span>
                                        <span className="text-slate-200 font-medium">{gym.whatsapp_number || 'N/A'}</span>
                                    </li>
                                    <li className="flex justify-between py-2 border-b border-slate-800/60">
                                        <span className="text-slate-500">Email</span>
                                        <span className="text-slate-200 font-medium truncate max-w-[160px]">{gym.email || 'N/A'}</span>
                                    </li>
                                    <li className="flex justify-between py-2 border-b border-slate-800/60">
                                        <span className="text-slate-500">Website</span>
                                        {gym.website ? (
                                            <a href={gym.website} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline truncate max-w-[160px]">
                                                {gym.website}
                                            </a>
                                        ) : (
                                            <span className="text-slate-200 font-medium">N/A</span>
                                        )}
                                    </li>
                                    <li className="flex justify-between py-2">
                                        <span className="text-slate-500">Google Maps</span>
                                        {gym.google_maps_url ? (
                                            <a href={gym.google_maps_url} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">
                                                Open Location
                                            </a>
                                        ) : (
                                            <span className="text-slate-200 font-medium">N/A</span>
                                        )}
                                    </li>
                                </ul>
                            </div>

                            {/* Owner Metadata */}
                            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">Owner Profile</h3>
                                {gym.owner ? (
                                    <div className="text-xs space-y-2">
                                        <p className="font-bold text-white">{gym.owner.name}</p>
                                        <p className="text-slate-400">{gym.owner.email}</p>
                                        <p className="text-slate-400">{gym.owner.phone || 'No phone recorded'}</p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500">Unclaimed listing. Managed directly by Super Admin.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: FACILITIES & CATEGORIES */}
                {activeTab === 'facilities' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">Available Facilities</h3>
                            {gym.facilities && gym.facilities.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {gym.facilities.map((fac) => (
                                        <span key={fac.id} className="bg-slate-800 text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-slate-700 font-medium">
                                            ✓ {fac.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500">No facilities linked.</p>
                            )}
                        </div>

                        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">Categories</h3>
                            {gym.categories && gym.categories.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {gym.categories.map((cat) => (
                                        <span key={cat.id} className="bg-amber-500/10 text-amber-400 text-xs px-3 py-1.5 rounded-xl border border-amber-500/20 font-medium">
                                            {cat.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500">No categories assigned.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 3: OPERATING HOURS */}
                {activeTab === 'hours' && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 mb-4">Weekly Schedule</h3>
                    
                    {/* Days of week in order */}
                    {(() => {
                        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                        
                        // Create a map of existing hours by day name
                        const hoursMap = {};
                        if (gym.operating_hours && gym.operating_hours.length > 0) {
                            gym.operating_hours.forEach(oh => {
                                // If day_of_week is stored as number (0-6), convert to day name
                                const dayName = typeof oh.day_of_week === 'number' 
                                    ? ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][oh.day_of_week]
                                    : oh.day_of_week;
                                hoursMap[dayName] = oh;
                            });
                        }

                        const hasHours = Object.keys(hoursMap).length > 0;

                        return (
                            <div className="divide-y divide-slate-800/80 text-xs">
                                {daysOfWeek.map((day) => {
                                    const hour = hoursMap[day];
                                    return (
                                        <div key={day} className="py-3 flex justify-between items-center">
                                            <span className="font-bold text-slate-200 capitalize">{day}</span>
                                            {hour ? (
                                                hour.is_closed ? (
                                                    <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded">Closed</span>
                                                ) : (
                                                    <span className="font-mono text-slate-400">
                                                        {hour.opening_time} - {hour.closing_time}
                                                    </span>
                                                )
                                            ) : (
                                                <span className="text-slate-500 italic">Not set</span>
                                            )}
                                        </div>
                                    );
                                })}
                                {!hasHours && (
                                    <div className="py-4 text-center">
                                        <p className="text-xs text-slate-500">No operating hours recorded.</p>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}

                {/* TAB 4: MEMBERSHIP PLANS */}
                {activeTab === 'plans' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {gym.membership_plans && gym.membership_plans.length > 0 ? (
                            gym.membership_plans.map((plan) => (
                                <div key={plan.id} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
                                    <h4 className="font-bold text-white text-sm">{plan.name}</h4>
                                    <div className="text-2xl font-black text-amber-400">
                                        RM {plan.price} <span className="text-xs text-slate-500 font-normal">/ {plan.duration}</span>
                                    </div>
                                    <p className="text-xs text-slate-400">{plan.description}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-slate-500 col-span-3">No membership plans configured for this gym.</p>
                        )}
                    </div>
                )}

                {/* TAB 5: REVIEWS */}
                {activeTab === 'reviews' && (
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">User Reviews</h3>
                        {gym.reviews && gym.reviews.length > 0 ? (
                            <div className="space-y-4">
                                {gym.reviews.map((rev) => (
                                    <div key={rev.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-white">{rev.user?.name || 'Anonymous User'}</span>
                                            <span className="text-amber-400 font-bold">★ {rev.rating}</span>
                                        </div>
                                        <p className="text-slate-300">{rev.comment}</p>
                                        <span className="text-[10px] text-slate-500 block font-mono">
                                            {new Date(rev.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500">No user reviews submitted yet.</p>
                        )}
                    </div>
                )}

                {/* TAB 6: REPORTS */}
                {activeTab === 'reports' && (
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">Reported Issues</h3>
                        {gym.reports && gym.reports.length > 0 ? (
                            <div className="space-y-3">
                                {gym.reports.map((rep) => (
                                    <div key={rep.id} className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-rose-400">Report from {rep.user?.name || 'User'}</span>
                                            <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-bold uppercase">
                                                {rep.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-300">{rep.reason || rep.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500">No open reports filed for this gym.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Attach persistent layout
// ✅ CORRECT: Proper Inertia persistent layout function
Show.layout = (page) => <AdminLayout children={page} />;