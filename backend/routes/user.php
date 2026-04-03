<?php

use App\Http\Controllers\UserController;

Route::post('/users/{targetUser}/follow', [UserController::class, 'follow'])->middleware('auth');
