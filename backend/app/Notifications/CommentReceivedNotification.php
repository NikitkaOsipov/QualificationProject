<?php

namespace App\Notifications;

use App\Enums\NotificationType;
use App\Models\User;
use App\Support\NotificationMapper;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CommentReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly User $commenter,
        private readonly int $eventId,
        private readonly string $eventTitle,
    ) {
    }

    /**
     * Chooses notification channels
     */
    public function via(object $notifiable): array
    {
        if (! $notifiable instanceof User) {
            return [];
        }

        return $notifiable->notificationChannelsForType(NotificationType::CommentReceived->value);
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New comment on your event')
            ->greeting('Hello!')
            ->line("{$this->commenter->name} commented on your event \"{$this->eventTitle}\".")
            ->line('Open the app to read and reply.');
    }

    /**
     * It sends data to the user over Reverb
     */
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
            'notification_type' => NotificationType::CommentReceived->value,
            'title' => 'New comment',
            'body' => "{$this->commenter->name} commented on your event \"{$this->eventTitle}\".",
            'actor' => [
                'id' => $this->commenter->id,
                'name' => $this->commenter->name,
                'avatar' => $this->commenter->avatar_path,
            ],
            'resource' => [
                'type' => 'event',
                'id' => $this->eventId,
            ],
        ];
    }
}
