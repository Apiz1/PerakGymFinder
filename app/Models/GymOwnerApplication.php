<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class GymOwnerApplication extends Model
{
    use HasFactory,LogsActivity;

    public $timestamps = false; // only created_at, set via useCurrent() in the migration

    protected $fillable = [
        'user_id',
        'gym_id',
        'proposed_gym_details',
        'business_doc_path',
        'status',
        'reviewed_by',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'proposed_gym_details' => 'array',
            'reviewed_at' => 'datetime',
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
                'user_id',
                'gym_id',
                'status',
                'reviewed_by',
                'reviewed_at',
            ])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn (string $eventName) => "Gym was {$eventName}");
    }

    /** The applicant. */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** Set if claiming an existing scraped listing; null if a brand-new gym submission. */
    public function gym(): BelongsTo
    {
        return $this->belongsTo(Gym::class);
    }

    /** The admin who approved/rejected this application. */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}