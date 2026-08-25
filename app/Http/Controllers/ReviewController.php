<?php

namespace App\Http\Controllers;

use App\Models\Gym;
use App\Models\Notification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Submit a review on a gym. reviews has unique(gym_id, user_id) at the
     * DB level, so a second review from the same user is blocked outright —
     * checked here first for a clean message instead of a raw SQL error.
     */
    public function store(Request $request, Gym $gym): RedirectResponse
    {
        if ($gym->reviews()->where('user_id', Auth::id())->exists()) {
            return back()->with('error', 'You have already reviewed this gym.');
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:2000',
        ]);

        $review = $gym->reviews()->create([
            'user_id' => Auth::id(),
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
            'status' => 'approved', // auto-approved for now; flip to 'pending' if you want reviews moderated before going live
        ]);

        $this->recalculateGymRating($gym);

        // Owner-only — unclaimed/scraped gyms (owner_id null) have nobody
        // to notify, same guard used for the report notification below.
        if ($gym->owner_id) {
            Notification::notifyUser($gym->owner_id, 'new_review', [
                'review_id' => $review->id,
                'gym_id' => $gym->id,
                'gym_name' => $gym->name,
                'rating' => $review->rating,
                'reviewer_name' => Auth::user()->name,
            ]);
        }

        return back()->with('success', 'Your review has been posted.');
    }

    /**
     * Same recalculation logic as AdminReviewController — kept in sync
     * manually for now. Worth extracting into a Review model observer
     * once a third place needs this same logic, so both controllers stop
     * duplicating it.
     */
    private function recalculateGymRating(Gym $gym): void
    {
        $approved = $gym->reviews()->approved();

        // average_rating/total_reviews are deliberately NOT in Gym's $fillable
        // (they shouldn't be mass-assignable from user-facing request data) —
        // so forceFill()->save() is used here instead of update(), which would
        // otherwise silently do nothing to these two columns.
        $gym->forceFill([
            'average_rating' => $approved->avg('rating') ?? 0,
            'total_reviews' => $approved->count(),
        ])->save();
    }
}