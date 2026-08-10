<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\City;
use App\Models\District;
use App\Models\Facility;
use App\Models\State;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class EditGymController extends Controller
{
    /**
     * Edit form for the owner's own gym. No {gym} route parameter needed —
     * an owner only has one gym right now, so we just grab it from the
     * authenticated user rather than trusting an ID from the URL.
     */
    public function edit(): Response|RedirectResponse
    {
        $gym = Auth::user()->gyms()->first();

        if (! $gym) {
            return redirect()->route('owner.gym.create');
        }

        $gym->load(['facilities', 'categories']);

        return Inertia::render('Owner/Gym/Edit', [
            'gym' => $gym,
            'states' => State::orderBy('name')->get(['id', 'name']),
            'districts' => District::orderBy('name')->get(['id', 'name', 'state_id']),
            'cities' => City::orderBy('name')->get(['id', 'name', 'district_id']),
            'facilities' => Facility::orderBy('name')->get(['id', 'name']),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Saves changes. Note what's NOT editable here: `status`, `source`,
     * and `owner_id` — those stay admin-only (see AdminGymController).
     * An owner can update their listing's content, not its approval state.
     */
    public function update(Request $request): RedirectResponse
    {
        $gym = Auth::user()->gyms()->first();

        abort_unless($gym, 404);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'required|string|max:500',
            'state_id' => 'required|exists:states,id',
            'district_id' => 'required|exists:districts,id',
            'city_id' => 'required|exists:cities,id',
            'whatsapp_number' => 'nullable|string|max:20',
            'phone_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'facility_ids' => 'array',
            'facility_ids.*' => 'exists:facilities,id',
            'category_ids' => 'array',
            'category_ids.*' => 'exists:categories,id',
        ]);

        $gym->update(collect($validated)->except(['facility_ids', 'category_ids'])->toArray());
        $gym->facilities()->sync($validated['facility_ids'] ?? []);
        $gym->categories()->sync($validated['category_ids'] ?? []);

        return redirect()
            ->route('owner.dashboard')
            ->with('success', 'Your gym details have been updated.');
    }
}