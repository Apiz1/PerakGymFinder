<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\District;
use App\Models\State;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    /**
     * Full location tree — small enough (currently 1 state, 12 districts,
     * ~35 cities) to load entirely in one page rather than paginating.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Locations/Index', [
            'states' => State::with(['districts.cities'])
                ->withCount('gyms')
                ->orderBy('name')
                ->get(),
        ]);
    }

    /**
     * Add a new state — the screen you'd use the day GymFinder expands
     * beyond Perak.
     */
    public function storeState(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
        ]);

        State::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
        ]);

        return back()->with('success', "{$validated['name']} added.");
    }

    public function storeDistrict(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'state_id' => 'required|exists:states,id',
            'name' => 'required|string|max:100',
        ]);

        District::create($validated);

        return back()->with('success', "{$validated['name']} added.");
    }

    public function storeCity(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'district_id' => 'required|exists:districts,id',
            'name' => 'required|string|max:100',
        ]);

        City::create($validated);

        return back()->with('success', "{$validated['name']} added.");
    }

    /**
     * Deleting is guarded — states/districts/cities are referenced by
     * gyms.state_id/district_id/city_id with a plain foreign key (no
     * cascade), so the database itself blocks deletion while any gym
     * still points to it. Catches that and turns it into a clean message
     * instead of a raw 500 QueryException.
     */
    public function destroyState(State $state): RedirectResponse
    {
        return $this->safeDelete($state, 'state');
    }

    public function destroyDistrict(District $district): RedirectResponse
    {
        return $this->safeDelete($district, 'district');
    }

    public function destroyCity(City $city): RedirectResponse
    {
        return $this->safeDelete($city, 'city');
    }

    private function safeDelete($model, string $label): RedirectResponse
    {
        try {
            $model->delete();
        } catch (QueryException $e) {
            return back()->with(
                'error',
                "Can't delete this {$label} — one or more gyms are still assigned to it."
            );
        }

        return back()->with('success', ucfirst($label).' removed.');
    }
}