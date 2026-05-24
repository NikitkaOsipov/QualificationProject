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
        if (!$notifiable instanceof User) {
            return [];
        }

        return $notifiable->notificationChannelsForType(NotificationType::FriendRequestAccepted->value);
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Draudzības pieprasījums apstiprināts')
            ->greeting('Sveiki!')
            ->line("{$this->responder->name} apstiprināja jūsu draudzības pieprasījumu.")
            ->line('Tagad lietotnē varat sarakstīties un redzēt viens otru kā draugus.');
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
            'title' => 'Draudzības pieprasījums apstiprināts',
            'body' => "{$this->responder->name} apstiprināja jūsu draudzības pieprasījumu.",
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
