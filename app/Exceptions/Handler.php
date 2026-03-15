<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\QueryException;
use Throwable;
use Illuminate\Support\Facades\Log;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            if ($this->shouldReport($e)) {
                Log::channel('stack')->error('Application Error', [
                    'exception' => get_class($e),
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ]);
            }
        });

        // Handle custom exceptions
        $this->renderable(function (AiServiceUnavailableException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                    'error' => ['statusCode' => 503],
                ], 503);
            }
        });

        $this->renderable(function (FileTooLargeException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                    'error' => ['statusCode' => 413],
                ], 413);
            }
        });

        $this->renderable(function (InvalidFileTypeException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                    'error' => ['statusCode' => 422],
                ], 422);
            }
        });

        $this->renderable(function (UnauthorizedException $e, $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                    'error' => ['statusCode' => 403],
                ], 403);
            }
        });
    }

    public function render($request, Throwable $e)
    {
        // Handle JSON requests for standard exceptions
        if ($request->expectsJson()) {
            // Handle validation exceptions
            if ($e instanceof ValidationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'error' => [
                        'statusCode' => 422,
                        'errors' => $e->errors(),
                    ]
                ], 422);
            }

            // Handle authentication exceptions
            if ($e instanceof AuthenticationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated',
                    'error' => ['statusCode' => 401],
                ], 401);
            }

            // Handle query exceptions
            if ($e instanceof QueryException) {
                Log::error('Database Query Error', [
                    'message' => $e->getMessage(),
                    'query' => $e->getSql(),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Database error occurred',
                    'error' => ['statusCode' => 500],
                ], 500);
            }

            // Handle authorization exceptions
            if ($e instanceof \Illuminate\Auth\Access\AuthorizationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are not authorized to perform this action',
                    'error' => ['statusCode' => 403],
                ], 403);
            }

            // Generic error response
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'An error occurred',
                'error' => ['statusCode' => 500],
            ], 500);
        }

        return parent::render($request, $e);
    }
}
