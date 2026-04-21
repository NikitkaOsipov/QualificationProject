<?php


use App\Http\Controllers\EventController;
use Illuminate\Support\Facades\Route;

Route::post('/event', [EventController::class, 'store'])->middleware('auth:sanctum');
Route::get('/all-events', [EventController::class, 'index']);
Route::get('/event/{event}', [EventController::class, 'show']);
Route::delete('/event/{event}', [EventController::class, 'destroy'])->middleware('auth:sanctum');
Route::patch('/event/{event}', [EventController::class, 'update'])->middleware('auth:sanctum');
Route::post('/event/{event}/interested', [EventController::class, 'interested'])->middleware('auth:sanctum');
Route::post('/event/{event}/going', [EventController::class, 'going'])->middleware('auth:sanctum');
Route::post('/event/{event}/request-participation', [EventController::class, 'requestParticipation'])->middleware('auth:sanctum');
