<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Session;

class SessionController extends Controller
{
    public function index(Request $request)
    {
        $sessions = $request->user()->sessions()
            ->orderBy('last_activity', 'desc')
            ->get()
            ->map(function ($session) use ($request) {
                return [
                    'id' => $session->id,
                    'ip_address' => $session->ip_address,
                    'user_agent' => $session->user_agent,
                    'last_activity' => \Illuminate\Support\Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
                    'is_current' => $session->token_id === $this->getCurrentTokenId(), // Helper to identify current
                ];
            });

        return response()->json($sessions);
    }

    public function destroy(Request $request, $id)
    {
        $session = $request->user()->sessions()->findOrFail($id);

        // Optionally invalidate token if using blacklist
        // auth()->setToken($session->token_id)->invalidate();

        $session->delete();

        return response()->json(['message' => 'Session revoked']);
    }

    public function destroyAll(Request $request)
    {
        $currentTokenId = $this->getCurrentTokenId();

        $request->user()->sessions()
            ->where('token_id', '!=', $currentTokenId)
            ->delete();

        return response()->json(['message' => 'All other sessions revoked']);
    }

    protected function getCurrentTokenId()
    {
        // For JWT, we might use jti claim or just the whole token signature if we hashed it
        // Here assuming we store jti in token_id
        try {
            return auth()->payload()->get('jti');
        } catch (\Exception $e) {
            return null;
        }
    }
}
