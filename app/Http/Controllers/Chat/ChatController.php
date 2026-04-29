<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;

use App\Models\ChatMessage;
use App\Models\StudyMaterial;
use App\Services\AiContentService;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    protected $aiService;

    public function __construct(AiContentService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function store(Request $request, StudyMaterial $material)
    {
        if ($material->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'role' => 'required|in:user,assistant',
            'content' => 'required|string',
        ]);

        $message = $material->chatMessages()->create([
            'user_id' => auth()->id(),
            'role' => $validated['role'],
            'content' => $validated['content'],
        ]);

        return response()->json([
            'success' => true,
            'message' => $message
        ]);
    }
}
