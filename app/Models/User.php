<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'role_id',
        'name',
        'email',
        'password',
        'phone',
        'avatar_path',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /*
    |--------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------
    */

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /** Gyms this user owns (only relevant if role = gym_owner). */
    public function gyms(): HasMany
    {
        return $this->hasMany(Gym::class, 'owner_id');
    }

    /*
    |--------------------------------------------------------------------
    | Role helpers — used in policies / middleware / Inertia props
    |--------------------------------------------------------------------
    */

    public function isSuperAdmin(): bool
    {
        return $this->role?->name === 'super_admin';
    }

    public function isGymOwner(): bool
    {
        return $this->role?->name === 'gym_owner';
    }

    public function isUser(): bool
    {
        return $this->role?->name === 'user';
    }
}