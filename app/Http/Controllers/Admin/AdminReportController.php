<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GymReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminReportController extends Controller
{
    /**
     * Report queue — user-submitted "this gym is wrong/closed/duplicate"
     * reports, filterable by status. Same statusCounts pattern as
     * AdminReviewController and AdminGymOwnerApplicationController.
     */
    public function index(Request $request): Response
    {
        $status = $request->input('status', 'open');

        $reports = GymReport::query()
            ->with(['gym:id,name,status', 'user:id,name,email'])
            ->when($status, fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $counts = GymReport::query()
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return Inertia::render('Admin/Reports/Index', [
            'reports' => $reports,
            'filters' => $request->only('status'),
            'statusCounts' => [
                'open' => $counts->get('open', 0),
                'resolved' => $counts->get('resolved', 0),
                'dismissed' => $counts->get('dismissed', 0),
                'all' => $counts->sum(),
            ],
        ]);
    }

    /**
     * Full detail view — the report plus the gym it's about, so admin
     * can act on the underlying issue directly from here.
     */
    public function show(GymReport $report): Response
    {
        $report->load(['gym', 'user:id,name,email']);

        return Inertia::render('Admin/Reports/Show', [
            'report' => $report,
        ]);
    }

    /**
     * Mark a report as resolved — the underlying issue was fixed
     * (e.g. admin corrected the gym's info, or suspended a closed gym).
     * Doesn't touch the gym itself; resolving the report and acting on
     * the gym (via AdminGymController) are separate, deliberate steps.
     */
    public function resolve(GymReport $report): RedirectResponse
    {
        if ($report->status !== 'open') {
            return back()->with('error', 'This report has already been reviewed.');
        }

        $report->update(['status' => 'resolved']);

        return back()->with('success', 'Report marked as resolved.');
    }

    /**
     * Dismiss a report — reviewed and found not actionable
     * (e.g. duplicate report, or the info was actually correct).
     */
    public function dismiss(GymReport $report): RedirectResponse
    {
        if ($report->status !== 'open') {
            return back()->with('error', 'This report has already been reviewed.');
        }

        $report->update(['status' => 'dismissed']);

        return back()->with('success', 'Report dismissed.');
    }
}