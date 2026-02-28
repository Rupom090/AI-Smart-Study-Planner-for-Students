<?php

use App\Http\Controllers\PlanController;
use App\Http\Controllers\ProgressLogController;
use App\Http\Controllers\SolveController;
use App\Http\Controllers\PaperGraderController;
use App\Http\Controllers\FlashcardController;
use App\Http\Controllers\DocumentChatController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TopicController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\FileUploadController;
use App\Http\Controllers\Api\V1\PasteController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\ExportController;

Route::prefix('v1')->group(function () {
    Route::get('/health', [HealthController::class, 'index']);

    Route::prefix('auth')->group(function () {
        Route::post('signup', [AuthController::class, 'signup']);
        Route::post('login', [AuthController::class, 'login'])->middleware('throttle:5,1');
        Route::post('forgot-password', [App\Http\Controllers\Api\V1\PasswordResetController::class, 'forgotPassword']);
        Route::post('reset-password', [App\Http\Controllers\Api\V1\PasswordResetController::class, 'resetPassword']);
        Route::middleware('auth.jwt')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('refresh', [AuthController::class, 'refresh']);
            Route::post('password/change', [AuthController::class, 'changePassword']);

            // 2FA Routes
            Route::prefix('2fa')->group(function () {
                Route::post('enable', [App\Http\Controllers\Api\V1\TwoFactorController::class, 'store']);
                Route::post('confirm', [App\Http\Controllers\Api\V1\TwoFactorController::class, 'confirm']);
                Route::delete('disable', [App\Http\Controllers\Api\V1\TwoFactorController::class, 'destroy']);
                Route::get('recovery-codes', [App\Http\Controllers\Api\V1\TwoFactorController::class, 'recoveryCodes']);
                Route::get('recovery-codes', [App\Http\Controllers\Api\V1\TwoFactorController::class, 'recoveryCodes']);
                Route::post('recovery-codes', [App\Http\Controllers\Api\V1\TwoFactorController::class, 'regenerateRecoveryCodes']);
            });

            // Session Routes
            Route::get('sessions', [App\Http\Controllers\Api\V1\SessionController::class, 'index']);
            Route::delete('sessions/{id}', [App\Http\Controllers\Api\V1\SessionController::class, 'destroy']);
            Route::delete('sessions', [App\Http\Controllers\Api\V1\SessionController::class, 'destroyAll']);

            // Email Verification Routes
            Route::post('email/resend', [App\Http\Controllers\Api\V1\VerificationController::class, 'resend']);
        });

        // Public route for verification
        Route::post('verify-email/{token}', [App\Http\Controllers\Api\V1\VerificationController::class, 'verify']);

        // Payment Webhook
        Route::post('payments/webhook', [App\Http\Controllers\Api\V1\PaymentController::class, 'webhook']);
    });

    // Protected Routes
    Route::middleware('auth.jwt')->group(function () {
        Route::post('payments/intent', [App\Http\Controllers\Api\V1\PaymentController::class, 'createIntent']);
        Route::get('/profile', function (Illuminate\Http\Request $request) {
            return response()->json(['success' => true, 'data' => $request->user()]);
        });

        Route::middleware('role:admin')->get('/admin-only', function () {
            return response()->json(['success' => true, 'message' => 'Welcome Admin']);
        });

        // File Upload Routes
        Route::prefix('files')->group(function () {
            Route::post('/upload', [FileUploadController::class, 'upload']);
            Route::post('/upload-multiple', [FileUploadController::class, 'uploadMultiple']);
            Route::post('/paste', [PasteController::class, 'store']);
            Route::get('/', [FileUploadController::class, 'index']);
            Route::get('/{id}', [FileUploadController::class, 'show']);
            Route::delete('/{id}', [FileUploadController::class, 'destroy']);
        });

        // Notification Routes
        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::post('/', [NotificationController::class, 'store']);
            Route::get('/unread-count', [NotificationController::class, 'getUnreadCount']);
            Route::patch('/{id}/read', [NotificationController::class, 'markAsRead']);
            Route::patch('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
            Route::delete('/{id}', [NotificationController::class, 'destroy']);
        });

        // Analytics Routes
        Route::prefix('analytics')->group(function () {
            Route::post('/event', [AnalyticsController::class, 'trackEvent']);
            Route::get('/events', [AnalyticsController::class, 'getEvents'])->middleware('role:admin');
        });

        // Export Routes
        Route::prefix('export')->group(function () {
            Route::get('/files', [ExportController::class, 'exportFiles']);
            Route::get('/notifications', [ExportController::class, 'exportNotifications']);
            Route::get('/analytics', [ExportController::class, 'exportAnalytics'])->middleware('role:admin');
        });

        // Core Routes
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

        // AI Integrations
        Route::post('/solve/text', [SolveController::class, 'analyzeText']);
        Route::post('/solve/image', [SolveController::class, 'analyzeImage']);
        Route::post('/paper-grader', [PaperGraderController::class, 'gradePaper']);
        Route::post('/flashcards/generate', [FlashcardController::class, 'generate']);
        Route::post('/document-chat', [DocumentChatController::class, 'chat']);
    });
});


