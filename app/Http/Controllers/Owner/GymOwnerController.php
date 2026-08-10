<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class GymOwnerController extends Controller
{
    /**
     * If the owner has no gym yet (promoted via a "new gym" application,
     * not a "claim" one), send them to CreateGymController instead of
     * showing an empty dashboard.
     */
    public function dashboard(): Response|RedirectResponse
    {
        $gym = Auth::user()->gyms()->first();

        if (! $gym) {
            return redirect()->route('owner.gym.create');
        }

        $gym->load(['state', 'district', 'city', 'images', 'reviews' => fn ($q) => $q->latest()->limit(5)]);

        return Inertia::render('Owner/Dashboard', [
            'gym' => $gym,
        ]);
    }
}