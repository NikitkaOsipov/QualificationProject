<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public $token;

    /**
     * Create a new notification instance.
     */
    public function __construct($token)
    {
        $this->token = $token;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $frontend_url = config('app.frontend_url');
        $url = $frontend_url
            . '/password-reset?token=' . $this->token
            . '&email=' . urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('Paroles atjaunošanas paziņojums')
            ->greeting('Sveiki!')
            ->line('Jūs saņēmāt šo e-pastu, jo tika saņemts pieprasījums atjaunot jūsu konta paroli.')
            ->action('Atjaunot paroli', $url)
            ->line('Saites derīguma termiņš beigsies pēc 60 minūtēm.')
            ->line('Ja jūs nepieprasījāt paroles atjaunošanu, nekāda tālāka rīcība nav nepieciešama.')
            ->line('Ar cieņu, PasakumuKarte');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
