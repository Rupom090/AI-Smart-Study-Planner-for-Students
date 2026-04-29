<?php

namespace App\Http\Controllers\Chat;

use App\Http\Controllers\Controller;

use App\Models\Subject;
use App\Models\StudyMaterial;
use App\Services\AiContentService;
use Illuminate\Http\Request;

class DocumentChatController extends Controller
{
    protected $contentService;

    public function __construct(AiContentService $contentService)
    {
        $this->contentService = $contentService;
    }

    public function index(Request $request)
    {
        // For the standalone page, we'll fetch subjects and materials
        $user = auth()->user();

        $subjects = Subject::where('user_id', $user->id)
            ->with(['topics.studyMaterials'])
            ->get();

        // If a specific material is requested
        $activeMaterial = null;
        if ($request->has('material_id')) {
            $activeMaterial = StudyMaterial::find($request->input('material_id'));
        }

        return inertia('DocumentChat/Index', [
            'subjects' => $subjects,
            'activeMaterial' => $activeMaterial
        ]);
    }

    public function chat(Request $request)
    {
        $request->validate([
            'material_id' => 'required|exists:study_materials,id',
            'message' => 'required|string|max:1000',
            'history' => 'nullable|array' // Array of previous message objects
        ]);

        $material = StudyMaterial::findOrFail($request->input('material_id'));

        // Ensure user owns this material via topic->subject
        if ($material->topic->subject->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $history = $request->input('history', []);
        $message = $request->input('message');

        $reply = $this->contentService->chat($material, $history, $message);

        return response()->json([
            'reply' => $reply
        ]);
    }
}
