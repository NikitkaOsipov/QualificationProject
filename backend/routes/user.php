<?php

use App\Http\Controllers\UserController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/users/{targetUser}/follow', [UserController::class, 'follow']);
    Route::post('/users/{targetUser}/friend-request', [UserController::class, 'sendFriendRequest']);
    Route::post('/users/{targetUser}/friend-request/respond', [UserController::class, 'respondFriendRequest']);
    Route::delete('/users/{targetUser}/friend', [UserController::class, 'removeFriend']);
    Route::get('/friends', [UserController::class, 'friends']);
    Route::post('/users/update-online-status', [UserController::class, 'updateOnlineStatus']);
    Route::patch('/users', [UserController::class, 'update'])->middleware('verified');
});

Route::get('/users/search', [UserController::class, 'search']);
