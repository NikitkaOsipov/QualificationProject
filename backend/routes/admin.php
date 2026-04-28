<?php
use App\Http\Controllers\AdminController;

Route::middleware(['auth:sanctum', 'admin'])->prefix('/admin')->group(function () {
    Route::get('/users', [AdminController::class, 'index']);
    Route::patch('/users/{targetUser}', [AdminController::class, 'update']);
    Route::delete('/users/{targetUser}', [AdminController::class, 'destroy']);
});
