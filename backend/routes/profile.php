<?php

use App\Http\Controllers\ProfileController;

Route::get('/profile/{user}', [ProfileController::class, 'show']);
Route::get('/profile/{user}/followers', [ProfileController::class, 'followers']);
Route::get('/profile/{user}/events', [ProfileController::class, 'events']);
Route::get('/profile/{user}/comments', [ProfileController::class, 'comments']);
Route::get('/profile/{user}/likes', [ProfileController::class, 'likes']);
Route::get('/profile/{user}/following', [ProfileController::class, 'following']);
Route::get('/profile/{user}/friends', [ProfileController::class, 'friends']);

