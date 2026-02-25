<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withProviders()
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\SecurityHeaders::class,
        ]);

        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'auth' => \App\Http\Middleware\Authenticate::class,
            'auth.jwt' => \App\Http\Middleware\JwtMiddleware::class,
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Illuminate\Http\Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $statusCode = 500;
                $message = 'Internal Server Error';
                $details = [];

                if ($e instanceof \Illuminate\Validation\ValidationException) {
                    $statusCode = 422; // Or 400 as per request, but 422 is Laravel standard
                    $message = 'Validation Error';
                    $details = $e->errors();
                } elseif ($e instanceof \Illuminate\Auth\AuthenticationException) {
                    $statusCode = 401;
                    $message = 'Unauthenticated';
                } elseif ($e instanceof \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException || $e instanceof \Illuminate\Auth\Access\AuthorizationException) {
                    $statusCode = 403;
                    $message = 'Forbidden';
                } elseif ($e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException || $e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                    $statusCode = 404;
                    $message = 'Resource not found';
                } elseif ($e instanceof \App\Exceptions\AppError) {
                    $statusCode = $e->getStatusCode();
                    $message = $e->getMessage();
                    $details = $e->getDetails();
                } else {
                    // Generic Handling
                    $statusCode = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;
                    $message = $statusCode === 500 ? 'Internal Server Error' : $e->getMessage();

                    if (app()->environment('local', 'testing') && $statusCode === 500) {
                        $message = $e->getMessage();
                        $details = [
                            'trace' => $e->getTrace(),
                            'file' => $e->getFile(),
                            'line' => $e->getLine()
                        ];
                    }
                }

                return response()->json([
                    'success' => false,
                    'message' => $message,
                    'error' => [
                        'statusCode' => $statusCode,
                        'details' => $details,
                    ]
                ], $statusCode);
            }
        });
    })->create();
