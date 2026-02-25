<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\StudyMaterial;
use App\Services\AiFlashcardService;
use Illuminate\Http\Request;

class FlashcardController extends Controller
{
    protected $flashcardService;

    public function __construct(AiFlashcardService $flashcardService)
    {
        $this->flashcardService = $flashcardService;
    }

    public function index()
    {
        // For the standalone page, we'll fetch subjects to populate a dropdown
        $subjects = auth()->user()->subjects()->with('topics')->get();
        return inertia('Flashcards/Index', [
            'subjects' => $subjects
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'source_text' => 'required|string|min:50',
            'card_count' => 'nullable|integer|min:5|max:30',
            'difficulty' => 'nullable|string|in:beginner,intermediate,advanced'
        ]);

        $flashcards = $this->flashcardService->generate(
            $request->input('source_text'),
            $request->input('card_count', 10),
            $request->input('difficulty', 'intermediate')
        );

        return response()->json([
            'flashcards' => $flashcards
        ]);
    }
}
