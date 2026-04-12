<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::routes(['middleware' => ['web', 'auth:sanctum']]);

// Authorizing channel. Checks that authenticated user id (is parsed to function by default) equals to channel user id.
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
