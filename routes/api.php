<?php

use App\Http\Controllers\Web\PlanController;
use App\Http\Controllers\Tools\ProgressLogController;
use App\Http\Controllers\Web\SolveController;
use App\Http\Controllers\Tools\PaperGraderController;
use App\Http\Controllers\Web\FlashcardController;
use App\Http\Controllers\Chat\DocumentChatController;
use App\Http\Controllers\Web\SubjectController;
use App\Http\Controllers\Tasks\TaskController;
use App\Http\Controllers\Web\TopicController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AudioController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\ExportController;
use App\Http\Controllers\Api\V1\FileUploadController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PasswordResetController;
use App\Http\Controllers\Api\V1\PasteController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\SessionController;
use App\Http\Controllers\Api\V1\TwoFactorController;
use App\Http\Controllers\Api\V1\VerificationController;

Route::prefix('v1')->group(function () {
    Route::get('/health', [HealthController::class, 'index']);

    Route::prefix('auth')->group(function () {
        Route::post('signup', [AuthController::class, 'signup']);
        Route::post('login',  [AuthController::class, 'login'])->middleware('throttle:5,1');
        Route::post('forgot-password', [PasswordResetController::class, 'forgotPassword']);
        Route::post('reset-password',  [PasswordResetController::class, 'resetPassword']);

        // Public email verification
        Route::post('verify-email/{token}', [VerificationController::class, 'verify']);

        // Payment Webhook (no auth — Stripe signs the payload)
        Route::post('payments/webhook', [PaymentController::class, 'webhook']);

        Route::middleware('auth.jwt')->group(function () {
            Route::post('logout',          [AuthController::class, 'logout']);
            Route::post('refresh',         [AuthController::class, 'refresh']);
            Route::post('password/change', [AuthController::class, 'changePassword']);

            // 2FA Routes
            Route::prefix('2fa')->group(function () {
                Route::post('enable',   [TwoFactorController::class, 'store']);
                Route::post('confirm',  [TwoFactorController::class, 'confirm']);
                Route::delete('disable',[TwoFactorController::class, 'destroy']);
                Route::get('recovery-codes',  [TwoFactorController::class, 'recoveryCodes']);      // FIX: was duplicated
                Route::post('recovery-codes', [TwoFactorController::class, 'regenerateRecoveryCodes']);
            });

            // Session Routes
            Route::prefix('sessions')->group(function () {
                Route::get('/',    [SessionController::class, 'index']);
                Route::delete('/{id}', [SessionController::class, 'destroy']);
                Route::delete('/',     [SessionController::class, 'destroyAll']);
            });

            // Email Verification
            Route::post('email/resend', [VerificationController::class, 'resend']);
        });
    });

    // Protected Routes (JWT auth required)
    Route::middleware('auth.jwt')->group(function () {
        Route::post('payments/intent', [PaymentController::class, 'createIntent']);

        Route::get('/profile', function (\Illuminate\Http\Request $request) {
            return response()->json(['success' => true, 'data' => $request->user()]);
        });

        Route::middleware('role:admin')->get('/admin-only', function () {
            return response()->json(['success' => true, 'message' => 'Welcome Admin']);
        });

        // File & Paste Routes
        Route::prefix('files')->group(function () {
            Route::post('/upload',          [FileUploadController::class, 'upload'])->middleware('throttle:20,1');
            Route::post('/upload-multiple', [FileUploadController::class, 'uploadMultiple'])->middleware('throttle:10,1');
            Route::post('/audio/transcribe',[AudioController::class, 'transcribe'])->middleware('throttle:10,1');
            Route::get('/',    [FileUploadController::class, 'index']);
            Route::get('/{id}',[FileUploadController::class, 'show']);
            Route::delete('/{id}', [FileUploadController::class, 'destroy']);

            // Paste sub-routes — throttled separately so they don't share the upload bucket
            Route::post('/paste',               [PasteController::class, 'store'])->middleware('throttle:30,1');
            Route::post('/paste/fetch-title',   [PasteController::class, 'fetchTitle'])->middleware('throttle:20,1');
            Route::post('/paste/fetch-content', [PasteController::class, 'fetchContent'])->middleware('throttle:20,1');
        });

        // Notification Routes
        Route::prefix('notifications')->group(function () {
            Route::get('/',                  [NotificationController::class, 'index']);
            Route::post('/',                 [NotificationController::class, 'store']);
            Route::get('/unread-count',      [NotificationController::class, 'getUnreadCount']);
            Route::patch('/{id}/read',       [NotificationController::class, 'markAsRead']);
            Route::patch('/mark-all-read',   [NotificationController::class, 'markAllAsRead']);
            Route::delete('/{id}',           [NotificationController::class, 'destroy']);
        });

        // Analytics Routes
        Route::prefix('analytics')->group(function () {
            Route::post('/event',  [AnalyticsController::class, 'trackEvent']);
            Route::get('/events',  [AnalyticsController::class, 'getEvents'])->middleware('role:admin');
        });

        // Export Routes
        Route::prefix('export')->group(function () {
            Route::get('/files',         [ExportController::class, 'exportFiles']);
            Route::get('/notifications', [ExportController::class, 'exportNotifications']);
            Route::get('/analytics',     [ExportController::class, 'exportAnalytics'])->middleware('role:admin');
        });

        // Subjects & Topics
        Route::get('/subjects',                  [SubjectController::class, 'index']);
        Route::post('/subjects',                 [SubjectController::class, 'store']);
        Route::put('/subjects/{subject}',        [SubjectController::class, 'update']);
        Route::delete('/subjects/{subject}',     [SubjectController::class, 'destroy']);
        Route::get('/subjects/{subject}/topics', [TopicController::class, 'index']);
        Route::post('/subjects/{subject}/topics',[TopicController::class, 'store']);
        Route::put('/topics/{topic}',            [TopicController::class, 'update']);
        Route::delete('/topics/{topic}',         [TopicController::class, 'destroy']);

        // Study Plans
        Route::get('/plans/today',          [PlanController::class, 'today']);
        Route::post('/plans/generate',      [PlanController::class, 'generate'])->middleware('throttle:10,1');
        Route::post('/plans/regenerate',    [PlanController::class, 'regenerate'])->middleware('throttle:10,1');

        // Tasks & Logs
        Route::patch('/tasks/{task}',   [TaskController::class, 'updateStatus']);
        Route::post('/progress-logs',   [ProgressLogController::class, 'store']);

        // AI Integrations
        Route::post('/solve/text',          [SolveController::class, 'analyzeText'])->middleware('throttle:20,1');
        Route::post('/solve/image',         [SolveController::class, 'analyzeImage'])->middleware('throttle:20,1');
        Route::post('/paper-grader',        [PaperGraderController::class, 'gradePaper'])->middleware('throttle:10,1');
        Route::post('/flashcards/generate', [FlashcardController::class, 'generate'])->middleware('throttle:15,1');
        Route::post('/document-chat',       [DocumentChatController::class, 'chat'])->middleware('throttle:30,1');

    });
});


