<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\EventController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user('sanctum');
});

Route::get('/debug-user', function (Request $request) {
    Log::info('Headers:', $request->headers->all());
    Log::info('Session ID:', [$request->session()->getId()]);
    Log::info('Is Authenticated:', [Auth::check()]);

    return [
        'auth_check' => Auth::check(),
        'has_token' => $request->bearerToken() ? 'Yes' : 'No',
        'user' => $request->user(),
    ];
});


require __DIR__.'/auth.php';
require __DIR__.'/event.php';
require __DIR__.'/comment.php';
require __DIR__.'/profile.php';
require __DIR__.'/user.php';
