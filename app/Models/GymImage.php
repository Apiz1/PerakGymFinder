<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class GymImage extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'gym_id',
        'image_path',
        'is_primary',
        'sort_order',
    ];

    protected $appends = ['url'];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
        ];
    }

    /**
     * A real, browser-loadable URL — image_path itself is just the raw
     * storage path (e.g. "gym-images/abc123.jpg"), not something a
     * browser can load directly. $appends means this is included
     * automatically whenever the model is sent to the frontend via Inertia.
     */
    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->image_path);
    }

    public function gym(): BelongsTo
    {
        return $this->belongsTo(Gym::class);
    }
}