import React from 'react';
import { Head, Link } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

const formatRating = (value) => Number.isFinite(Number(value)) ? Number(value).toFixed(1) : 'N/A';

export default function Index({ gyms = [] }) {
    const totalFavorites = gyms.length;

    return (
        <MainLayout>
            <Head title="My Favorites" />

            {/* Page Header */}
            <section className="border-b border-stone-200 bg-[#eeece7]">
                <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">
                        Saved gyms
                    </p>
                    <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div>
                            <h1 className="max-w-3xl text-4xl font-bold tracking-[-0.05em] text-stone-950 sm:text-5xl">
                                Your favorite places to train.
                            </h1>
                            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">
                                Everything you've saved, all in one place. Ready when you are.
                            </p>
                        </div>
                        <div className="border-y border-stone-300 py-3 text-center sm:min-w-[180px]">
                            <p className="text-2xl font-bold tracking-tight">{totalFavorites}</p>
                            <p className="mt-1 text-xs text-stone-500">
                                {totalFavorites === 1 ? 'saved gym' : 'saved gyms'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12">
                {gyms.length > 0 ? (
                    <>
                        {/* Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-5">
                            <div>
                                <h2 className="text-2xl font-bold tracking-[-0.035em] text-stone-950">
                                    All saved gyms
                                </h2>
                                <p className="mt-1 text-sm text-stone-500">
                                    {totalFavorites} {totalFavorites === 1 ? 'gym' : 'gyms'} in your list
                                </p>
                            </div>
                            <Link
                                href="/"
                                className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-950 hover:text-stone-950"
                            >
                                Browse more gyms
                            </Link>
                        </div>

                        {/* Grid */}
                        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {gyms.map((gym) => (
                                <FavoriteCard key={gym.id} gym={gym} />
                            ))}
                        </div>
                    </>
                ) : (
                    <EmptyState />
                )}
            </div>
        </MainLayout>
    );
}

function FavoriteCard({ gym }) {
    const primaryImage = gym.images?.find((img) => img.is_primary)?.url
        || gym.images?.[0]?.url
        || null;

    const mapUrl = gym.google_maps_url
        || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${gym.name} ${gym.address}`)}`;

    const waNumber = gym.whatsapp_number?.replace(/[^0-9]/g, '');
    const waUrl = waNumber
        ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi ${gym.name}, I found your gym on GymFinder Perak!`)}`
        : null;

    const isNew = gym.created_at
        && new Date(gym.created_at) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const showUrl = `/gyms/${gym.slug || gym.id}`;

    return (
        <article className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(28,25,23,0.10)]">
            {/* Image */}
            <Link
                href={showUrl}
                className="relative block h-52 shrink-0 overflow-hidden bg-stone-200"
            >
                {primaryImage ? (
                    <img
                        src={primaryImage}
                        alt={gym.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="grid h-full place-items-center text-sm text-stone-500">
                        No photos available
                    </div>
                )}
                {isNew && (
                    <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-700 shadow-sm">
                        New
                    </span>
                )}
                {gym.is_open && (
                    <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-stone-950 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        <i className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Open now
                    </span>
                )}
                {/* Heart badge — indicates it's already saved */}
                <span
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-600 shadow-sm"
                    title="Saved to favorites"
                    aria-label="Saved to favorites"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
                    </svg>
                </span>
            </Link>

            {/* Content */}
            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link
                            href={showUrl}
                            className="text-lg font-bold tracking-[-0.025em] text-stone-950 hover:underline"
                        >
                            {gym.name}
                        </Link>
                        <p className="mt-1 truncate text-sm leading-5 text-stone-500">
                            {gym.address}
                        </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-stone-200 px-2.5 py-1 text-xs font-bold text-stone-700">
                        {formatRating(gym.average_rating)}
                    </span>
                </div>

                {/* Location chip */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                    {gym.city?.name && (
                        <span className="rounded-md bg-stone-100 px-2 py-1 text-[11px] font-medium text-stone-600">
                            📍 {gym.city.name}
                        </span>
                    )}
                    {gym.state?.name && (
                        <span className="rounded-md bg-stone-100 px-2 py-1 text-[11px] font-medium text-stone-600">
                            {gym.state.name}
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-5 grid grid-cols-2 gap-2 border-t border-stone-100 pt-4">
                    {waUrl ? (
                        <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-stone-950 px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-stone-700"
                        >
                            WhatsApp
                        </a>
                    ) : (
                        <button
                            disabled
                            className="cursor-not-allowed rounded-lg bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-400"
                        >
                            No WhatsApp
                        </button>
                    )}
                    <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-stone-300 px-3 py-2 text-center text-xs font-semibold text-stone-700 transition hover:border-stone-950 hover:text-stone-950"
                    >
                        Directions
                    </a>
                </div>

                {/* View details link */}
                <Link
                    href={showUrl}
                    className="mt-3 inline-flex items-center justify-center gap-1 rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-600 transition hover:border-stone-950 hover:text-stone-950"
                >
                    View gym details
                    <span aria-hidden="true">→</span>
                </Link>
            </div>
        </article>
    );
}

function EmptyState() {
    return (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-16 text-center">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
                </svg>
            </div>
            <h3 className="text-xl font-bold tracking-[-0.025em] text-stone-950">
                No favorites yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
                Start saving gyms you like and they'll show up here for easy access.
            </p>
            <Link
                href="/"
                className="mt-6 inline-flex rounded-lg bg-stone-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700"
            >
                Browse gyms
            </Link>
        </div>
    );
}