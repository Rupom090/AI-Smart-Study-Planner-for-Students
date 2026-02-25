<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\User;
use App\Notifications\PasswordResetSuccess;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password as PasswordRule;

class PasswordResetController extends BaseApiController
{
    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse($validator->errors()->first(), 422, $validator->errors());
        }

        $user = User::where('email', $request->email)->first();
        $token = Password::broker()->createToken($user);

        $user->notify(new ResetPasswordNotification($token, $user->email));

        return $this->successResponse(null, 'We have emailed your password reset link!');
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', PasswordRule::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        if ($validator->fails()) {
            return $this->errorResponse($validator->errors()->first(), 422, $validator->errors());
        }

        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                // Determine if we need to manually hash or if setPasswordAttribute handles it
                // Since we added setPasswordAttribute, simply saving the password will trigger hashing.
                // However, Password::broker()->reset calls $user->forceFill and saves.
                // forceFill sets attributes. setPasswordAttribute intercepts key 'password'.
    
                $user->password = $password;
                $user->save();

                $user->notify(new PasswordResetSuccess());
            }
        );

        if ($status == Password::PASSWORD_RESET) {
            return $this->successResponse(null, 'Password has been reset.');
        }

        return $this->errorResponse(__($status), 400);
    }
}
