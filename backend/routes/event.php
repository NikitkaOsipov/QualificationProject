<?php


use App\Http\Controllers\EventController;

Route::post('/event', [EventController::class, 'store'])->middleware('auth:sanctum');
Route::get('/all-events', [EventController::class, 'index']);
Route::get('/event/{event}', [EventController::class, 'show']);
Route::delete('/event/{event}', [EventController::class, 'destroy']);
Route::patch('/event/{event}', [EventController::class, 'update']);
Route::post('/event/{event}/interested', [EventController::class, 'interested'])->middleware('auth:sanctum');
Route::post('/event/{event}/going', [EventController::class, 'going'])->middleware('auth:sanctum');
