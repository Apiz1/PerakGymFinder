<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\MembershipPlan;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OwnerMembershipController extends Controller
{
    /**
     * List the owner's membership plans. Unlike Photos/Hours (which manage
     * fixed sub-resources of the gym), a gym can have MANY plans — so this
     * one needs {membershipPlan} route params on update/destroy, with an
     * ownership check on each, same reasoning as PhotoGymController.
     */
    public function index(): Response|RedirectResponse
    {
        $gym = Auth::user()->gyms()->first();

        if (! $gym) {
            return redirect()->route('owner.gym.create');
        }

        return Inertia::render('Owner/Gym/Memberships', [
            'gym' => $gym->only(['id', 'name', 'status']),
            'plans' => $gym->membershipPlans()->orderBy('price')->get(),
        ]);
    }

    /**
     * Create a new plan.
     */
    public function store(Request $request): RedirectResponse
    {
        $gym = Auth::user()->gyms()->first();

        abort_unless($gym, 404);

        $maxPlans = Setting::get('max_membership_plans', 10);
        $currentCount = $gym->membershipPlans()->count();

        if ($currentCount >= $maxPlans) {
            return back()->withErrors([
                'name' => "You can have at most {$maxPlans} membership plans per gym.",
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'price' => 'required|numeric|min:0|max:99999.99',
            'billing_cycle' => 'required|in:monthly,yearly,one_time',
            'description' => 'nullable|string',
        ]);

        $gym->membershipPlans()->create([
            ...$validated,
            'is_active' => true,
        ]);

        return back()->with('success', 'Membership plan added.');
    }

    /**
     * Update an existing plan. Note: no {gym} in the route — ownership is
     * verified via the plan's own gym relationship instead (see below).
     */
    public function update(Request $request, MembershipPlan $membershipPlan): RedirectResponse
    {
        $this->authorizeOwnership($membershipPlan);

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'price' => 'required|numeric|min:0|max:99999.99',
            'billing_cycle' => 'required|in:monthly,yearly,one_time',
            'description' => 'nullable|string',
        ]);

        $membershipPlan->update($validated);

        return back()->with('success', 'Membership plan updated.');
    }

    /**
     * Toggle a plan active/inactive without a full edit — e.g. temporarily
     * hiding a promo plan without deleting its data.
     */
    public function toggleActive(MembershipPlan $membershipPlan): RedirectResponse
    {
        $this->authorizeOwnership($membershipPlan);

        $membershipPlan->update(['is_active' => ! $membershipPlan->is_active]);

        return back()->with('success', $membershipPlan->is_active ? 'Plan activated.' : 'Plan deactivated.');
    }

    /**
     * Delete a plan permanently.
     */
    public function destroy(MembershipPlan $membershipPlan): RedirectResponse
    {
        $this->authorizeOwnership($membershipPlan);

        $membershipPlan->delete();

        return back()->with('success', 'Membership plan removed.');
    }

    /**
     * Confirms the plan actually belongs to the authenticated owner's own
     * gym — without this, an owner could pass any {membershipPlan} ID in
     * the URL and edit/delete pricing belonging to a different gym entirely.
     */
    private function authorizeOwnership(MembershipPlan $membershipPlan): void
    {
        abort_unless($membershipPlan->gym->owner_id === Auth::id(), 403);
    }
}