<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Facility;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TaxonomyController extends Controller
{
    /**
     * Facilities and categories management — the fixed tag lists gym
     * owners pick from (see OwnerFacilitiesController). Small, static
     * data seeded via FacilityCategorySeeder; this is for occasional
     * additions/removals, not a high-traffic screen.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Taxonomy/Index', [
            'facilities' => Facility::withCount('gyms')->orderBy('name')->get(),
            'categories' => Category::withCount('gyms')->orderBy('name')->get(),
        ]);
    }

    public function storeFacility(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:facilities,name',
            'icon' => 'nullable|string|max:100',
        ]);

        Facility::create($validated);

        return back()->with('success', "{$validated['name']} added.");
    }

    public function storeCategory(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:categories,name',
        ]);

        Category::create($validated);

        return back()->with('success', "{$validated['name']} added.");
    }

    /**
     * No FK-block guard needed here (unlike LocationController) — the
     * gym_facility/gym_category pivot rows cascadeOnDelete, so removing
     * a facility just silently detaches it from every gym that had it.
     */
    public function destroyFacility(Facility $facility): RedirectResponse
    {
        $facility->delete();

        return back()->with('success', 'Facility removed.');
    }

    public function destroyCategory(Category $category): RedirectResponse
    {
        $category->delete();

        return back()->with('success', 'Category removed.');
    }
}