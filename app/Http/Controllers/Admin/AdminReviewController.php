<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminReviewController extends Controller
{
    /**
     * Moderation queue — every review across every gym, filterable by status.
     */
    public function index(Request $request): Response
    {
        $status = $request->input('status');

        $reviews = Review::query()
            ->with(['gym:id,name', 'user:id,name,email', 'reply'])
            ->when($status, fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $counts = Review::query()
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => $reviews,
            'filters' => $request->only('status'),
            'statusCounts' => [
                'pending' => $counts->get('pending', 0),
                'approved' => $counts->get('approved', 0),
                'flagged' => $counts->get('flagged', 0),
                'all' => $counts->sum(),
            ],
        ]);
    }

    /**
     * Approve a review — makes it visible on the gym's public profile.
     */
    public function approve(Review $review): RedirectResponse
    {
        $review->update(['status' => 'approved']);
        $this->recalculateGymRating($review);

        return back()->with('success', 'Review approved.');
    }

    /**
     * Flag a review — hides it from the public gym page without deleting
     * it, e.g. suspected fake review or abusive language pending investigation.
     */
    public function flag(Review $review): RedirectResponse
    {
        $review->update(['status' => 'flagged']);
        $this->recalculateGymRating($review);

        return back()->with('success', 'Review flagged and hidden from public view.');
    }

    /**
     * Permanently delete a review. The owner's reply (if any) cascades with
     * it via the review_replies FK.
     */
    public function destroy(Review $review): RedirectResponse
    {
        $gym = $review->gym;
        $review->delete();
        $this->recalculateGymRating($review, $gym);

        return back()->with('success', 'Review deleted.');
    }

    /**
     * gyms.average_rating / total_reviews are denormalized for fast search
     * sorting (see the Gym model's comment on this) — nothing currently
     * keeps them in sync automatically, so any status change or deletion
     * here has to recompute them manually. Only `approved` reviews count
     * toward the public rating, matching AdminController's dashboard metric.
     */
    private function recalculateGymRating(Review $review, ?\App\Models\Gym $gym = null): void
    {
        $gym ??= $review->gym;

        $approved = $gym->reviews()->approved();

        $gym->update([
            'average_rating' => $approved->avg('rating') ?? 0,
            'total_reviews' => $approved->count(),
        ]);
    }
}