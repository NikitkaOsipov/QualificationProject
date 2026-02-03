<?php


use App\Http\Controllers\EventController;

Route::post('/event', [EventController::class, 'store']);
