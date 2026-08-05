<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Facility extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'name',
        'icon',
    ];

    public function gyms(): BelongsToMany
    {
        return $this->belongsToMany(Gym::class, 'gym_facility');
    }
}