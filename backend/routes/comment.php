<?php


use App\Http\Controllers\CommentsController;

Route::post('/comment', [CommentsController::class, 'store'])->middleware('auth:sanctum');
Route::get('/event-comments/{event}', [CommentsController::class, 'eventComments']);
Route::get('/user-comments/{user}', [CommentsController::class, 'userComments']);
