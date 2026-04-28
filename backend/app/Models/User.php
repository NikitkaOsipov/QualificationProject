<?php

namespace App\Models;

use App\Models\Friend;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    public const ROLE_USER = 'user';
    public const ROLE_ADMIN = 'admin';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar_path',
        'read_at',
        'role',
        'in_app_enabled',
        'email_enabled'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function events() {
        return $this->hasMany(Event::class);
    }
    public function comments() {
        return $this->hasMany(Comment::class);
    }

    public function interestedEvents()
    {
        return $this->hasMany(EventInterested::class);
    }

    public function goingEvents()
    {
        return $this->hasMany(EventGoing::class);
    }

    public function following()
    {
        return $this->belongsToMany(User::class, 'followers', 'follower_id', 'target_id');
    }

    public function followers()
    {
        return $this->belongsToMany(User::class, 'followers', 'target_id', 'follower_id');
    }

    public function friends()
    {
        return User::where(function ($q) {
            $q->whereIn('id', Friend::where('user1_id', $this->id)->pluck('user2_id'))
              ->orWhereIn('id', Friend::where('user2_id', $this->id)->pluck('user1_id'));
        });
    }

    public function friendsCount(): int
    {
        return Friend::where('user1_id', $this->id)
            ->orWhere('user2_id', $this->id)
            ->count();
    }

    /**
     * Returns users notification preferences.
     */
    public function notificationPreferences(): HasMany
    {
        return $this->hasMany(NotificationPreference::class);
    }

    /**
     * Check if a specific notification type is enabled for the user. (user can change it in preferences)
     */
    public function notificationTypeEnabled(string $type): bool
    {
        return count($this->notificationChannelsForType($type)) > 0;
    }

    /**
     * Returns all channels that are enabled for the notification type.
     *
     * @return array<int, string>
     */
    public function notificationChannelsForType(string $type): array
    {
        $preference = $this->getNotificationPreferenceForType($type);

        $inAppEnabled = $preference?->in_app_enabled ?? true;
        $emailEnabled = $preference?->email_enabled ?? false;

        $channels = [];

        if ($inAppEnabled) {
            $channels[] = 'database';
            $channels[] = 'broadcast';
        }

        if ($emailEnabled) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    private function getNotificationPreferenceForType(string $type): ?NotificationPreference
    {
        if ($this->relationLoaded('notificationPreferences')) {
            return $this->notificationPreferences->firstWhere('type', $type);
        }

        return $this->notificationPreferences()
            ->where('type', $type)
            ->first();
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }
}
