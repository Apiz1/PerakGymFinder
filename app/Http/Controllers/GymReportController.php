<?php

namespace App\Http\Controllers;

use App\Models\Gym;
use App\Models\GymReport;
use App\Models\Notification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class GymReportController extends Controller
{
    /**
     * The reason options shown on the report form — kept as a single
     * source of truth here so the labels shown to the user and the
     * values validated in store() can never drift out of sync.
     */
    private const REASONS = [
        'wrong_info' => 'Incorrect information (address, phone, hours, etc.)',
        'closed' => 'This gym has permanently closed',
        'duplicate' => 'Duplicate listing',
        'other' => 'Something else (e.g. broken equipment, facility issue)',
    ];

    /**
     * Report page for a specific gym — lets the user pick a reason before
     * submitting, rather than a bare inline form with no context.
     */
    public function create(Gym $gym): Response
    {
        abort_unless($gym->status === 'approved', 404);

        return Inertia::render('Gyms/Report', [
            'gym' => $gym->only(['id', 'name', 'slug', 'address']),
            'reasons' => collect(self::REASONS)
                ->map(fn ($label, $value) => ['value' => $value, 'label' => $label])
                ->values(),
        ]);
    }

    /**
     * Submit a report on a gym — open to any logged-in user (not role-gated,
     * same reasoning as GymOwnerApplicationController: reporting a problem
     * shouldn't require anything beyond having an account).
     */
    public function store(Request $request, Gym $gym): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => 'required|in:wrong_info,closed,duplicate,other',
            'description' => 'nullable|string|max:1000',
        ]);

        $report = GymReport::create([
            'gym_id' => $gym->id,
            'user_id' => Auth::id(),
            'reason' => $validated['reason'],
            'description' => $validated['description'] ?? null,
            'status' => 'open',
        ]);

        Notification::notifyAdmins('new_report', [
            'report_id' => $report->id,
            'gym_id' => $gym->id,
            'gym_name' => $gym->name,
            'reason' => $validated['reason'],
        ]);

        // Owner-only — unclaimed/scraped gyms (owner_id null) have nobody
        // to notify.
        if ($gym->owner_id) {
            Notification::notifyUser($gym->owner_id, 'new_report', [
                'report_id' => $report->id,
                'gym_id' => $gym->id,
                'gym_name' => $gym->name,
                'reason' => $validated['reason'],
            ]);
        }

        return redirect()
            ->route('gyms.show', $gym)
            ->with('success', 'Thanks — your report has been submitted for review.');
    }
}