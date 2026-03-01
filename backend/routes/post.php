<?php


use App\Http\Controllers\EventController;

Route::post('/event', [EventController::class, 'store']);
Route::get('/all-events', [EventController::class, 'index']);
Route::get('/event/{event}', [EventController::class, 'show']);
