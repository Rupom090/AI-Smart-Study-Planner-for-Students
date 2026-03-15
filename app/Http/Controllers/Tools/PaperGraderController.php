<?php

namespace App\Http\Controllers\Tools;

use App\Http\Controllers\Controller;

use App\Services\AiGradingService;
use Illuminate\Http\Request;

class PaperGraderController extends Controller
{
    protected $gradingService;

    public function __construct(AiGradingService $gradingService)
    {
        $this->gradingService = $gradingService;
    }

    public function gradePaper(Request $request)
    {
        $request->validate([
            'content' => 'required_without:document|nullable|string',
            'document' => 'required_without:content|nullable|file|mimes:pdf,txt,md|max:10240', // 10MB max
            'rubric' => 'nullable|string'
        ]);

        $textToGrade = $request->input('content');

        if ($request->hasFile('document')) {
            $file = $request->file('document');
            $mimeType = $file->getMimeType();
            $path = $file->getRealPath();

            if ($mimeType === 'application/pdf') {
                if (class_exists(\Smalot\PdfParser\Parser::class)) {
                    try {
                        $parser = new \Smalot\PdfParser\Parser();
                        $pdf = $parser->parseFile($path);
                        $textToGrade = $pdf->getText();
                    } catch (\Exception $e) {
                        return response()->json(['feedback' => ['error' => true, 'message' => 'Failed to extract text from PDF.']], 400);
                    }
                } else {
                    return response()->json(['feedback' => ['error' => true, 'message' => 'PDF parsing is not supported on this server.']], 500);
                }
            } else {
                // Fallback for text/markdown files
                $textToGrade = file_get_contents($path);
            }
        }

        if (empty(trim((string) $textToGrade)) || strlen((string) $textToGrade) < 10) {
            return response()->json(['feedback' => ['error' => true, 'message' => 'The provided document or text is too short to grade.']], 400);
        }

        return response()->json([
            'extracted_text' => (string) $textToGrade
        ]);
    }
}
