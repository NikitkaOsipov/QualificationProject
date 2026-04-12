<?php

namespace App\Notifications;

use App\Enums\NotificationType;
use App\Models\User;
use App\Support\NotificationMapper;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class FriendRequestReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly User $sender)
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

        if (! $notifiable->notificationTypeEnabled(NotificationType::FriendRequestReceived->value)) {
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
            'notification_type' => NotificationType::FriendRequestReceived->value,
            'title' => 'New friend request',
            'body' => "{$this->sender->name} sent you a friend request.",
            'actor' => [
                'id' => $this->sender->id,
                'name' => $this->sender->name,
                'avatar' => $this->sender->avatar_path,
            ],
            'resource' => [
                'type' => 'user',
                'id' => $this->sender->id,
            ],
        ];
    }
}
