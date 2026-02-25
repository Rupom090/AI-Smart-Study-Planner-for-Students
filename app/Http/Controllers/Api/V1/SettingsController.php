<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class SettingsController extends BaseApiController
{
    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'avatar_url' => 'nullable|url',
        ]);

        $user = $request->user();
        $user->update($validated);

        return $this->successResponse($user, 'Profile updated successfully.');
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|current_password',
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
        ]);

        $user = $request->user();
        $user->password = $validated['password']; // SetPasswordAttribute handles hashing
        $user->save();

        return $this->successResponse(null, 'Password updated successfully.');
    }

    public function updateNotifications(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email_notifications' => 'required|boolean',
            'push_notifications' => 'required|boolean',
            'notification_frequency' => 'required|in:instant,daily,weekly',
        ]);

        $user = $request->user();
        $user->update($validated);

        return $this->successResponse($user, 'Notification preferences updated.');
    }

    public function getSessions(Request $request): JsonResponse
    {
        if (config('session.driver') !== 'database') {
            return $this->successResponse([], 'Session list is only available when using database session driver.');
        }

        $sessions = DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->orderBy('last_activity', 'desc')
            ->get()
            ->map(function ($session) {
                return [
                    'ip_address' => $session->ip_address,
                    'user_agent' => $session->user_agent,
                    'last_activity' => date('Y-m-d H:i:s', $session->last_activity),
                ];
            });

        return $this->successResponse($sessions);
    }

    public function exportData(Request $request): JsonResponse
    {
        $user = $request->user()->load(['subjects.topics', 'dailyPlans', 'progressLogs']);

        return $this->successResponse($user, 'Account data exported successfully.');
    }

    public function deleteAccount(Request $request): JsonResponse
    {
        $request->validate([
            'password' => 'required|current_password',
        ]);

        $user = $request->user();

        // Revoke tokens
        auth()->logout();

        // Delete User
        $user->delete();

        return $this->successResponse(null, 'Account deleted successfully.');
    }
}
