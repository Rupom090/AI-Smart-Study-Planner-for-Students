<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogHttpRequests
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        
        // Log incoming request (skip sensitive data)
        if ($request->expectsJson()) {
            Log::info('API Request', [
                'method' => $request->getMethod(),
                'path' => $request->getPathInfo(),
                'ip' => $request->getClientIp(),
                'user_id' => auth()->user()?->id,
                'query' => $request->query(),
            ]);
        }

        $response = $next($request);
        
        // Log response with duration
        $duration = (microtime(true) - $startTime) * 1000; // Convert to milliseconds
        
        if ($request->expectsJson()) {
            $level = $response->getStatusCode() >= 400 ? 'warning' : 'info';
            
            Log::log($level, 'API Response', [
                'method' => $request->getMethod(),
                'path' => $request->getPathInfo(),
                'status' => $response->getStatusCode(),
                'duration_ms' => round($duration, 2),
                'user_id' => auth()->user()?->id,
            ]);
        }

        return $response;
    }
}
