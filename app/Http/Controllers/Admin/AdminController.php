<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Gym;
use App\Models\GymOwnerApplication;
use App\Models\Review;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function dashboard(): Response
    {
        $newGymsThisWeek = Gym::where('created_at', '>=', Carbon::now()->subDays(7))->count();

        $avgRating = Review::approved()->avg('rating');

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'totalGyms' => Gym::count(),
                'gymChange' => "{$newGymsThisWeek} new this week",

                'pendingGyms' => Gym::where('status', 'pending')->count(),

                'pendingOwners' => GymOwnerApplication::where('status', 'pending')->count(),

                'totalReviews' => Review::count(),
                'avgRating' => $avgRating ? number_format($avgRating, 1) : '0.0',
            ],

            // Feeds the "Gym Approvals Queue" table — the actual rows to act on,
            // separate from metrics.pendingGyms above (which is just the count).
            'pendingGyms' => Gym::where('status', 'pending')
                ->with(['city:id,name', 'district:id,name'])
                ->latest()
                ->limit(10)
                ->get(['id', 'name', 'city_id', 'district_id', 'created_at']),

            // ✅ ADDED — Feeds the "Gym Claim Applications" table
            'pendingOwners' => GymOwnerApplication::where('status', 'pending')
                ->with(['user:id,name,email', 'gym:id,name,address'])
                ->latest()
                ->limit(10)
                ->get(),
        ]);
    }
}