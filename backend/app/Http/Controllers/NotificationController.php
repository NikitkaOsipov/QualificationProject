<?php
/**
 * Šis kontrolieris nodrošina lietotāja paziņojumu pārvaldību.
 * Tas satur piecas galvenās funkcijas:
 * - index(): Parāda paziņojumu sarakstu ar nelasīto skaitu.
 * - markAsRead(): Atzīmē vienu paziņojumu kā izlasītu.
 * - markAllAsRead(): Atzīmē visus paziņojumus kā izlasītus.
 * - delete(): Dzēš vienu paziņojumu.
 * - deleteAll(): Dzēš visus lietotāja paziņojumus.
 */

namespace App\Http\Controllers;

use App\Support\EventHelper;
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
            'data' => $notifications,
            'meta' => [
                'unread_count' => $user->unreadNotifications()->count(),
            ],
        ]);
    }

    public function markAsRead(Request $request, string $notificationId)
    {
        $notification = $this->ownedNotification($request, $notificationId);

        if (!$notification) {
            return EventHelper::errorResponse('Paziņojums nav atrasts', 404);
        }

        if (!$notification->read_at) {
            $notification->markAsRead();
        }

        return EventHelper::successResponse();
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications()->update([
            'read_at' => now(),
        ]);

        return EventHelper::successResponse();
    }

    public function delete(Request $request, string $notificationId)
    {
        $notification = $this->ownedNotification($request, $notificationId);

        if (!$notification) {
            return EventHelper::errorResponse('Paziņojums nav atrasts', 404);
        }

        $notification->delete();

        return EventHelper::successResponse();
    }

    public function deleteAll(Request $request)
    {
        $request->user()->notifications()->delete();

        return EventHelper::successResponse();
    }

    // Gets notification by id
    private function ownedNotification(Request $request, string $notificationId): DatabaseNotification
    {
        return $request->user()
            ->notifications()
            ->whereKey($notificationId)
            ->first();
    }
}
