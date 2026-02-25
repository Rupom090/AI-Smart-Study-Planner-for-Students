<?php

namespace App\Http\Controllers;

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

        $request->validate([
            'message' => 'required|string',
        ]);

        // 1. Save User Message
        $material->chatMessages()->create([
            'user_id' => auth()->id(),
            'role' => 'user',
            'content' => $request->input('message'),
        ]);

        // 2. Get AI Response
        // Retrieve history (excluding the one we just saved, or include it? Service handles it)
        $history = $material->chatMessages()->orderBy('created_at', 'asc')->get()->toArray();

        $response = $this->aiService->chat($material, $history, $request->input('message'));

        // 3. Save Assistant Message
        $material->chatMessages()->create([
            'user_id' => auth()->id(),
            'role' => 'assistant',
            'content' => $response,
        ]);

        return redirect()->back();
    }
}
