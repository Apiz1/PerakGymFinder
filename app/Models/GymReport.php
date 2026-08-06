<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GymReport extends Model
{
    use HasFactory;

    public $timestamps = false; // only created_at, set via useCurrent() in the migration

    protected $fillable = [
        'gym_id',
        'user_id',
        'reason',
        'description',
        'status',
    ];

    public function gym(): BelongsTo
    {
        return $this->belongsTo(Gym::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }
}