<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthService
{
    public function signup(array $data): array
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'user',
            'is_active' => true,
            'verification_token' => \Illuminate\Support\Str::random(64),
            'verification_expires_at' => now()->addHours(24),
        ]);

        try {
            $user->notify(new \App\Notifications\VerifyEmail($user->verification_token));
        } catch (\Exception $e) {
            // Log error
        }

        return $this->respondWithToken($user);
    }

    public function login(array $credentials): array
    {
        // Check if user exists and is locked
        $user = User::where('email', $credentials['email'])->first();

        if ($user) {
            // Check if account is locked
            if ($user->locked_until && $user->locked_until->isFuture()) {
                $minutesLeft = now()->diffInMinutes($user->locked_until);
                throw ValidationException::withMessages([
                    'email' => ["Account is locked. Please try again in {$minutesLeft} minutes."],
                ]);
            }

            // Check if account is inactive
            if (!$user->is_active) {
                throw ValidationException::withMessages([
                    'email' => ['Account is inactive. Please contact support.'],
                ]);
            }

            // Reset lock if it has expired
            if ($user->locked_until && $user->locked_until->isPast()) {
                $user->update([
                    'locked_until' => null,
                    'failed_login_attempts' => 0,
                ]);
            }
        }

        if (!$token = JWTAuth::attempt($credentials)) {
            // Handle failed login attempt
            if ($user) {
                $attempts = $user->failed_login_attempts + 1;
                $maxAttempts = 5;

                if ($attempts >= $maxAttempts) {
                    $user->update([
                        'failed_login_attempts' => $attempts,
                        'locked_until' => now()->addMinutes(15),
                    ]);

                    throw ValidationException::withMessages([
                        'email' => ['Too many failed login attempts. Account locked for 15 minutes.'],
                    ]);
                }

                $user->update(['failed_login_attempts' => $attempts]);
                $remainingAttempts = $maxAttempts - $attempts;

                throw ValidationException::withMessages([
                    'email' => ["Invalid credentials. {$remainingAttempts} attempts remaining."],
                ]);
            }

            // Generic error if user doesn't exist (don't reveal this)
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        $authenticatedUser = auth()->user();

        // Reset failed attempts on successful login
        $authenticatedUser->update([
            'last_login_at' => now(),
            'failed_login_attempts' => 0,
            'locked_until' => null,
        ]);

        return $this->createTokenResponse($token, $authenticatedUser);
    }

    public function refresh(): array
    {
        return $this->createTokenResponse(JWTAuth::refresh(), auth()->user());
    }


    public function changePassword(User $user, string $currentPassword, string $newPassword): void
    {
        if (!Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Incorrect current password'],
            ]);
        }

        $user->update(['password' => $newPassword]);
    }

    public function logout(): void
    {
        JWTAuth::invalidate(JWTAuth::getToken());
    }

    protected function respondWithToken($user): array
    {
        $token = JWTAuth::fromUser($user);
        return $this->createTokenResponse($token, $user);
    }

    protected function createTokenResponse($token, $user): array
    {
        return [
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => JWTAuth::factory()->getTTL() * 60,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ];
    }
}
