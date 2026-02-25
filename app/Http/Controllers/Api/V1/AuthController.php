<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthController extends BaseApiController
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function signup(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse($validator->errors()->first(), 422, $validator->errors());
        }

        try {
            $data = $this->authService->signup($request->all());
            return $this->successResponse($data, 'User created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse('Registration failed', 500, $e->getMessage());
        }
    }

    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
            'code' => 'sometimes|string',
            'recovery_code' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse($validator->errors()->first(), 422, $validator->errors());
        }

        try {
            // Manual authentication (since we need to check 2FA before issuing token)
            $user = \App\Models\User::where('email', $request->email)->first();

            if (!$user || !\Illuminate\Support\Facades\Hash::check($request->password, $user->password)) {
                return $this->errorResponse('Invalid credentials', 401);
            }

            // Check 2FA
            if ($user->two_factor_confirmed_at) {
                if ($request->filled('code')) {
                    $google2fa = new \PragmaRX\Google2FA\Google2FA();
                    if (!$google2fa->verifyKey($user->two_factor_secret, $request->code)) {
                        return $this->errorResponse('Invalid 2FA code', 422);
                    }
                } elseif ($request->filled('recovery_code')) {
                    // Check recovery codes
                    $codes = $user->two_factor_recovery_codes ?? [];
                    if (!in_array($request->recovery_code, $codes)) {
                        return $this->errorResponse('Invalid recovery code', 422);
                    }
                    // Remove used code
                    $user->forceFill([
                        'two_factor_recovery_codes' => array_diff($codes, [$request->recovery_code])
                    ])->save();

                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'Two-factor authentication required',
                        'requires_two_factor' => true
                    ], 403);
                }
            }

            $token = \Illuminate\Support\Facades\Auth::guard('api')->login($user); // Login and get token
            return $this->respondWithToken($token, $user);

        } catch (\Illuminate\Validation\ValidationException $e) {
            $errors = $e->errors();
            $message = $errors['email'][0] ?? 'Invalid credentials';
            return $this->errorResponse($message, 401, $errors);
        } catch (\Exception $e) {
            return $this->errorResponse('Login failed ' . $e->getMessage(), 500);
        }
    }

    protected function respondWithToken($token, $user)
    {
        // Create session record
        try {
            $payload = auth()->setToken($token)->payload();
            $jti = $payload->get('jti');

            \App\Models\Session::create([
                'user_id' => $user->id,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'last_activity' => now()->timestamp,
                'token_id' => $jti,
                'payload' => null,
            ]);
        } catch (\Exception $e) {
            // Log error but don't fail login
            \Illuminate\Support\Facades\Log::error('Failed to create session: ' . $e->getMessage());
        }

        return $this->successResponse([
            'user' => $user,
            'authorization' => [
                'token' => $token,
                'type' => 'bearer',
                'expires_in' => \Illuminate\Support\Facades\Auth::guard('api')->factory()->getTTL() * 60
            ]
        ], 'Login successful');
    }

    public function logout(): JsonResponse
    {
        try {
            $this->authService->logout();
            return $this->successResponse(null, 'Successfully logged out');
        } catch (\Exception $e) {
            return $this->errorResponse('Logout failed', 500);
        }
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse($validator->errors()->first(), 422, $validator->errors());
        }

        try {
            $this->authService->changePassword($request->user(), $request->current_password, $request->new_password);
            return $this->successResponse(null, 'Password changed successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        } catch (\Exception $e) {
            return $this->errorResponse('Password change failed', 500);
        }
    }

    public function refresh(): JsonResponse
    {
        try {
            $data = $this->authService->refresh();
            return $this->successResponse($data, 'Token refreshed');
        } catch (\Exception $e) {
            return $this->errorResponse('Refresh failed', 401);
        }
    }
}
