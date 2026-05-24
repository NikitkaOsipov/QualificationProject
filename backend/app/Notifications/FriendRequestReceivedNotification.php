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
        if (!$notifiable instanceof User) {
            return [];
        }

        return $notifiable->notificationChannelsForType(NotificationType::FriendRequestReceived->value);
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Jauns draudzības pieprasījums')
            ->greeting('Sveiki!')
            ->line("{$this->sender->name} nosūtīja jums draudzības pieprasījumu.")
            ->line('Atveriet lietotni, lai pieņemtu vai noraidītu pieprasījumu.');
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
            'title' => 'Jauns draudzības pieprasījums',
            'body' => "{$this->sender->name} nosūtīja jums draudzības pieprasījumu.",
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
