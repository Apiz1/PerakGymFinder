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
     * Reasons an owner is allowed to see. closed/duplicate are admin-only
     * moderation concerns — an owner has no business seeing "someone
     * reported this gym as permanently closed", since resolving that is
     * an admin decision, not something the owner acts on.
     */
    private const OWNER_VISIBLE_REASONS = ['wrong_info', 'other'];

    public function index(): Response|RedirectResponse
    {
        $gym = Auth::user()->gyms()->first();

        if (! $gym) {
            return redirect()->route('owner.gym.create');
        }

        return Inertia::render('Owner/Gym/Reports', [
            'gym' => $gym->only(['id', 'name', 'status']),
            'reports' => $gym->reports()
                ->whereIn('reason', self::OWNER_VISIBLE_REASONS)
                ->with('user:id,name')
                ->latest()
                ->get(),
        ]);
    }

    public function show(GymReport $report): Response
    {
        $report->load(['gym', 'user:id,name,email']);

        return Inertia::render('Owner/Gym/ReportShow', [
            'report' => $report,
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