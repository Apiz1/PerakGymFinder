<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    public $timestamps = false; // only created_at, set via useCurrent() in the migration

    protected $fillable = [
        'user_id',
        'type',
        'data',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'read_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function markAsRead(): void
    {
        if (! $this->read_at) {
            $this->update(['read_at' => now()]);
        }
    }

    /**
     * Fan out a notification to every super_admin — used whenever something
     * needs admin attention: a new owner application, a gym pending
     * approval, or a new report. One row per admin, so each admin's
     * read/unread state is independent (admin A reading it doesn't mark
     * it read for admin B).
     */
    public static function notifyAdmins(string $type, array $data): void
    {
        $adminIds = User::whereHas('role', fn ($q) => $q->where('name', 'super_admin'))
            ->pluck('id');

        $rows = $adminIds->map(fn ($adminId) => [
            'user_id' => $adminId,
            'type' => $type,
            'data' => json_encode($data),
            'read_at' => null,
            'created_at' => now(),
        ]);

        static::insert($rows->all());
    }

    /**
     * Notify a single specific user — e.g. a gym owner getting told about
     * a new review or report on their own gym, as opposed to notifyAdmins()
     * which fans out to every super_admin at once.
     */
    public static function notifyUser(int $userId, string $type, array $data): void
    {
        static::create([
            'user_id' => $userId,
            'type' => $type,
            'data' => $data,
            'read_at' => null,
        ]);
    }
}