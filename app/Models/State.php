<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class State extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'name',
        'slug',
    ];

    public function districts(): HasMany
    {
        return $this->hasMany(District::class);
    }

    /** Gyms located directly under this state (denormalized for fast filtering). */
    public function gyms(): HasMany
    {
        return $this->hasMany(Gym::class);
    }
}