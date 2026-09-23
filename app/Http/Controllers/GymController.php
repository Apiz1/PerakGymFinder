<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\City;
use App\Models\District;
use App\Models\Facility;
use App\Models\Gym;
use App\Models\State;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class GymController extends Controller
{
    /**
     * Public search/landing page. Guests and registered users both hit
     * this — only approved gyms are ever shown here.
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $stateId = $request->input('state_id');
        $districtId = $request->input('district_id');
        $cityId = $request->input('city_id');
        $categoryIds = array_filter((array) $request->input('category_ids', []));
        $facilityIds = array_filter((array) $request->input('facility_ids', []));
        $sort = $request->input('sort', 'rating'); // rating | newest | name

        $gyms = Gym::query()
            ->approved()
            ->with([
                'state:id,name',
                'district:id,name',
                'city:id,name',
                'facilities:id,name,icon',
                'categories:id,name',
                'images' => fn ($query) => $query->where('is_primary', true),
            ])
            ->when($search, function ($query, $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'ilike', "%{$search}%")
                        ->orWhere('address', 'ilike', "%{$search}%")
                        ->orWhereHas('city', fn ($q) => $q->where('name', 'ilike', "%{$search}%"));
                });
            })
            ->when($stateId, fn ($query) => $query->inState($stateId))
            ->when($districtId, fn ($query) => $query->inDistrict($districtId))
            ->when($cityId, fn ($query) => $query->inCity($cityId))
            ->when($categoryIds, function ($query) use ($categoryIds) {
                $query->whereHas('categories', fn ($q) => $q->whereIn('categories.id', $categoryIds));
            })
            ->when($facilityIds, function ($query) use ($facilityIds) {
                // Gym must have ALL selected facilities, not just any one of them —
                // "Parking + Sauna" should mean both, not either.
                foreach ($facilityIds as $facilityId) {
                    $query->whereHas('facilities', fn ($q) => $q->where('facilities.id', $facilityId));
                }
            })
            ->when($sort === 'rating', fn ($query) => $query->orderByDesc('average_rating')->orderByDesc('total_reviews'))
            ->when($sort === 'newest', fn ($query) => $query->latest())
            ->when($sort === 'name', fn ($query) => $query->orderBy('name'))
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Home', [
            'gyms' => $gyms,
            'filters' => [
                'search' => $search,
                'state_id' => $stateId,
                'district_id' => $districtId,
                'city_id' => $cityId,
                'category_ids' => $categoryIds,
                'facility_ids' => $facilityIds,
                'sort' => $sort,
            ],
            'states' => State::orderBy('name')->get(['id', 'name']),
            'districts' => District::orderBy('name')->get(['id', 'name', 'state_id']),
            'cities' => City::orderBy('name')->get(['id', 'name', 'district_id']),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'facilities' => Facility::orderBy('name')->get(['id', 'name', 'icon']),
        ]);
    }

    /**
     * Public gym profile page.
     */
    public function show(Gym $gym): Response
    {
        abort_unless($gym->status === 'approved', 404);

        $gym->load([
            'state', 'district', 'city',
            'images' => fn ($query) => $query->orderBy('sort_order'),
            'operatingHours' => fn ($query) => $query->orderBy('day_of_week'),
            'facilities',
            'categories',
            'membershipPlans' => fn ($query) => $query->where('is_active', true),
            'reviews' => fn ($query) => $query->approved()->latest()->with(['user:id,name', 'reply']),
        ]);

        $gym->increment('total_views');

        return Inertia::render('Gyms/Show', [
            'gym' => $gym,
            'formattedHours' => $this->formatOperatingHours($gym),
            'openStatus' => $this->openStatus($gym),
            'isFavorited' => Auth::check()
                ? Auth::user()->favorites()->where('gym_id', $gym->id)->exists()
                : false,
        ]);
    }
    /**
     * Turns the raw 7-day gym_operating_hours rows into a display-ready
     * schedule — day names instead of 0-6, 12-hour times instead of
     * "14:00:00", and a flag for which row is "today" so the frontend
     * can highlight it without recomputing the weekday itself.
     */
    private function formatOperatingHours(Gym $gym): array
    {
        $today = (int) Carbon::now()->dayOfWeek; // Carbon: 0 = Sunday ... 6 = Saturday, matches day_of_week

        $hoursByDay = $gym->operatingHours->keyBy('day_of_week');

        return collect(range(0, 6))->map(function ($dayNumber) use ($hoursByDay, $today) {
            $hours = $hoursByDay->get($dayNumber);

            return [
                'day_of_week' => $dayNumber,
                'day_name' => $hours?->day_name ?? Carbon::now()->startOfWeek(Carbon::SUNDAY)->addDays($dayNumber)->format('l'),
                'is_today' => $dayNumber === $today,
                'is_closed' => $hours?->is_closed ?? true,
                'open_time' => $hours && ! $hours->is_closed ? Carbon::parse($hours->open_time)->format('g:i A') : null,
                'close_time' => $hours && ! $hours->is_closed ? Carbon::parse($hours->close_time)->format('g:i A') : null,
            ];
        })->values()->all();
    }

    /**
     * "Open now / closes at X" or "Closed / opens at X" — computed against
     * the actual current time, for the sticky info-block treatment from
     * the design suggestions rather than a static day-by-day table.
     */
    private function openStatus(Gym $gym): array
    {
        $now = Carbon::now();
        $today = (int) $now->dayOfWeek;

        $todayHours = $gym->operatingHours->firstWhere('day_of_week', $today);

        if (! $todayHours || $todayHours->is_closed || ! $todayHours->open_time || ! $todayHours->close_time) {
            return ['is_open' => false, 'label' => 'Closed today'];
        }

        $openTime = Carbon::parse($todayHours->open_time);
        $closeTime = Carbon::parse($todayHours->close_time);
        $nowTime = Carbon::parse($now->format('H:i:s'));

        if ($nowTime->between($openTime, $closeTime)) {
            return [
                'is_open' => true,
                'label' => 'Open now · closes '.$closeTime->format('g:i A'),
            ];
        }

        return [
            'is_open' => false,
            'label' => $nowTime->lt($openTime)
                ? 'Closed · opens '.$openTime->format('g:i A').' today'
                : 'Closed for today',
        ];
    }
}