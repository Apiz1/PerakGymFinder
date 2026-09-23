<?php

namespace App\Http\Controllers;

use App\Models\Gym;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class FavoriteController extends Controller
{
    /**
     * The logged-in user's saved gyms.
     */
    public function index(): Response
    {
        $gyms = Auth::user()->favorites()
            ->with('gym.city', 'gym.state', 'gym.images')
            ->latest()
            ->get()
            ->pluck('gym');

        return Inertia::render('Favorites/Index', [
            'gyms' => $gyms,
        ]);
    }

    /**
     * Toggle a gym in/out of favorites — one button, no separate
     * store/destroy round trip needed on the frontend.
     */
    public function toggle(Gym $gym): RedirectResponse
    {
        $user = Auth::user();
        $favorite = $user->favorites()->where('gym_id', $gym->id)->first();

        if ($favorite) {
            $favorite->delete();
            $message = 'Removed from favorites.';
        } else {
            $user->favorites()->create(['gym_id' => $gym->id]);
            $message = 'Added to favorites.';
        }

        return back()->with('success', $message);
    }
}