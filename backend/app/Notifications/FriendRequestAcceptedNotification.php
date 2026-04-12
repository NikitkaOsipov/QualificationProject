<?php

namespace App\Notifications;

use App\Enums\NotificationType;
use App\Models\User;
use App\Support\NotificationMapper;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class FriendRequestAcceptedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly User $responder)
    {
    }

    /**
     * Create a new notification instance.
     */
    public function via(object $notifiable): array
    {
        if (! $notifiable instanceof User) {
            return [];
        }

        if (! $notifiable->notificationTypeEnabled(NotificationType::FriendRequestAccepted->value)) {
            return [];
        }

        return ['database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage(
            NotificationMapper::fromBroadcast($this, $this->toArray($notifiable))
        );
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'notification_type' => NotificationType::FriendRequestAccepted->value,
            'title' => 'Friend request accepted',
            'body' => "{$this->responder->name} accepted your friend request.",
            'actor' => [
                'id' => $this->responder->id,
                'name' => $this->responder->name,
                'avatar' => $this->responder->avatar_path,
            ],
            'resource' => [
                'type' => 'user',
                'id' => $this->responder->id,
            ],
        ];
    }
}
