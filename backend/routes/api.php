<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\EventController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\Rule;

Route::get('/user', function (Request $request) {
    return $request->user('sanctum');
});

require __DIR__.'/auth.php';
require __DIR__.'/event.php';
require __DIR__.'/comment.php';
require __DIR__.'/profile.php';
require __DIR__.'/user.php';
require __DIR__.'/category.php';
require __DIR__.'/notification.php';
require __DIR__.'/admin.php';
