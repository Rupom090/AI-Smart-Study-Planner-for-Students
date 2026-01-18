<?php

use App\Http\Controllers\PlanController;
use App\Http\Controllers\ProgressLogController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TopicController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/subjects', [SubjectController::class, 'index']);
    Route::post('/subjects', [SubjectController::class, 'store']);
    Route::put('/subjects/{subject}', [SubjectController::class, 'update']);
    Route::delete('/subjects/{subject}', [SubjectController::class, 'destroy']);

    Route::get('/subjects/{subject}/topics', [TopicController::class, 'index']);
    Route::post('/subjects/{subject}/topics', [TopicController::class, 'store']);
    Route::put('/topics/{topic}', [TopicController::class, 'update']);
    Route::delete('/topics/{topic}', [TopicController::class, 'destroy']);

    Route::get('/plans/today', [PlanController::class, 'today']);
    Route::post('/plans/generate', [PlanController::class, 'generate']);
    Route::post('/plans/regenerate', [PlanController::class, 'regenerate']);

    Route::patch('/tasks/{task}', [TaskController::class, 'updateStatus']);

    Route::post('/progress-logs', [ProgressLogController::class, 'store']);
});
