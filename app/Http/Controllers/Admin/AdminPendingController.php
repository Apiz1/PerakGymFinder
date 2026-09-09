<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Gym;
use App\Models\GymOwnerApplication;
use App\Models\Review;
use App\Models\GymReport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminPendingController extends Controller
{
    public function index(Request $request): Response
    {
        // Get pending gyms
        $pendingGyms = Gym::where('status', 'pending')
            ->with(['city:id,name', 'district:id,name', 'owner:id,name'])
            ->latest()
            ->get(['id', 'name', 'address', 'city_id', 'district_id', 'owner_id', 'created_at']);

        // Get pending owner applications
        $pendingOwners = GymOwnerApplication::where('status', 'pending')
            ->with(['user:id,name,email'])
            ->latest()
            ->get(['id', 'user_id', 'created_at']);

        // Get pending reviews
        $pendingReviews = Review::where('status', 'pending')
            ->with(['user:id,name', 'gym:id,name'])
            ->latest()
            ->get(['id', 'user_id', 'gym_id', 'rating', 'comment', 'created_at']);

        // Get open reports
        $openReports = GymReport::where('status', 'open')
            ->with(['user:id,name', 'gym:id,name'])
            ->latest()
            ->get(['id', 'user_id', 'gym_id', 'reason', 'description', 'created_at']);

        return Inertia::render('Admin/Pending/Index', [
            'pendingGyms' => $pendingGyms,
            'pendingOwners' => $pendingOwners,
            'pendingReviews' => $pendingReviews,
            'openReports' => $openReports,
            'counts' => [
                'gyms' => $pendingGyms->count(),
                'owners' => $pendingOwners->count(),
                'reviews' => $pendingReviews->count(),
                'reports' => $openReports->count(),
                'total' => $pendingGyms->count() + $pendingOwners->count() + $pendingReviews->count() + $openReports->count(),
            ],
        ]);
    }
}