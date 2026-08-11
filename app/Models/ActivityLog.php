<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ActivityLog extends Model
{
    use HasFactory;

    public $timestamps = false; // only created_at, set via useCurrent() in the migration

    protected $fillable = [
        'user_id',
        'action',
        'subject_type',
        'subject_id',
    ];

    /** The admin (or system actor) who performed the action. */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The thing the action was performed on — e.g. a Gym, a User.
     * Not a real polymorphic FK pair (subject_type stores a short label
     * like "Gym", not the full model class), so this is a manual helper
     * rather than Eloquent's built-in morphTo().
     */
    public function subject(): ?Model
    {
        $modelClass = 'App\\Models\\'.$this->subject_type;

        return class_exists($modelClass) ? $modelClass::find($this->subject_id) : null;
    }

    /**
     * Convenience for writing a log entry from anywhere in the app, e.g.:
     * ActivityLog::record('gym.approved', $gym, Auth::id());
     */
    public static function record(string $action, Model $subject, ?int $userId = null): self
    {
        return static::create([
            'user_id' => $userId,
            'action' => $action,
            'subject_type' => class_basename($subject),
            'subject_id' => $subject->getKey(),
        ]);
    }
}