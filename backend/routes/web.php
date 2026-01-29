<?php

use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    Log::info("USER API INN START _------------------------------------------------------- WEEEEBB");

//        Log::info("User logged in");

//    Log::info("USER", [$request->user('sanctum')->toArray()]);
    Log::info("API USER", [Auth::guard('api')->check()]);
    Log::info("WEB USER", [Auth::guard('web')->check()]);

//    Log::info('Headers:', $request->headers->all());

    try {
//        Log::info('Session ID:', [$request->session()->getId()]);
    } catch (Exception $e) {
        Log::error("No session stored in headers");
    }


    Log::info('Request:', [$request->all()]);
    Log::info('Is Authenticated:', [Auth::guard('sanctum')->check()]);

    Log::info("USER API INN END _-------------------------------------------------------");
    return $request->user('sanctum');
});

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});
