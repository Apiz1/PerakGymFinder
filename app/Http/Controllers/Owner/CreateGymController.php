<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\City;
use App\Models\District;
use App\Models\Facility;
use App\Models\Gym;
use App\Models\GymOwnerApplication;
use App\Models\State;
use App\Models\Notification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CreateGymController extends Controller
{
    /**
     * Create-my-gym form. Prefilled from the owner's approved application
     * if they came through the "brand-new gym" path (proposed_gym_details).
     * If they came through "claim an existing gym", they already have a
     * gym attached and never hit this page — see the dashboard redirect logic.
     */
    public function create(): Response|RedirectResponse
    {
        if (Auth::user()->gyms()->exists()) {
            return redirect()->route('owner.dashboard');
        }

        $approvedApplication = GymOwnerApplication::where('user_id', Auth::id())
            ->where('status', 'approved')
            ->whereNull('gym_id') // the "new gym" path, not a claim
            ->latest()
            ->first();

        return Inertia::render('Owner/Gym/Create', [
            'prefill' => $approvedApplication?->proposed_gym_details,
            'states' => State::orderBy('name')->get(['id', 'name']),
            'districts' => District::orderBy('name')->get(['id', 'name', 'state_id']),
            'cities' => City::orderBy('name')->get(['id', 'name', 'district_id']),
            'facilities' => Facility::orderBy('name')->get(['id', 'name']),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Creates the gym. Still goes in as `status: pending` — becoming a
     * gym_owner and publishing a gym are two separate approval gates.
     */
    public function store(Request $request): RedirectResponse
    {
        if (Auth::user()->gyms()->exists()) {
            return redirect()->route('owner.dashboard');
        }

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
            'facility_ids' => 'array',
            'facility_ids.*' => 'exists:facilities,id',
            'category_ids' => 'array',
            'category_ids.*' => 'exists:categories,id',
        ]);

        $gym = Gym::create([
            ...collect($validated)->except(['facility_ids', 'category_ids'])->toArray(),
            'owner_id' => Auth::id(),
            'slug' => Str::slug($validated['name']).'-'.Str::random(5),
            'source' => 'owner_submitted',
            'status' => 'pending',
        ]);
        
        Notification::notifyAdmins('gym_pending_approval', [
            'gym_id' => $gym->id,
            'gym_name' => $gym->name,
        ]);

        $gym->facilities()->sync($validated['facility_ids'] ?? []);
        $gym->categories()->sync($validated['category_ids'] ?? []);

        return redirect()
            ->route('owner.dashboard')
            ->with('success', 'Your gym has been submitted and is pending admin approval.');
    }
}