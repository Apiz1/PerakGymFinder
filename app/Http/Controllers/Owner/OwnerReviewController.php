<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OwnerReviewController extends Controller
{
    /**
     * List reviews on the owner's gym, with any existing reply loaded.
     * Read-only overview — replying happens via storeReply/updateReply below.
     */
    public function index(): Response|RedirectResponse
    {
        $gym = Auth::user()->gyms()->first();

        if (! $gym) {
            return redirect()->route('owner.gym.create');
        }

        return Inertia::render('Owner/Gym/Reviews', [
            'gym' => $gym->only(['id', 'name', 'status']),
            'reviews' => $gym->reviews()
                ->approved()
                ->with(['user:id,name', 'reply'])
                ->latest()
                ->get(),
        ]);
    }

    /**
     * Post a reply to a review. review_replies has unique(review_id), so
     * the DB itself blocks a second reply — this checks first to fail
     * with a clean message instead of a raw constraint-violation error.
     */
    public function storeReply(Request $request, Review $review): RedirectResponse
    {
        $this->authorizeOwnership($review);

        if ($review->reply()->exists()) {
            return back()->with('error', 'You have already replied to this review.');
        }

        $validated = $request->validate([
            'reply' => 'required|string|max:2000',
        ]);

        $review->reply()->create([
            'user_id' => Auth::id(),
            'reply' => $validated['reply'],
        ]);

        return back()->with('success', 'Reply posted.');
    }

    /**
     * Edit an existing reply — review_replies has full timestamps (unlike
     * most tables in this schema, which are append-only with created_at
     * only), so editing after posting is intentionally supported here.
     */
    public function updateReply(Request $request, Review $review): RedirectResponse
    {
        $this->authorizeOwnership($review);

        $reply = $review->reply;

        abort_unless($reply, 404);

        $validated = $request->validate([
            'reply' => 'required|string|max:2000',
        ]);

        $reply->update(['reply' => $validated['reply']]);

        return back()->with('success', 'Reply updated.');
    }

    /**
     * Confirms the review actually belongs to the authenticated owner's
     * own gym — without this, an owner could pass any {review} ID in the
     * URL and reply to reviews on a completely different gym.
     */
    private function authorizeOwnership(Review $review): void
    {
        abort_unless($review->gym->owner_id === Auth::id(), 403);
    }
}