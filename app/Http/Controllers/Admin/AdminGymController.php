<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\City;
use App\Models\District;
use App\Models\Facility;
use App\Models\Gym;
use App\Models\State;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminGymController extends Controller
{
    /**
     * List all gyms, filterable by status — this is the admin's
     * approval queue as well as the general gym management screen.
     */
    public function index(Request $request): Response
    {
        $status = $request->input('status'); // pending | approved | rejected | suspended | null (all)
        $search = $request->input('search');

        $gyms = Gym::query()
            ->with(['owner:id,name,email', 'state', 'district', 'city'])
            ->when($status, fn ($query) => $query->where('status', $status))
            ->when($search, function ($query, $search) {
                $query->where('name', 'ilike', "%{$search}%");
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Gyms/Index', [
            'gyms' => $gyms,
            'filters' => $request->only(['status', 'search']),
            'statusCounts' => Gym::query()
                ->selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
        ]);
    }

    /**
     * Full detail view for one gym — used both to review a pending
     * submission and to inspect/manage an already-approved listing.
     */
    public function show(Gym $gym): Response
    {
        $gym->load([
            'owner:id,name,email,phone',
            'state', 'district', 'city',
            'images', 'operatingHours', 'facilities', 'categories',
            'membershipPlans',
            'reviews' => fn ($query) => $query->latest()->with('user:id,name'),
            'reports' => fn ($query) => $query->where('status', 'open')->with('user:id,name'),
        ]);

        return Inertia::render('Admin/Gyms/Show', [
            'gym' => $gym,
        ]);
    }

    /**
     * Edit form — admin has full override rights on any gym's details,
     * same fields the owner themselves can edit.
     */
    public function edit(Gym $gym): Response
    {
        $gym->load(['facilities', 'categories']);

        return Inertia::render('Admin/Gyms/Edit', [
            'gym' => $gym,
            'states' => State::orderBy('name')->get(['id', 'name']),
            'districts' => District::where('state_id', $gym->state_id)->orderBy('name')->get(['id', 'name']),
            'cities' => City::where('district_id', $gym->district_id)->orderBy('name')->get(['id', 'name']),
            'facilities' => Facility::orderBy('name')->get(['id', 'name']),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Save admin edits to a gym's details.
     */
    public function update(Request $request, Gym $gym): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['required', 'string', 'max:255', Rule::unique('gyms', 'slug')->ignore($gym->id)],
            'description' => 'nullable|string',
            'address' => 'required|string|max:500',
            'state_id' => 'required|exists:states,id',
            'district_id' => 'required|exists:districts,id',
            'city_id' => 'required|exists:cities,id',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'whatsapp_number' => 'nullable|string|max:20',
            'phone_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'google_maps_url' => 'nullable|url|max:500',
            'facility_ids' => 'array',
            'facility_ids.*' => 'exists:facilities,id',
            'category_ids' => 'array',
            'category_ids.*' => 'exists:categories,id',
        ]);

        $gym->update(collect($validated)->except(['facility_ids', 'category_ids'])->toArray());
        $gym->facilities()->sync($validated['facility_ids'] ?? []);
        $gym->categories()->sync($validated['category_ids'] ?? []);

        return redirect()
            ->route('admin.gyms.show', $gym)
            ->with('success', 'Gym details updated.');
    }

    /**
     * Approve a pending gym listing (or reinstate a suspended one).
     */
    public function approve(Gym $gym): RedirectResponse
    {
        $gym->update(['status' => 'approved']);

        return back()->with('success', "{$gym->name} has been approved and is now live.");
    }

    /**
     * Reject a pending submission.
     */
    public function reject(Gym $gym): RedirectResponse
    {
        $gym->update(['status' => 'rejected']);

        return back()->with('success', "{$gym->name} has been rejected.");
    }

    /**
     * Take a live gym down without deleting its data —
     * e.g. reported as closed, policy violation, owner dispute.
     */
    public function suspend(Gym $gym): RedirectResponse
    {
        $gym->update(['status' => 'suspended']);

        return back()->with('success', "{$gym->name} has been suspended.");
    }

    /**
     * Permanently remove a gym listing and everything attached to it
     * (images, reviews, etc. cascade-delete via the migration's FKs).
     */
    public function destroy(Gym $gym): RedirectResponse
    {
        $gym->delete();

        return redirect()
            ->route('admin.gyms.index')
            ->with('success', 'Gym deleted.');
    }
}