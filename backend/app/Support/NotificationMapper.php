<?php

namespace App\Support;

use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Notifications\Notification;

class NotificationMapper
{
    /**
     * Build a consistent payload for broadcast notifications.
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    public static function fromBroadcast(Notification $notification, array $data): array
    {
        return [
            'id' => (string) $notification->id,
            'read_at' => null,
            'created_at' => now()->toISOString(),
            'data' => $data,
        ];
    }

    /**
     * Build the same payload shape for database notifications.
     *
     * @return array<string, mixed>
     */
    public static function fromDatabase(DatabaseNotification $notification): array
    {
        return [
            'id' => (string) $notification->id,
            'read_at' => $notification->read_at?->toISOString(),
            'created_at' => $notification->created_at?->toISOString(),
            'data' => $notification->data,
        ];
    }
}

