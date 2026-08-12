<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OwnerGymOperatingHourController extends Controller
{
    private const DAYS = [
        0 => 'Sunday', 1 => 'Monday', 2 => 'Tuesday', 3 => 'Wednesday',
        4 => 'Thursday', 5 => 'Friday', 6 => 'Saturday',
    ];

    /**
     * Reduces a time value to strict H:i, trimming seconds if the browser's
     * <input type="time"> sent "09:00:00" instead of "09:00". Returns null
     * for empty/missing values rather than letting them reach date_format.
     */
    private function normalizeTime(?string $value): ?string
    {
        if (! $value) {
            return null;
        }

        return substr($value, 0, 5);
    }

    /**
     * Owner's operating-hours form — same "no {gym} param" pattern as the
     * rest of the owner controllers, since an owner only manages their own gym.
     */
    public function edit(): Response|RedirectResponse
    {
        $gym = Auth::user()->gyms()->first();

        if (! $gym) {
            return redirect()->route('owner.gym.create');
        }

        $existingHours = $gym->operatingHours()->get()->keyBy('day_of_week');

        // Build all 7 days even if some have no row yet, so the form always
        // renders a complete week — defaults to "closed" for any missing day.
        $hours = collect(self::DAYS)->map(function ($dayName, $dayNumber) use ($existingHours) {
            $existing = $existingHours->get($dayNumber);

            return [
                'day_of_week' => $dayNumber,
                'day_name' => $dayName,
                'open_time' => $existing?->open_time,
                'close_time' => $existing?->close_time,
                'is_closed' => $existing?->is_closed ?? true,
            ];
        })->values();

        return Inertia::render('Owner/Gym/Hours', [
            'gym' => $gym->only(['id', 'name', 'status']),
            'hours' => $hours,
        ]);
    }

    /**
     * Saves all 7 days in one submit — upserts each day individually since
     * gym_operating_hours has a unique(gym_id, day_of_week) constraint,
     * so this updates existing rows or creates missing ones as needed.
     */
    public function update(Request $request): RedirectResponse
    {
        $gym = Auth::user()->gyms()->first();

        abort_unless($gym, 404);

        // For any day marked closed, force its time fields to null regardless
        // of what was actually submitted — don't trust the incoming value's
        // format at all when the day is closed, since it's irrelevant either way.
        $hours = collect($request->input('hours', []))->map(function ($day) {
            $isClosed = filter_var($day['is_closed'] ?? false, FILTER_VALIDATE_BOOLEAN);

            if ($isClosed) {
                $day['open_time'] = null;
                $day['close_time'] = null;
            } else {
                $day['open_time'] = $this->normalizeTime($day['open_time'] ?? null);
                $day['close_time'] = $this->normalizeTime($day['close_time'] ?? null);
            }

            $day['is_closed'] = $isClosed;

            return $day;
        })->all();

        $request->merge(['hours' => $hours]);

        $validated = $request->validate([
            'hours' => 'required|array|size:7',
            'hours.*.day_of_week' => ['required', 'integer', Rule::in(range(0, 6))],
            'hours.*.is_closed' => 'required|boolean',
            'hours.*.open_time' => 'nullable|required_if:hours.*.is_closed,false|date_format:H:i',
            'hours.*.close_time' => 'nullable|required_if:hours.*.is_closed,false|date_format:H:i|after:hours.*.open_time',
        ]);

        foreach ($validated['hours'] as $day) {
            $gym->operatingHours()->updateOrCreate(
                ['day_of_week' => $day['day_of_week']],
                [
                    'open_time' => $day['is_closed'] ? null : $day['open_time'],
                    'close_time' => $day['is_closed'] ? null : $day['close_time'],
                    'is_closed' => $day['is_closed'],
                ]
            );
        }

        return redirect()
            ->route('owner.gym.hours.edit')
            ->with('success', 'Operating hours updated.');
    }
}