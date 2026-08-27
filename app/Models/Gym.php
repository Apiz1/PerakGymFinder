<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class Gym extends Model
{
    use HasFactory,LogsActivity;

    protected $fillable = [
        'owner_id',
        'name',
        'slug',
        'description',
        'address',
        'state_id',
        'district_id',
        'city_id',
        'latitude',
        'longitude',
        'whatsapp_number',
        'phone_number',
        'email',
        'website',
        'google_place_id',
        'google_maps_url',
        'source',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'average_rating' => 'decimal:1',
        ];
    }

      /*
    |--------------------------------------------------------------------
    | Activity log
    |--------------------------------------------------------------------
    */

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'name',
                'status',
                'address',
                'whatsapp_number',
                'phone_number',
                'email',
                'website',
                'owner_id',
            ])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "Gym was {$eventName}");
    }


    /*
    |--------------------------------------------------------------------
    | Location relationships
    |--------------------------------------------------------------------
    */

    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /*
    |--------------------------------------------------------------------
    | Ownership
    |--------------------------------------------------------------------
    */

    /** Nullable — unclaimed scraped listings have no owner yet. */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /*
    |--------------------------------------------------------------------
    | Content (models created in later migration batches)
    |--------------------------------------------------------------------
    */

    public function images(): HasMany
    {
        return $this->hasMany(GymImage::class);
    }

    public function operatingHours(): HasMany
    {
        return $this->hasMany(GymOperatingHour::class);
    }

    public function facilities(): BelongsToMany
    {
        return $this->belongsToMany(Facility::class, 'gym_facility');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'gym_category');
    }

    public function membershipPlans(): HasMany
    {
        return $this->hasMany(MembershipPlan::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(GymReport::class);
    }

    public function ownerApplications(): HasMany
    {
        return $this->hasMany(GymOwnerApplication::class);
    }

    /*
    |--------------------------------------------------------------------
    | Scopes — used by the search/filter controller
    |--------------------------------------------------------------------
    */

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeInState($query, int $stateId)
    {
        return $query->where('state_id', $stateId);
    }

    public function scopeInDistrict($query, int $districtId)
    {
        return $query->where('district_id', $districtId);
    }

    public function scopeInCity($query, int $cityId)
    {
        return $query->where('city_id', $cityId);
    }

    public function scopeSearchName($query, string $term)
    {
        return $query->where('name', 'ilike', "%{$term}%");
    }
}