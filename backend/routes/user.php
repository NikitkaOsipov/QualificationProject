<?php

use App\Http\Controllers\UserController;

Route::post('/users/{user}/follow', [UserController::class, 'follow'])->middleware('auth');
