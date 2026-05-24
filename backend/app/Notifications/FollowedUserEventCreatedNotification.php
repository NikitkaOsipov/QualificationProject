<?php

namespace App\Notifications;

use App\Enums\NotificationType;
use App\Models\Event;
use App\Models\User;
use App\Support\NotificationMapper;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class FollowedUserEventCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly User $creator,
        private readonly Event $event,
    ) {
    }

    public function via(object $notifiable): array
    {
        if (!$notifiable instanceof User) {
            return [];
        }

        return $notifiable->notificationChannelsForType(NotificationType::FollowedUserEventCreated->value);
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Jauns pasākums no lietotāja, kuram sekojat')
            ->greeting('Sveiki!')
            ->line("{$this->creator->name} tikko izveidoja jaunu pasākumu: \"{$this->event->title}\".")
            ->line('Atveriet lietotni, lai apskatītu pasākuma informāciju.');
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage(
            NotificationMapper::fromBroadcast($this, $this->toArray($notifiable))
        );
    }

    public function toArray(object $notifiable): array
    {
        return [
            'notification_type' => NotificationType::FollowedUserEventCreated->value,
            'title' => 'Publicēts jauns pasākums',
            'body' => "{$this->creator->name} izveidoja pasākumu \"{$this->event->title}\".",
            'actor' => [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
                'avatar' => $this->creator->avatar_path,
            ],
            'resource' => [
                'type' => 'event',
                'id' => $this->event->id,
            ],
        ];
    }
}

