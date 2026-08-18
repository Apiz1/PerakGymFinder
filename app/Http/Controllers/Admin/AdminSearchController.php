<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Gym;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminSearchController extends Controller
{
    /**
     * Global admin search — gyms and users only for now. Deliberately
     * capped at 5 results per category: this is a "jump to the thing
     * I'm thinking of" quick-search, not a full filtered browse (that's
     * what AdminGymController::index()/AdminUserController::index()
     * with their own search+filter params are for).
     */
    public function index(Request $request): Response
    {
        $query = $request->input('q', '');

        if (strlen($query) < 3) {
            return Inertia::render('Admin/Search/Index', [
                'query' => $query,
                'gyms' => [],
                'users' => [],
            ]);
        }

        return Inertia::render('Admin/Search/Index', [
            'query' => $query,
            'gyms' => Gym::where('name', 'ilike', "%{$query}%")
                ->orWhere('address', 'ilike', "%{$query}%")
                ->limit(5)
                ->get(['id', 'name', 'address', 'status']),
            'users' => User::where('name', 'ilike', "%{$query}%")
                ->orWhere('email', 'ilike', "%{$query}%")
                ->with('role:id,name')
                ->limit(5)
                ->get(['id', 'name', 'email', 'role_id']),
        ]);
    }
}