<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    /**
     * Admin-only view of all logged activity across the platform —
     * gyms, reports, owner applications, claim requests, and user role
     * changes. Filterable by subject type, event, and causer so an admin
     * can answer "who did this and when" without digging through the DB.
     */
    public function index(Request $request): Response
    {
        $activities = Activity::query()
            ->with(['causer:id,name,email', 'subject'])
            ->when($request->input('subject_type'), function ($query, $type) {
                // Accepts short names like "gym", "report" rather than
                // requiring the full "App\Models\Gym" class string in the URL.
                $query->where('subject_type', $this->resolveSubjectType($type));
            })
            ->when($request->input('event'), function ($query, $event) {
                $query->where('event', $event);
            })
            ->when($request->input('causer_id'), function ($query, $causerId) {
                $query->where('causer_id', $causerId);
            })
            ->when($request->input('date_from'), function ($query, $date) {
                $query->whereDate('created_at', '>=', $date);
            })
            ->when($request->input('date_to'), function ($query, $date) {
                $query->whereDate('created_at', '<=', $date);
            })
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Admin/ActivityLog/Index', [
            'activities' => $activities,
            'filters' => $request->only(['subject_type', 'event', 'causer_id', 'date_from', 'date_to']),
            'subjectTypes' => $this->availableSubjectTypes(),
        ]);
    }

    /**
     * Full detail of a single activity entry — including the before/after
     * property diff, which the index list intentionally doesn't show in
     * full (keeps the table scannable).
     */
    public function show(Activity $activity): Response
    {
        $activity->load(['causer:id,name,email', 'subject']);

        return Inertia::render('Admin/ActivityLog/Show', [
            'activity' => $activity,
        ]);
    }

    /**
     * Maps friendly URL-safe names to fully-qualified model classes, so
     * filter dropdowns don't need to expose "App\Models\Gym" in the query
     * string.
     */
    private function resolveSubjectType(string $type): string
    {
        return match ($type) {
            'gym' => \App\Models\Gym::class,
            'report' => \App\Models\GymReport::class,
            'owner_application' => \App\Models\GymOwnerApplication::class,
            'claim_request' => \App\Models\GymClaimRequest::class,
            'user' => \App\Models\User::class,
            'review' => \App\Models\Review::class,
            default => $type,
        };
    }

    private function availableSubjectTypes(): array
    {
        return [
            ['value' => 'gym', 'label' => 'Gyms'],
            ['value' => 'report', 'label' => 'Reports'],
            ['value' => 'owner_application', 'label' => 'Owner Applications'],
            ['value' => 'claim_request', 'label' => 'Claim Requests'],
            ['value' => 'user', 'label' => 'Users'],
            ['value' => 'review', 'label' => 'Reviews'],
        ];
    }
}