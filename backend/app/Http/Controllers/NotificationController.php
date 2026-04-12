<?php

namespace App\Http\Controllers;

use App\Support\NotificationMapper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $perPage = min((int) $request->integer('per_page', 10), 50);
        $notifications = $user->notifications()->latest()->paginate($perPage);

        $notifications->setCollection(
            $notifications->getCollection()->map(
                fn (DatabaseNotification $notification): array => NotificationMapper::fromDatabase($notification)
            )
        );

        return response()->json([
            'status' => 'ok',
            'data' => $notifications,
            'meta' => [
                'unread_count' => $user->unreadNotifications()->count(),
            ],
        ]);
    }

    public function markAsRead(Request $request, string $notificationId)
    {
        $notification = $this->ownedNotification($request, $notificationId);

        if (! $notification) {
            return response()->json([
                'status' => 'error',
                'message' => 'Notification not found',
            ], 404);
        }

        if (! $notification->read_at) {
            $notification->markAsRead();
        }

        return response()->json(['status' => 'ok']);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications()->update([
            'read_at' => now(),
        ]);

        return response()->json(['status' => 'ok']);
    }

    public function delete(Request $request, string $notificationId)
    {
        $notification = $this->ownedNotification($request, $notificationId);

        if (! $notification) {
            return response()->json([
                'status' => 'error',
                'message' => 'Notification not found',
            ], 404);
        }

        $notification->delete();

        return response()->json(['status' => 'ok']);
    }

    public function deleteAll(Request $request)
    {
        $request->user()->notifications()->delete();

        return response()->json(['status' => 'ok']);
    }

    private function ownedNotification(Request $request, string $notificationId): ?DatabaseNotification
    {
        return $request->user()
            ->notifications()
            ->whereKey($notificationId)
            ->first();
    }
}
