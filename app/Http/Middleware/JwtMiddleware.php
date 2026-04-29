<?php

namespace App\Http\Middleware;

use Closure;
use Exception;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenExpiredException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenInvalidException;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Symfony\Component\HttpFoundation\Response;

class JwtMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated via standard web session (for Inertia frontend calls)
        if (auth('web')->check()) {
            // Use the web guard for this request
            auth()->shouldUse('web');
            return $next($request);
        }

        try {
            $user = JWTAuth::parseToken()->authenticate();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User not found'], 404);
            }

        } catch (Exception $e) {
            if ($e instanceof TokenInvalidException) {
                return response()->json(['success' => false, 'message' => 'Token is Invalid'], 401);
            } elseif ($e instanceof TokenExpiredException) {
                return response()->json(['success' => false, 'message' => 'Token is Expired'], 401);
            } else {
                return response()->json(['success' => false, 'message' => 'Authorization Token not found'], 401);
            }
        }

        return $next($request);
    }
}
