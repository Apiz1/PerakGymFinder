<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use App\Models\Gym;
use App\Models\GymOwnerApplication;
use App\Models\GymReport;
use App\Models\Review;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],

            'turnstileSiteKey' => config('services.turnstile.site_key'),
            'pendingCounts' => fn () => $this->pendingCounts($request),
            'ownerPendingCounts' => fn () => $this->ownerPendingCounts($request),
        ];
    }

     /**
     * Sidebar badge counts — only queried for super admins, since this
     * data has no meaning (and shouldn't be queried) for regular users
     * or gym owners hitting unrelated pages.
     */
    private function pendingCounts(Request $request): ?array
    {
        if (! $request->user()?->isSuperAdmin()) {
            return null;
        }

        return [
            'owners' => GymOwnerApplication::where('status', 'pending')->count(),
            'gyms' => Gym::where('status', 'pending')->count(),
            'reviews' => Review::where('status', 'pending')->count(),
            'reports' => GymReport::where('status', 'open')->count(),
        ];
    }

    /**
     * Owner sidebar badge counts — scoped to the owner's own gym only.
     * Reports respect the same OWNER_VISIBLE_REASONS restriction as
     * OwnerReportController, so the badge never counts a closed/duplicate
     * report the owner isn't allowed to actually open.
     */
    private function ownerPendingCounts(Request $request): ?array
    {
        $user = $request->user();

        if (! $user || (! $user->isGymOwner() && ! $user->isSuperAdmin())) {
            return null;
        }

        $gym = $user->gyms()->first();

        if (! $gym) {
            return null;
        }

        return [
            'reports' => $gym->reports()
                ->where('status', 'open')
                ->whereIn('reason', ['wrong_info', 'other'])
                ->count(),
            'reviews' => $gym->reviews()
                ->approved()
                ->whereDoesntHave('reply')
                ->count(),
        ];
    }
}
