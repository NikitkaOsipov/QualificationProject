<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\EventController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    Log::info("USER API INN START _-------------------------------------------------------");

//        Log::info("User logged in");

//    Log::info("USER", [$request->user('sanctum')]);
    Log::info("API USER", [Auth::guard('api')->check()]);
    Log::info("WEB USER", [Auth::guard('web')->check()]);
    Log::info('Is Authenticated:', [Auth::check()]);
    Log::info('Is Authenticated sanctum:', [Auth::guard('sanctum')->check()]);

    Log::info('Headers:', $request->headers->all());

    try {
        Log::info('Session ID:', [$request->session()->getId()]);
    } catch (Exception $e) {
        Log::error("No session stored in headers");
    }


    Log::info('Request:', $request->toArray());
    Log::info('Is Authenticated:', [Auth::guard('sanctum')->check()]);

    Log::info("USER API INN END _-------------------------------------------------------");
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

Route::post('/event', [EventController::class, 'store']);
//
//Route::post('/login', [AuthenticatedSessionController::class, 'storeMobile'])
//    ->middleware('guest')
//    ->name('login');

require __DIR__.'/auth.php';
