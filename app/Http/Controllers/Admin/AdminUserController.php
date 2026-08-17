<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    /**
     * List all accounts, filterable by role and searchable by name/email.
     */
    public function index(Request $request): Response
    {
        $roleName = $request->input('role'); // user | gym_owner | super_admin | null (all)
        $search = $request->input('search');

        $users = User::query()
            ->with('role:id,name')
            ->when($roleName, fn ($query) => $query->whereHas('role', fn ($q) => $q->where('name', $roleName)))
            ->when($search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'ilike', "%{$search}%")
                        ->orWhere('email', 'ilike', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $counts = User::query()
            ->join('roles', 'roles.id', '=', 'users.role_id')
            ->selectRaw('roles.name as role_name, count(*) as count')
            ->groupBy('roles.name')
            ->pluck('count', 'role_name');

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['role', 'search']),
            'roleCounts' => [
                'user' => $counts->get('user', 0),
                'gym_owner' => $counts->get('gym_owner', 0),
                'super_admin' => $counts->get('super_admin', 0),
                'all' => $counts->sum(),
            ],
        ]);
    }

    /**
     * Full detail view — account info plus, if they're a gym_owner, their gym.
     */
    public function show(User $user): Response
    {
        $user->load(['role', 'gyms:id,owner_id,name,status']);

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Edit basic account fields. Role and active-status changes are
     * separate one-click actions below, not bundled into this form —
     * those are more consequential and worth their own confirmation step
     * on the frontend, same reasoning as AdminGymController's approve/
     * reject/suspend being separate from its general update().
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
        ]);

        $user->update($validated);

        return back()->with('success', 'User details updated.');
    }

    /**
     * Change a user's role directly — e.g. manually promoting someone to
     * gym_owner without the application flow, or demoting/reinstating.
     */
    public function updateRole(Request $request, User $user): RedirectResponse
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'You cannot change your own role.');
        }

        $validated = $request->validate([
            'role' => ['required', Rule::in(['user', 'gym_owner', 'super_admin'])],
        ]);

        $role = Role::where('name', $validated['role'])->firstOrFail();
        $user->update(['role_id' => $role->id]);

        return back()->with('success', "{$user->name}'s role updated to {$validated['role']}.");
    }

    /**
     * Toggle account active/inactive — e.g. suspicious activity, abuse,
     * non-payment. Deactivating does NOT delete anything; it's meant to
     * be paired with checking `is_active` at login (see AuthenticatedSessionController).
     */
    public function toggleActive(User $user): RedirectResponse
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'You cannot deactivate your own account.');
        }

        $user->update(['is_active' => ! $user->is_active]);

        return back()->with('success', $user->is_active ? 'Account activated.' : 'Account deactivated.');
    }
}