<?php

use App\Http\Controllers\ProfileController;

Route::get('/profile/{user}', [ProfileController::class, 'show']);
