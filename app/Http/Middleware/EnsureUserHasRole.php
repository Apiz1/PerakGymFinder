<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Usage in routes: ->middleware('role:super_admin')
     * or multiple roles: ->middleware('role:super_admin,gym_owner')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        // Checks if user exists and if their role name matches any allowed role
        if (! $user || ! in_array($user->role?->name, $roles, true)) {
            abort(403, 'You are not authorized to access this page.');
        }

        return $next($request);
    }
}