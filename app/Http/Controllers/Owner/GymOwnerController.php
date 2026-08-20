<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class GymOwnerController extends Controller
{
    /**
     * If the owner has no gym yet (promoted via a "new gym" application,
     * not a "claim" one), send them to CreateGymController instead of
     * showing an empty dashboard.
     */
    public function dashboard(): Response|RedirectResponse
    {
        $gym = Auth::user()->gyms()->first();

        if (! $gym) {
            return redirect()->route('owner.gym.create');
        }

        $gym->load(['state', 'district', 'city', 'images']);

        $weekAgo = Carbon::now()->subDays(7);

        return Inertia::render('Owner/Dashboard', [
            'gym' => $gym,

            // Separate from $gym itself so the widget always gets exactly
            // what it needs (reviewer name + reply status) without relying
            // on whatever sub-relations happened to be eager-loaded elsewhere.
            'recentReviews' => $gym->reviews()
                ->approved()
                ->with(['user:id,name', 'reply'])
                ->latest()
                ->limit(5)
                ->get(),

            'stats' => [
                'totalViews' => $gym->total_views,
                // No per-view timestamp log exists (total_views is just a
                // running counter bumped in GymController::show()), so a
                // real "views this week" figure isn't derivable yet — sent
                // as null rather than faking a number. Would need a
                // separate gym_views log table (gym_id, created_at) to
                // support this properly.
                'viewsThisWeek' => null,

                'averageRating' => (float) $gym->average_rating,
                'totalReviews' => $gym->total_reviews,

                'pendingReplies' => $gym->reviews()
                    ->approved()
                    ->whereDoesntHave('reply')
                    ->count(),

                'favoritesCount' => $gym->favorites()->count(),
                'favoritesThisWeek' => $gym->favorites()
                    ->where('created_at', '>=', $weekAgo)
                    ->count(),
            ],
        ]);
    }
}