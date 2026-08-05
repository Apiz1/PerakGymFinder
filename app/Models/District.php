<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class District extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'state_id',
        'name',
    ];

    public function state(): BelongsTo
    {
        return $this->belongsTo(State::class);
    }

    public function cities(): HasMany
    {
        return $this->hasMany(City::class);
    }

    /** Gyms located directly under this district (denormalized for fast filtering). */
    public function gyms(): HasMany
    {
        return $this->hasMany(Gym::class);
    }
}