<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

use App\Services\AiSolveService;
use Illuminate\Http\Request;

class SolveController extends Controller
{
    protected $aiService;

    public function __construct(AiSolveService $aiService)
    {
        $this->aiService = $aiService;
    }

    public function analyzeText(Request $request)
    {
        $request->validate([
            'question' => 'required|string|max:5000',
        ]);

        $solution = $this->aiService->solveText($request->input('question'));

        return response()->json([
            'solution' => $solution
        ]);
    }

    public function analyzeImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // Max 5MB
        ]);

        $file = $request->file('image');

        // Let the service handle converting the image file to base64 and querying OpenAI
        $solution = $this->aiService->solveImage($file);

        return response()->json([
            'solution' => $solution
        ]);
    }
}
