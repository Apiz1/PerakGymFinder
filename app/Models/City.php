<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'district_id',
        'name',
    ];

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class);
    }

    /** Convenience accessor: City -> District -> State (no state_id column on this table). */
    public function state(): State
    {
        return $this->district->state;
    }

    public function gyms(): HasMany
    {
        return $this->hasMany(Gym::class);
    }
}