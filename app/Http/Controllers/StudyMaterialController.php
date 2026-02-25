<?php

namespace App\Http\Controllers;

use App\Models\StudyMaterial;
use App\Models\Subject;
use App\Services\AiContentService;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
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
        if ($subject->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('StudyMaterials/Index', [
            'subject' => $subject,
            'materials' => $subject->studyMaterials()->with('file')->latest()->get()
        ]);
    }

    public function store(Request $request, Subject $subject)
    {
        if ($subject->user_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png', // Limit 10MB
            'title' => 'required|string|max:255',
        ]);

        // 1. Upload File
        $fileModel = $this->fileService->uploadFile(
            $request->file('file'),
            auth()->id(),
            false // Store locally for parsing (easier than cloud URL for now)
        );

        // 2. Extract Text
        $text = $this->aiService->extractText($fileModel);

        // 3. Analyze Content
        $analysis = $this->aiService->analyzeContent($text);

        // 4. Create Material Record
        $material = StudyMaterial::create([
            'user_id' => auth()->id(),
            'subject_id' => $subject->id,
            'file_id' => $fileModel->id,
            'title' => $request->input('title'),
            'document_type' => $fileModel->isImage() ? 'image' : 'document',
            'content_extracted' => $text,
            'ai_analysis' => $analysis,
            'status' => 'completed',
        ]);

        return redirect()->back();
    }

    public function show(StudyMaterial $material)
    {
        if ($material->user_id !== auth()->id()) {
            abort(403);
        }

        $material->load(['file', 'chatMessages', 'subject']);

        return Inertia::render('StudyMaterials/Show', [
            'material' => $material,
            'messages' => $material->chatMessages
        ]);
    }

    public function destroy(StudyMaterial $material)
    {
        if ($material->user_id !== auth()->id()) {
            abort(403);
        }
        $material->delete();
        return redirect()->back();
    }
}
