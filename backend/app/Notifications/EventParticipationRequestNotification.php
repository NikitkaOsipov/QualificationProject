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

class EventParticipationRequestNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly User $sender,
        private readonly Event $event,
    ) {
    }

    public function via(object $notifiable): array
    {
        if (! $notifiable instanceof User) {
            return [];
        }

        return $notifiable->notificationChannelsForType(NotificationType::EventParticipationRequest->value);
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Event participation request')
            ->greeting('Hello!')
            ->line("{$this->sender->name} invited you to join \"{$this->event->title}\".")
            ->line('Open the app to view the event details.');
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
            'notification_type' => NotificationType::EventParticipationRequest->value,
            'title' => 'Event participation request',
            'body' => "{$this->sender->name} invited you to join {$this->event->title}.",
            'actor' => [
                'id' => $this->sender->id,
                'name' => $this->sender->name,
                'avatar' => $this->sender->avatar_path,
            ],
            'resource' => [
                'type' => 'event',
                'id' => $this->event->id,
            ],
        ];
    }
}

