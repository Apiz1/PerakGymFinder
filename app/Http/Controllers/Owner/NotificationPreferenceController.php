<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;


class NotificationPreferenceController extends Controller
{
    private const PREFERENCE_KEYS = [
        'notify_new_review' => 'Email me when someone reviews my gym',
        'notify_new_report' => 'Email me when someone reports my gym',
        'notify_gym_status_change' => 'Email me when my gym is approved or suspended',
    ];

    public function edit(): Response
    {
        $user = Auth::user();

        return Inertia::render('Owner/Gym/Setting', [
            'gym' => $user->gyms()->first(),
            'preferenceKeys' => self::PREFERENCE_KEYS,
            'preferences' => collect(self::PREFERENCE_KEYS)
                ->keys()
                ->mapWithKeys(fn ($key) => [$key => $user->wantsNotification($key)]),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'preferences' => 'required|array',
            'preferences.*' => 'boolean',
        ]);

        // Only accept keys we actually define — ignore anything else
        // submitted, same defensive principle as the $fillable fix.
        $filtered = collect($validated['preferences'])
            ->only(array_keys(self::PREFERENCE_KEYS))
            ->toArray();

        $user = Auth::user();
        $user->notification_preferences = $filtered;
        $user->save();

        return back()->with('success', 'Notification preferences updated.');
    }
}