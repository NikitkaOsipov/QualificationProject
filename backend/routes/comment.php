<?php


use App\Http\Controllers\CommentsController;

Route::post('/comment', [CommentsController::class, 'store'])->middleware('auth:sanctum');
Route::patch('/comment/{comment}', [CommentsController::class, 'update'])->middleware('auth:sanctum');
Route::delete('/comment/{comment}', [CommentsController::class, 'destroy'])->middleware('auth:sanctum');

Route::get('/event-comments/{event}', [CommentsController::class, 'eventComments']);
Route::get('/user-comments/{user}', [CommentsController::class, 'userComments']);
