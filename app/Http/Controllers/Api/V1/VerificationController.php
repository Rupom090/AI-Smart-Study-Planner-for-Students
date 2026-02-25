<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Str;

class VerificationController extends Controller
{
    public function verify(Request $request, $token)
    {
        $user = User::where('verification_token', $token)->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid verification token'], 422);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified']);
        }

        if ($user->verification_expires_at && $user->verification_expires_at->isPast()) {
            return response()->json(['message' => 'Verification token expired'], 422);
        }

        $user->markEmailAsVerified();
        $user->forceFill([
            'verification_token' => null,
            'verification_expires_at' => null,
        ])->save();

        return response()->json(['message' => 'Email verified successfully']);
    }

    public function resend(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified']);
        }

        $token = Str::random(64);

        $request->user()->forceFill([
            'verification_token' => $token,
            'verification_expires_at' => now()->addHours(24),
        ])->save();

        $request->user()->notify(new \App\Notifications\VerifyEmail($token));

        return response()->json(['message' => 'Verification email sent']);
    }
}
