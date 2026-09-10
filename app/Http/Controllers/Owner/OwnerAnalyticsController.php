<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OwnerAnalyticsController extends Controller
{
    /**
     * Analytics dashboard for the owner's own gym — no {gym} param, same
     * pattern as every other Owner controller in this app.
     */
    public function index(): Response|RedirectResponse
    {
        $gym = Auth::user()->gyms()->first();

        if (! $gym) {
            return redirect()->route('owner.gym.create');
        }

        return Inertia::render('Owner/Gym/Analytics', [
            'gym' => $gym->only(['id', 'name', 'status', 'average_rating']),
            'summary' => $this->summary($gym),
            'ratingBreakdown' => $this->ratingBreakdown($gym),
            'reviewsOverTime' => $this->reviewsOverTime($gym),
            'reportStats' => $this->reportStats($gym),
        ]);
    }

    /**
     * Top-line numbers for the summary cards.
     */
    private function summary($gym): array
    {
        return [
            'totalReviews' => $gym->reviews()->approved()->count(),
            'averageRating' => (float) $gym->average_rating,
            'totalFavorites' => $gym->favorites()->count(),
            'activeMembershipPlans' => $gym->membershipPlans()->where('is_active', true)->count(),
            'openReports' => $gym->reports()->where('status', 'open')->count(),
        ];
    }

    /**
     * 1-5 star distribution — powers a bar chart showing how ratings
     * are spread out, not just the single average.
     */
    private function ratingBreakdown($gym): array
    {
        $counts = $gym->reviews()
            ->approved()
            ->selectRaw('rating, count(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating');

        return collect(range(1, 5))
            ->mapWithKeys(fn ($star) => [$star => $counts->get($star, 0)])
            ->toArray();
    }

    /**
     * Review volume over the last 30 days, grouped by day — powers a
     * line chart showing whether reviews are trending up or down.
     */
    private function reviewsOverTime($gym): array
    {
        return $gym->reviews()
            ->approved()
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw("to_char(created_at, 'YYYY-MM-DD') as date, count(*) as count")
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => ['date' => $row->date, 'count' => (int) $row->count])
            ->toArray();
    }

    /**
     * Open vs resolved, scoped to reasons the owner is allowed to see —
     * same restriction as OwnerReportController.
     */
    private function reportStats($gym): array
    {
        return [
            'open' => $gym->reports()
                ->whereIn('reason', ['wrong_info', 'other'])
                ->where('status', 'open')
                ->count(),
            'resolved' => $gym->reports()
                ->whereIn('reason', ['wrong_info', 'other'])
                ->where('status', 'resolved')
                ->count(),
        ];
    }
}