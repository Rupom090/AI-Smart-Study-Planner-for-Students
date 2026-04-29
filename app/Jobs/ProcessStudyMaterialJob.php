<?php

namespace App\Jobs;

use App\Models\StudyMaterial;
use App\Services\AiContentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessStudyMaterialJob implements ShouldQueue
{
    use Dispatchable, Queueable, SerializesModels;

    public $tries = 2;
    public $timeout = 300; // 5 minutes
    public $backoff = 60; // Retry after 60 seconds

    protected StudyMaterial $material;

    /**
     * Create a new job instance.
     */
    public function __construct(StudyMaterial $material)
    {
        $this->material = $material;
    }

    /**
     * Execute the job.
     */
    public function handle(AiContentService $aiService): void
    {
        try {
            $this->material->update(['status' => 'processing']);

            // Extract text from file
            $text = $aiService->extractText($this->material->file);

            // Store extracted content
            $this->material->update(['content_extracted' => $text]);

            // Analyze content with AI (Handled securely via Frontend Puter.js integration now)
            // $analysis = $aiService->analyzeContent($text);

            // Update material mark as completed (analysis will be generated on demand by the frontend)
            $this->material->update([
                'ai_analysis' => null,
                'status' => 'completed',
            ]);

            Log::info('Study material analysis completed', [
                'material_id' => $this->material->id,
                'user_id' => $this->material->user_id,
            ]);
        } catch (\Exception $e) {
            Log::error('Study material analysis failed', [
                'material_id' => $this->material->id,
                'error' => $e->getMessage(),
            ]);

            $this->material->update(['status' => 'failed']);
            throw $e;
        }
    }
}
