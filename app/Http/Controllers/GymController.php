<?php

namespace App\Http\Controllers;

use App\Models\Gym;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GymController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $gyms = Gym::query()
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('city', 'like', "%{$search}%")
                      ->orWhere('address', 'like', "%{$search}%");
            })
            ->latest()
            ->get();

        return Inertia::render('Home', [
            'gyms' => $gyms,
            'filters' => $request->only(['search']),
        ]);
    }
}
