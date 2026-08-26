<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GymOwnerApplication;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminGymOwnerApplicationController extends Controller
{
    /**
     * Admin's queue of applications — the promotion requests waiting for review.
     */
    public function index(Request $request): Response
    {
        $status = $request->input('status', 'pending');
        $search = $request->input('search');

        $applications = GymOwnerApplication::query()
            ->with(['user:id,name,email', 'gym:id,name,address'])
            ->when($status, fn ($query) => $query->where('status', $status))
            ->when($search, function ($query, $search) {
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'ilike', "%{$search}%");
                })->orWhereHas('gym', function ($q) use ($search) {
                    $q->where('name', 'ilike', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $counts = GymOwnerApplication::query()
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return Inertia::render('Admin/OwnerApplications/Index', [
            'applications' => $applications,
            'filters' => $request->only('status', 'search'),
            'statusCounts' => [
                'pending' => $counts->get('pending', 0),
                'approved' => $counts->get('approved', 0),
                'rejected' => $counts->get('rejected', 0),
                'all' => $counts->sum(),
            ],
        ]);
    }

    /**
     * Full detail view — the business doc, the applicant, and either
     * the existing gym they want to claim or their proposed new gym details.
     */
    public function show(GymOwnerApplication $ownerApplication): Response
    {
        $ownerApplication->load(['user:id,name,email,phone', 'gym', 'reviewer:id,name']);

        return Inertia::render('Admin/OwnerApplications/Show', [
            'application' => $ownerApplication,
        ]);
    }

    /**
     * Approve — this is the actual promotion.
     *
     * - Flips the applicant's role from `user` to `gym_owner`.
     * - If claiming an existing gym, attaches ownership immediately (gym goes live under them).
     * - If it was a brand-new gym submission, NO gym is created here — the newly
     *   promoted owner creates it themselves from their dashboard, prefilled from
     *   proposed_gym_details. This keeps one consistent path for both cases:
     *   promotion happens at approval, gym creation/attachment is a separate step
     *   the owner controls and reviews before anything goes public.
     */
    public function approve(GymOwnerApplication $ownerApplication): RedirectResponse
    {
        if ($ownerApplication->status !== 'pending') {
            return back()->with('error', 'This application has already been reviewed.');
        }

        DB::transaction(function () use ($ownerApplication) {
            $gymOwnerRole = Role::where('name', 'gym_owner')->firstOrFail();

            $ownerApplication->user->update(['role_id' => $gymOwnerRole->id]);

            if ($ownerApplication->gym_id) {
                $ownerApplication->gym->update(['owner_id' => $ownerApplication->user_id]);
            }

            $ownerApplication->update([
                'status' => 'approved',
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
            ]);
        });

        return back()->with('success', "{$ownerApplication->user->name} has been approved as a gym owner.");
    }

    /**
     * Streams the applicant's business document — deliberately NOT a public URL.
     * This route is behind `role:super_admin` (see routes/web.php), so only an
     * authenticated admin can ever reach it, unlike a direct storage/public link.
     */
    public function downloadDocument(GymOwnerApplication $ownerApplication): StreamedResponse
    {
        abort_unless(
            $ownerApplication->business_doc_path && Storage::disk('local')->exists($ownerApplication->business_doc_path),
            404
        );

        return Storage::disk('local')->download($ownerApplication->business_doc_path);
    }

    /**
     * Reject — no role change, no gym attached. The applicant stays a plain user.
     */
    public function reject(Request $request, GymOwnerApplication $ownerApplication): RedirectResponse
    {
        if ($ownerApplication->status !== 'pending') {
            return back()->with('error', 'This application has already been reviewed.');
        }

        $ownerApplication->update([
            'status' => 'rejected',
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', "{$ownerApplication->user->name}'s application has been rejected.");
    }

    public function destroy(GymOwnerApplication $ownerApplication ): RedirectResponse
    {
        $ownerApplication ->delete();

        return redirect()
            ->route('admin.owner-applications.index')
            ->with('success', 'Application deleted.');
    }
}