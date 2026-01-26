<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\EventController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    Log::error($request->user());
    return $request->user();
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

Route::post('/event', [EventController::class, 'store']);

Route::post('/login', [AuthenticatedSessionController::class, 'storeMobile'])
    ->middleware('guest')
    ->name('login');
