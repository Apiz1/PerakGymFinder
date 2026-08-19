<?php

namespace App\Http\Controllers;

use App\Models\Gym;
use App\Models\GymReport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GymReportController extends Controller
{
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

        GymReport::create([
            'gym_id' => $gym->id,
            'user_id' => Auth::id(),
            'reason' => $validated['reason'],
            'description' => $validated['description'] ?? null,
            'status' => 'open',
        ]);

        return back()->with('success', 'Thanks — your report has been submitted for review.');
    }
}