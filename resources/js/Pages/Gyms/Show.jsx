import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '@/Layouts/MainLayout';

const formatRating = (value) => Number.isFinite(Number(value)) ? Number(value).toFixed(1) : 'N/A';

export default function Show({ gym, formattedHours = [], openStatus = null, isFavorited = false }) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [showLightbox, setShowLightbox] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const images = gym.images?.map((image) => image.url) || [];
    const mainImage = images[selectedImage];
    const hasReviews = Boolean(gym.reviews?.length);
    const hasReviewed = gym.reviews?.some((review) => review.user_id === window._auth?.user?.id);
    const reportUrl = (() => { try { return route('gyms.report.create', gym.id); } catch { return `/gyms/${gym.id}/report`; } })();

    useEffect(() => {
        if (!notification) return undefined;
        const timer = setTimeout(() => setNotification(null), 5000);
        return () => clearTimeout(timer);
    }, [notification]);

    const submitReview = (event) => {
        event.preventDefault();
        if (!rating) { setNotification({ type: 'error', message: 'Please select a rating before submitting.' }); return; }
        setIsSubmitting(true);
        router.post(`/gyms/${gym.id}/reviews`, { rating, comment }, {
            onSuccess: () => { setShowReviewModal(false); setRating(0); setComment(''); setNotification({ type: 'success', message: 'Your review has been posted successfully!' }); router.reload(); },
            onError: (errors) => setNotification({ type: 'error', message: errors.message || 'Failed to submit review. Please try again.' }),
            onFinish: () => setIsSubmitting(false),
        });
    };

    return (
        <MainLayout>
            <Head title={gym.name} />
            <div className="bg-[#f7f7f5] pb-14">
                <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 sm:py-10">
                    {notification && <Notification notification={notification} close={() => setNotification(null)} />}
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 transition hover:text-stone-950"><ArrowLeft />Back to search</Link>

                    <section className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white">
                        <div className="relative h-[280px] bg-stone-200 sm:h-[440px]">
                            {mainImage ? <><img src={mainImage} alt={gym.name} onClick={() => setShowLightbox(true)} className="h-full w-full cursor-zoom-in object-cover" /><button onClick={() => setShowLightbox(true)} className="absolute bottom-4 right-4 rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-stone-900 shadow-sm transition hover:bg-stone-100">View photos</button></> : <div className="grid h-full place-items-center text-sm text-stone-500">No photos available</div>}
                        </div>
                        {images.length > 1 && <div className="flex gap-2 overflow-x-auto border-t border-stone-200 p-3">{images.map((image, index) => <button key={image} onClick={() => setSelectedImage(index)} className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${selectedImage === index ? 'border-stone-950' : 'border-transparent opacity-70 hover:opacity-100'}`}><img src={image} alt={`${gym.name} ${index + 1}`} className="h-full w-full object-cover" /></button>)}</div>}
                    </section>

                    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_320px]">
                        <div className="min-w-0 space-y-6">
                            <section className="border-b border-stone-200 pb-7">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-stone-400">Gym listing</p>
                                        <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-stone-950 sm:text-5xl">{gym.name}</h1>
                                        <p className="mt-3 flex max-w-2xl items-start gap-2 text-sm leading-6 text-stone-500"><PinIcon /><span>{gym.address}{gym.city && `, ${gym.city.name}`}{gym.district && `, ${gym.district.name}`}{gym.state && `, ${gym.state.name}`}</span></p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-3">
                                        {/* Heart icon favorite button */}
                                        <Link
                                            href={route('gyms.favorite', gym.id)}
                                            method="post"
                                            as="button"
                                            preserveScroll
                                            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                                            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                                            className={`inline-flex h-[52px] w-[52px] items-center justify-center rounded-xl border transition ${
                                                isFavorited
                                                    ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                                                    : 'border-stone-200 bg-white text-stone-500 hover:border-stone-950 hover:text-stone-950'
                                            }`}
                                        >
                                            <HeartIcon filled={isFavorited} />
                                        </Link>
                                        <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3">
                                            <StarRating value={gym.average_rating} />
                                            <div>
                                                <p className="text-xl font-bold tracking-tight">{formatRating(gym.average_rating)}</p>
                                                <p className="text-xs text-stone-500">{gym.total_reviews || 0} reviews</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 flex flex-wrap items-center gap-2">{openStatus?.is_open ? <Badge tone="open"><i className="h-1.5 w-1.5 rounded-full bg-emerald-600" />{openStatus.label}</Badge> : <Badge><i className="h-1.5 w-1.5 rounded-full bg-stone-400" />{openStatus?.label || 'Closed'}</Badge>}{gym.categories?.map((category) => <Badge key={category.id}>{category.name}</Badge>)}</div>
                            </section>
                            {gym.description && <Panel title="About"><p className="whitespace-pre-line text-sm leading-7 text-stone-600">{gym.description}</p></Panel>}
                            {gym.facilities?.length > 0 && <Panel title="Facilities"><div className="flex flex-wrap gap-2">{gym.facilities.map((item) => <span key={item.id} className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-medium text-stone-700">{item.name}</span>)}</div></Panel>}
                            {formattedHours.length > 0 && <Hours hours={formattedHours} />}
                            {gym.membership_plans?.length > 0 && <Panel title="Membership plans"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{gym.membership_plans.map((plan) => <div key={plan.id} className="rounded-xl border border-stone-200 p-4"><p className="text-sm font-semibold">{plan.name}</p><p className="mt-3 text-2xl font-bold tracking-tight">RM {plan.price}</p><p className="mt-1 text-xs capitalize text-stone-500">{plan.billing_cycle === 'one_time' ? 'one-time' : `per ${plan.billing_cycle === 'yearly' ? 'year' : 'month'}`}</p>{plan.description && <p className="mt-3 text-xs leading-5 text-stone-500">{plan.description}</p>}</div>)}</div></Panel>}
                        </div>

                        <aside className="space-y-6">
                            <section className="rounded-2xl border border-stone-200 bg-white p-5 lg:sticky lg:top-24">
                                <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-stone-500">Contact & directions</h2>
                                <div className="mt-4 space-y-3 text-sm text-stone-600">{gym.phone_number && <Info label="Phone" value={gym.phone_number} />}{gym.whatsapp_number && <Info label="WhatsApp" value={gym.whatsapp_number} />}{gym.email && <Info label="Email" value={gym.email} />}{gym.website && <div><p className="text-xs font-medium text-stone-400">Website</p><a href={gym.website} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block break-all font-semibold text-stone-900 underline decoration-stone-300 underline-offset-4 hover:decoration-stone-950">Visit website</a></div>}</div>
                                <div className="mt-5 space-y-2 border-t border-stone-100 pt-5">
                                    {gym.whatsapp_number && <a href={`https://wa.me/${gym.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${gym.name}, I found your gym on GymFinder Perak!`)}`} target="_blank" rel="noopener noreferrer" className="block rounded-lg bg-stone-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-stone-700">Message on WhatsApp</a>}
                                    {gym.google_maps_url && <a href={gym.google_maps_url} target="_blank" rel="noopener noreferrer" className="block rounded-lg border border-stone-300 px-4 py-3 text-center text-sm font-semibold text-stone-700 transition hover:border-stone-950">Get directions</a>}
                                    {/* Full-width favorite link */}
                                    <Link
                                        href={route('gyms.favorite', gym.id)}
                                        method="post"
                                        as="button"
                                        preserveScroll
                                        className={`block w-full rounded-lg border px-4 py-3 text-center text-sm font-semibold transition ${
                                            isFavorited
                                                ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                                                : 'border-stone-300 text-stone-700 hover:border-stone-950'
                                        }`}
                                    >
                                        {isFavorited ? '♥ Saved to favorites' : '♡ Save to favorites'}
                                    </Link>
                                    {!hasReviewed ? <button onClick={() => setShowReviewModal(true)} className="w-full rounded-lg border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-950">Write a review</button> : <p className="rounded-lg bg-emerald-50 px-3 py-2 text-center text-xs font-medium text-emerald-800">You have reviewed this gym.</p>}
                                </div>
                                <Link href={reportUrl} className="mt-5 inline-flex text-xs font-medium text-stone-500 underline underline-offset-4 hover:text-stone-950">Report an issue</Link>
                            </section>
                            {hasReviews && <RecentReviews reviews={gym.reviews} />}
                        </aside>
                    </div>

                    {hasReviews && <AllReviews reviews={gym.reviews} canReview={!hasReviewed} onReview={() => setShowReviewModal(true)} />}
                    {gym.google_maps_url && <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6"><h2 className="text-lg font-bold tracking-[-0.025em]">Location</h2><p className="mt-2 text-sm text-stone-500">{gym.address}</p><a href={gym.google_maps_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-950">Open in Google Maps</a></section>}
                </div>
            </div>
            {showLightbox && mainImage && <Lightbox image={mainImage} name={gym.name} images={images} selected={selectedImage} select={setSelectedImage} close={() => setShowLightbox(false)} />}
            {showReviewModal && <ReviewModal gymName={gym.name} rating={rating} hoverRating={hoverRating} setRating={setRating} setHoverRating={setHoverRating} comment={comment} setComment={setComment} submit={submitReview} submitting={isSubmitting} close={() => setShowReviewModal(false)} />}
        </MainLayout>
    );
}

function Panel({ title, children }) { return <section className="rounded-2xl border border-stone-200 bg-white p-6"><h2 className="text-lg font-bold tracking-[-0.025em] text-stone-950">{title}</h2><div className="mt-4">{children}</div></section>; }
function Badge({ children, tone = 'default' }) { return <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${tone === 'open' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-stone-200 bg-white text-stone-600'}`}>{children}</span>; }
function Info({ label, value }) { return <div><p className="text-xs font-medium text-stone-400">{label}</p><p className="mt-1 break-words">{value}</p></div>; }
function StarRating({ value, small = false }) { const stars = Math.round(Number(value) || 0); return <div className="flex text-amber-500" aria-label={`${formatRating(value)} out of 5`}>{[1, 2, 3, 4, 5].map((star) => <svg key={star} className={small ? 'h-3.5 w-3.5' : 'h-4 w-4'} viewBox="0 0 20 20" fill={star <= stars ? 'currentColor' : 'none'} stroke="currentColor"><path d="m10 2.6 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 7.8l5-.7L10 2.6Z" strokeWidth="1.3" strokeLinejoin="round" /></svg>)}</div>; }
function Hours({ hours }) { const today = hours.find((hour) => hour.is_today); return <Panel title="Operating hours">{today && <div className="mb-4 flex items-center justify-between rounded-xl bg-stone-100 px-4 py-3"><div><p className="text-xs font-medium text-stone-500">Today · {today.day_name}</p><p className="mt-1 text-sm font-bold">{today.is_closed ? 'Closed' : `${today.open_time} – ${today.close_time}`}</p></div>{!today.is_closed && <span className="text-xs font-semibold text-emerald-700">Open now</span>}</div>}<div className="divide-y divide-stone-100">{hours.filter((hour) => !hour.is_today).map((hour, index) => <div key={index} className="flex justify-between gap-4 py-2.5 text-sm"><span className="font-medium text-stone-700">{hour.day_name}</span><span className={hour.is_closed ? 'font-medium text-red-700' : 'text-stone-500'}>{hour.is_closed ? 'Closed' : `${hour.open_time} – ${hour.close_time}`}</span></div>)}</div></Panel>; }
function Review({ review, compact = false }) { return <article className={compact ? 'border-b border-stone-100 pb-4 last:border-0 last:pb-0' : 'rounded-xl border border-stone-200 p-4'}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">{review.user?.name || 'Anonymous'}</p><div className="mt-1"><StarRating value={review.rating} small /></div></div>{!compact && <time className="text-xs text-stone-400">{new Date(review.created_at).toLocaleDateString()}</time>}</div><p className="mt-3 text-sm leading-6 text-stone-600">{review.comment || 'No comment provided.'}</p>{review.reply && <div className="mt-3 border-l-2 border-stone-300 pl-3"><p className="text-xs font-semibold text-stone-500">Owner response</p><p className="mt-1 text-sm text-stone-600">{review.reply.reply}</p></div>}</article>; }
function RecentReviews({ reviews }) { return <section className="rounded-2xl border border-stone-200 bg-white p-5"><div className="flex items-center justify-between"><h2 className="text-sm font-bold uppercase tracking-[0.12em] text-stone-500">Recent reviews</h2><span className="text-xs text-stone-400">{reviews.length} total</span></div><div className="mt-4 space-y-4">{reviews.slice(0, 3).map((review) => <Review key={review.id} review={review} compact />)}</div></section>; }
function AllReviews({ reviews, canReview, onReview }) { return <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-bold tracking-[-0.025em]">All reviews</h2><p className="mt-1 text-sm text-stone-500">{reviews.length} member review{reviews.length === 1 ? '' : 's'}</p></div>{canReview && <button onClick={onReview} className="rounded-lg bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700">Write a review</button>}</div><div className="mt-5 space-y-3">{reviews.map((review) => <Review key={review.id} review={review} />)}</div></section>; }
function Notification({ notification, close }) { return <div className={`mb-6 flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm font-medium ${notification.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}><p>{notification.message}</p><button onClick={close} className="text-current opacity-50 hover:opacity-100" aria-label="Dismiss notification">×</button></div>; }
function Lightbox({ image, name, images, selected, select, close }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/95 p-5" onClick={close}><button onClick={close} className="absolute right-5 top-5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white">Close</button><img src={image} alt={name} className="max-h-[82vh] max-w-full rounded-xl object-contain" onClick={(event) => event.stopPropagation()} />{images.length > 1 && <div className="absolute bottom-5 flex max-w-[90vw] gap-2 overflow-auto rounded-xl bg-white/10 p-2" onClick={(event) => event.stopPropagation()}>{images.map((item, index) => <button key={item} onClick={() => select(index)} className={`h-12 w-16 shrink-0 overflow-hidden rounded border-2 ${selected === index ? 'border-white' : 'border-transparent opacity-60'}`}><img src={item} alt={`Image ${index + 1}`} className="h-full w-full object-cover" /></button>)}</div>}</div>; }
function ReviewModal({ gymName, rating, hoverRating, setRating, setHoverRating, comment, setComment, submit, submitting, close }) { return <div className="fixed inset-0 z-50 grid place-items-center p-5"><button className="absolute inset-0 bg-stone-950/40 backdrop-blur-sm" onClick={close} aria-label="Close review form" /><div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-stone-400">Share your experience</p><h2 className="mt-1 text-xl font-bold">Review {gymName}</h2></div><button onClick={close} className="text-stone-400 hover:text-stone-950">×</button></div><form onSubmit={submit} className="mt-6 space-y-5"><div><label className="text-sm font-semibold">Your rating</label><div className="mt-2 flex items-center gap-1">{[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className={`text-3xl leading-none ${star <= (hoverRating || rating) ? 'text-amber-500' : 'text-stone-200'}`}>★</button>)}<span className="ml-2 text-sm text-stone-500">{rating ? `${rating}/5` : 'Select'}</span></div></div><div><label htmlFor="comment" className="text-sm font-semibold">Comment</label><textarea id="comment" value={comment} onChange={(event) => setComment(event.target.value)} rows="4" className="mt-2 w-full resize-none rounded-xl border-stone-300 text-sm text-stone-800 focus:border-stone-950 focus:ring-stone-950" placeholder="Share your experience at this gym..." /></div><div className="flex gap-3 border-t border-stone-100 pt-5"><button type="button" onClick={close} className="flex-1 rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-semibold">Cancel</button><button type="submit" disabled={submitting || !rating} className="flex-1 rounded-lg bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{submitting ? 'Submitting…' : 'Submit review'}</button></div></form></div></div>; }
function ArrowLeft() { return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m11 5-7 7 7 7m-7-7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function PinIcon() { return <svg className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11s-8-6-8-11a8 8 0 1 1 16 0Z" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" /></svg>; }
function HeartIcon({ filled = false }) { return <svg className="h-5 w-5" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" /></svg>; }