<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Facility;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OwnerFacilitiesController extends Controller
{
    /**
     * Facilities & categories tagging page — same "no {gym} param, no
     * missing gym prop" pattern as the other owner controllers.
     */
    public function edit(): Response|RedirectResponse
    {
        $gym = Auth::user()->gyms()->first();

        if (! $gym) {
            return redirect()->route('owner.gym.create');
        }

        $gym->load(['facilities:id', 'categories:id']);

        return Inertia::render('Owner/Gym/Facilities', [
            'gym' => $gym->only(['id', 'name', 'status']),
            'facilities' => Facility::orderBy('name')->get(['id', 'name', 'icon']),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'selectedFacilityIds' => $gym->facilities->pluck('id'),
            'selectedCategoryIds' => $gym->categories->pluck('id'),
        ]);
    }

    /**
     * Syncs the gym's facility/category tags. sync() replaces the full
     * set each time — safe to call with an empty array to clear all tags.
     */
    public function update(Request $request): RedirectResponse
    {
        $gym = Auth::user()->gyms()->first();

        abort_unless($gym, 404);

        $validated = $request->validate([
            'facility_ids' => 'array',
            'facility_ids.*' => 'exists:facilities,id',
            'category_ids' => 'array',
            'category_ids.*' => 'exists:categories,id',
        ]);

        $gym->facilities()->sync($validated['facility_ids'] ?? []);
        $gym->categories()->sync($validated['category_ids'] ?? []);

        return redirect()
            ->route('owner.gym.facilities.edit')
            ->with('success', 'Facilities and categories updated.');
    }
}