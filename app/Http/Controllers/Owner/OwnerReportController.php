<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\GymReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OwnerReportController extends Controller
{
    /**
     * Reports filed against the owner's own gym — same "no {gym} param"
     * pattern as Photos/Hours/Facilities/Reviews. Read + acknowledge only;
     * owners can't dismiss or resolve reports themselves (see below).
     */
    public function index(): Response|RedirectResponse
    {
        $gym = Auth::user()->gyms()->first();

        if (! $gym) {
            return redirect()->route('owner.gym.create');
        }

        return Inertia::render('Owner/Gym/Reports', [
            'gym' => $gym->only(['id', 'name', 'status']),
            'reports' => $gym->reports()
                ->with('user:id,name')
                ->latest()
                ->get(),
        ]);
    }

    /**
     * Marks a report as "seen" by moving it from open -> resolved, purely
     * from the owner's side acknowledging it (e.g. "yes, I fixed the
     * treadmill"). Deliberately NOT the same as admin dismissing a report
     * as invalid/spam — an owner marking their own reports resolved is a
     * different trust level than admin moderation, but still useful so
     * their report list doesn't stay cluttered with things they've handled.
     */
    public function markResolved(GymReport $report): RedirectResponse
    {
        $this->authorizeOwnership($report);

        $report->update(['status' => 'resolved']);

        return back()->with('success', 'Report marked as resolved.');
    }

    /**
     * Confirms the report actually belongs to the authenticated owner's
     * own gym — without this, an owner could pass any {report} ID in the
     * URL and resolve reports on a completely different gym.
     */
    private function authorizeOwnership(GymReport $report): void
    {
        abort_unless($report->gym->owner_id === Auth::id(), 403);
    }
}