<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

use App\Http\Resources\StudyMaterialResource;
use App\Models\StudyMaterial;
use App\Models\Subject;
use App\Services\AiContentService;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StudyMaterialController extends Controller
{
    protected $aiService;
    protected $fileService;

    public function __construct(AiContentService $aiService, FileUploadService $fileService)
    {
        $this->aiService = $aiService;
        $this->fileService = $fileService;
    }

    public function index(Subject $subject)
    {
        $this->authorize('view', $subject);

        return Inertia::render('StudyMaterials/Index', [
            'subject' => $subject,
            'materials' => $subject->studyMaterials()->with('file')->latest()->get()
        ]);
    }

    public function store(Request $request, Subject $subject)
    {
        $this->authorize('update', $subject);

        $request->validate([
            'file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png',
            'title' => 'required|string|max:255',
        ]);

        // 1. Upload File
        $fileModel = $this->fileService->uploadFile(
            $request->file('file'),
            auth()->id(),
            false
        );

        // 2. Extract Text with smalot/pdfparser (no OpenAI key required)
        $text = '';
        $uploadedFile = $request->file('file');
        $mimeType = $uploadedFile->getMimeType();

        if ($mimeType === 'application/pdf') {
            if (class_exists(\Smalot\PdfParser\Parser::class)) {
                try {
                    $parser = new \Smalot\PdfParser\Parser();
                    $pdf = $parser->parseFile($uploadedFile->getRealPath());
                    $text = $pdf->getText();
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning('PDF text extraction failed: ' . $e->getMessage());
                    $text = '';
                }
            }
        } elseif (str_starts_with($mimeType, 'image/')) {
            // Images: text will be extracted by Grok Vision on the Show page
            $text = '';
        } else {
            // txt / markdown fallback
            try {
                $text = file_get_contents($uploadedFile->getRealPath());
            } catch (\Exception $e) {
                $text = '';
            }
        }

        // 3. Skip AI analysis — frontend Grok (Puter.js) generates it on Show page load
        $analysis = null;

        // 4. Create Material Record
        $material = StudyMaterial::create([
            'user_id'           => auth()->id(),
            'subject_id'        => $subject->id,
            'file_id'           => $fileModel->id,
            'title'             => $request->input('title'),
            'document_type'     => str_starts_with($mimeType, 'image/') ? 'image' : 'document',
            'content_extracted' => $text,
            'ai_analysis'       => $analysis,
            'status'            => 'completed',
        ]);

        return redirect()->back();
    }

    public function show(StudyMaterial $material)
    {
        $this->authorize('view', $material);

        $material->load(['file', 'chatMessages', 'subject']);

        return Inertia::render('StudyMaterials/Show', [
            'material' => $material,
            'messages' => $material->chatMessages
        ]);
    }

    public function updateAnalysis(Request $request, StudyMaterial $material)
    {
        $this->authorize('update', $material);

        $validated = $request->validate([
            'summary' => 'required|string',
            'key_topics' => 'array',
            'important_questions' => 'array',
        ]);

        $material->update([
            'ai_analysis' => $validated,
        ]);

        return response()->json(['success' => true]);
    }

    public function destroy(StudyMaterial $material)
    {
        $this->authorize('delete', $material);
        $material->delete();
        return redirect()->back();
    }

    public function viewFile(StudyMaterial $material)
    {
        $this->authorize('view', $material);

        $file = $material->file;
        if (!$file || !$file->storage_path) {
            abort(404, 'File not found.');
        }

        $fullPath = Storage::disk('public')->path($file->storage_path);

        if (!file_exists($fullPath)) {
            abort(404, 'File missing from storage.');
        }

        return response()->file($fullPath, [
            'Content-Type' => $file->mime_type,
            'Content-Disposition' => 'inline; filename="' . $file->original_name . '"'
        ]);
    }
}
