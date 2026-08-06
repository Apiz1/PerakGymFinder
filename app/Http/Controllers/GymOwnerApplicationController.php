<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\City;
use App\Models\District;
use App\Models\Facility;
use App\Models\Gym;
use App\Models\GymOwnerApplication;
use App\Models\State;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class GymOwnerApplicationController extends Controller
{
    /**
     * Show the "become a gym owner" form.
     * Lets the user either claim an existing unclaimed gym or submit a brand-new one.
     */
    public function create(): Response|RedirectResponse
    {
        $user = Auth::user();

        if ($user->isGymOwner() || $user->isSuperAdmin()) {
            return redirect()->route('home')->with('info', 'You already have gym management access.');
        }

        $existingApplication = GymOwnerApplication::where('user_id', $user->id)
            ->pending()
            ->first();

        if ($existingApplication) {
            return redirect()->route('owner-applications.status');
        }

        return Inertia::render('OwnerApplications/Create', [
            'unclaimedGyms' => Gym::query()
                ->whereNull('owner_id')
                ->approved()
                ->orderBy('name')
                ->get(['id', 'name', 'address']),
            'states' => State::orderBy('name')->get(['id', 'name']),
            'districts' => District::orderBy('name')->get(['id', 'name', 'state_id']),
            'cities' => City::orderBy('name')->get(['id', 'name', 'district_id']),
            'facilities' => Facility::orderBy('name')->get(['id', 'name']),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Submit the application. Creates a `pending` gym_owner_applications row —
     * does NOT touch the user's role or create/attach a gym yet.
     * That only happens once an admin approves it (see AdminGymOwnerApplicationController).
     */
    public function store(Request $request): RedirectResponse
    {
        $user = Auth::user();

        if ($user->isGymOwner() || $user->isSuperAdmin()) {
            return redirect()->route('home')->with('info', 'You already have gym management access.');
        }

        if (GymOwnerApplication::where('user_id', $user->id)->pending()->exists()) {
            return back()->with('error', 'You already have a pending application.');
        }

        $validated = $request->validate([
            'application_type' => 'required|in:claim,new',
            'business_doc' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',

            // required only when claiming an existing listing
            'gym_id' => [
                'nullable',
                'required_if:application_type,claim',
                Rule::exists('gyms', 'id')->where(fn ($query) => $query->whereNull('owner_id')),
            ],

            // required only when submitting a brand-new gym
            'name' => 'nullable|required_if:application_type,new|string|max:255',
            'address' => 'nullable|required_if:application_type,new|string|max:500',
            'state_id' => 'nullable|required_if:application_type,new|exists:states,id',
            'district_id' => 'nullable|required_if:application_type,new|exists:districts,id',
            'city_id' => 'nullable|required_if:application_type,new|exists:cities,id',
            'whatsapp_number' => 'nullable|string|max:20',
            'phone_number' => 'nullable|string|max:20',
            'description' => 'nullable|string',
        ]);

        $docPath = $request->file('business_doc')->store('owner-applications', 'local');

        GymOwnerApplication::create([
            'user_id' => $user->id,
            'gym_id' => $validated['application_type'] === 'claim' ? $validated['gym_id'] : null,
            'proposed_gym_details' => $validated['application_type'] === 'new'
                ? [
                    'name' => $validated['name'],
                    'address' => $validated['address'],
                    'state_id' => $validated['state_id'],
                    'district_id' => $validated['district_id'],
                    'city_id' => $validated['city_id'],
                    'whatsapp_number' => $validated['whatsapp_number'] ?? null,
                    'phone_number' => $validated['phone_number'] ?? null,
                    'description' => $validated['description'] ?? null,
                ]
                : null,
            'business_doc_path' => $docPath,
            'status' => 'pending',
        ]);

        return redirect()
            ->route('owner-applications.status')
            ->with('success', 'Your application has been submitted and is pending admin review.');
    }

    /**
     * Lets the applicant check the status of their own application.
     */
    public function status(): Response
    {
        $application = GymOwnerApplication::where('user_id', Auth::id())
            ->latest()
            ->with('gym:id,name')
            ->first();

        return Inertia::render('OwnerApplications/Status', [
            'application' => $application,
        ]);
    }
}