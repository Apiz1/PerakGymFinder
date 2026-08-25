<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class AdminNotificationController extends Controller
{
    /**
     * JSON endpoint for the header bell dropdown — most recent 10, newest
     * first, plus the unread count for the badge. A JSON response (not an
     * Inertia page) since this is meant to be polled/fetched from the
     * header component itself, not a full page navigation.
     */
    public function index(): JsonResponse
    {
        $notifications = Notification::where('user_id', Auth::id())
            ->latest('created_at')
            ->limit(10)
            ->get();

        return response()->json([
            'notifications' => $notifications,
            'unreadCount' => Notification::where('user_id', Auth::id())->unread()->count(),
        ]);
    }

    /**
     * Mark a single notification read — e.g. when the admin clicks it
     * to navigate to the underlying gym/application/report.
     */
    public function markRead(Notification $notification): RedirectResponse|JsonResponse
    {
        abort_unless($notification->user_id === Auth::id(), 403);

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Mark everything read at once — the "clear all" action in the dropdown.
     */
    public function markAllRead(): JsonResponse
    {
        Notification::where('user_id', Auth::id())
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }
}