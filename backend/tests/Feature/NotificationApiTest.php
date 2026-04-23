<?php

use App\Models\NotificationPreference;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

it('returns notification preferences with defaults enabled', function () {
    $user = User::factory()->create();

    Sanctum::actingAs($user);

    $response = $this->getJson('/api/notification-preferences');

    $response
        ->assertOk()
        ->assertJsonPath('status', 'ok')
        ->assertJsonCount(3, 'data')
        ->assertJsonPath('data.0.in_app_enabled', true)
        ->assertJsonPath('data.0.email_enabled', false);
});

it('updates a notification preference', function () {
    $user = User::factory()->create();

    Sanctum::actingAs($user);

    $response = $this->putJson('/api/notification-preferences/friend_request_received', [
        'in_app_enabled' => false,
        'email_enabled' => false,
    ]);

    $response->assertOk()->assertJsonPath('status', 'ok');

    expect(NotificationPreference::query()
        ->where('user_id', $user->id)
        ->where('type', 'friend_request_received')
        ->value('in_app_enabled'))
        ->toBeFalse();

    expect(NotificationPreference::query()
        ->where('user_id', $user->id)
        ->where('type', 'friend_request_received')
        ->value('email_enabled'))
        ->toBeFalse();
});

it('updates a single notification channel without changing other channel state', function () {
    $user = User::factory()->create();

    NotificationPreference::query()->create([
        'user_id' => $user->id,
        'type' => 'comment_received',
        'in_app_enabled' => true,
        'email_enabled' => false,
    ]);

    Sanctum::actingAs($user);

    $response = $this->putJson('/api/notification-preferences/comment_received', [
        'email_enabled' => true,
    ]);

    $response->assertOk()->assertJsonPath('status', 'ok');

    $row = NotificationPreference::query()
        ->where('user_id', $user->id)
        ->where('type', 'comment_received')
        ->first();

    expect($row)->not->toBeNull();
    expect((bool) $row->in_app_enabled)->toBeTrue();
    expect((bool) $row->email_enabled)->toBeTrue();
});

it('lists notifications and marks them as read', function () {
    $user = User::factory()->create();

    Sanctum::actingAs($user);

    $notificationId = (string) Str::uuid();

    $user->notifications()->create([
        'id' => $notificationId,
        'type' => 'App\\Notifications\\TestNotification',
        'data' => [
            'title' => 'Test notification',
            'notification_type' => 'friend_request_received',
            'body' => 'Hello from test',
        ],
    ]);

    $list = $this->getJson('/api/notifications');

    $list->assertOk()
        ->assertJsonPath('status', 'ok')
        ->assertJsonPath('meta.unread_count', 1)
        ->assertJsonPath('data.data.0.id', $notificationId)
        ->assertJsonPath('data.data.0.data.notification_type', 'friend_request_received')
        ->assertJsonMissingPath('data.data.0.type');

    $this->patchJson('/api/notifications/'.$notificationId.'/read')
        ->assertOk()
        ->assertJsonPath('status', 'ok');

    $this->patchJson('/api/notifications/read-all')
        ->assertOk()
        ->assertJsonPath('status', 'ok');

    expect($user->fresh()->unreadNotifications()->count())->toBe(0);
});


