<?php


use App\Http\Controllers\EventController;

Route::post('/event', [EventController::class, 'store']);
Route::get('/all-events', [EventController::class, 'index']);
