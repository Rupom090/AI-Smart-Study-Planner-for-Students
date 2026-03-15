<?php

namespace App\Services;

use App\Models\File;
use App\Models\StudyMaterial;
use Illuminate\Support\Facades\Log;
use OpenAI;
use Smalot\PdfParser\Parser;

class AiContentService
{
    protected $client;

    public function __construct()
    {
        $apiKey = config('services.openai.key');
        if ($apiKey) {
            $this->client = OpenAI::client($apiKey);
        }
    }

    /**
     * Extract text from a file (PDF or Image).
     */
    public function extractText(File $file): string
    {
        $url = $file->url ?? null;
        $path = $file->storage_path ?? storage_path('app/' . $file->path);

        if (!$url && !file_exists($path)) {
            return "File content not accessible for extraction.";
        }

        if ($file->mime_type === 'application/pdf') {
            return $this->extractPdfText($url ?: $path, (bool) $url);
        }

        if (str_starts_with($file->mime_type, 'image/')) {
            return $this->extractImageText($file);
        }

        // Fallback for text files
        try {
            return file_get_contents($url ?: $path);
        } catch (\Exception $e) {
            return "Could not read text file.";
        }
    }

    protected function extractPdfText(string $source, bool $isUrl = false): string
    {
        if (class_exists(Parser::class)) {
            try {
                $parser = new Parser();
                if ($isUrl) {
                    $content = file_get_contents($source);
                    if (!$content)
                        throw new \Exception("Could not fetch PDF from URL");
                    $pdf = $parser->parseContent($content);
                } else {
                    $pdf = $parser->parseFile($source);
                }
                return $pdf->getText();
            } catch (\Exception $e) {
                Log::error("PDF Parsing failed: " . $e->getMessage());
                return "Error parsing PDF. Please try a text file or image.";
            }
        }

        return "PDF Parser library (smalot/pdfparser) not installed. Please run: composer require smalot/pdfparser";
    }

    protected function extractImageText(File $file): string
    {
        if (!$this->client)
            return "OpenAI API Key missing.";

        // For images, we use GPT-4o Vision
        // We typically need a public URL or base64. 
        // Assuming local file, we convert to base64.
        $path = $file->storage_path ?? storage_path('app/' . $file->path);
        $imageData = base64_encode(file_get_contents($path));
        $src = 'data:' . $file->mime_type . ';base64,' . $imageData;

        try {
            $response = $this->client->chat()->create([
                'model' => 'gpt-4o',
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => [
                            ['type' => 'text', 'text' => 'Transcribe all text from this image clearly.'],
                            ['type' => 'image_url', 'image_url' => ['url' => $src]],
                        ],
                    ],
                ],
            ]);

            return $response->choices[0]->message->content ?? '';
        } catch (\Exception $e) {
            Log::error("Image extraction failed: " . $e->getMessage());
            return "Failed to extract text from image.";
        }
    }

    /**
     * Analyze text to extract topics and questions.
     */
    public function analyzeContent(string $text): array
    {
        if (!$this->client) {
            return [
                'summary' => 'OpenAI Key missing.',
                'key_topics' => [],
                'important_questions' => []
            ];
        }

        // Truncate text if too long (rough token limit safe guard)
        $safeText = substr($text, 0, 20000);

        $prompt = "Analyze the following study material. 
        Output a JSON object with:
        - summary (string): Brief overview.
        - key_topics (array of strings): Important concepts.
        - important_questions (array of strings): 5-10 potential exam questions based on this text.
        
        Text:
        $safeText";

        try {
            $response = $this->client->chat()->create([
                'model' => 'gpt-4o',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a helpful study assistant. Output strictly JSON.'],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'response_format' => ['type' => 'json_object'],
            ]);

            $content = $response->choices[0]->message->content;
            return json_decode($content, true) ?? [];
        } catch (\Exception $e) {
            Log::error("Content analysis failed: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Chat with the document.
     */
    public function chat(StudyMaterial $material, array $history, string $newMessage): string
    {
        if (!$this->client)
            return "I can't chat without an API key.";

        // Build context
        $context = substr($material->content_extracted, 0, 20000);

        $messages = [
            ['role' => 'system', 'content' => "You are a specialized tutor for this document. Answer questions based ONLY on the context below. If the answer isn't in the context, say so.\n\nContext:\n$context"]
        ];

        // Add history (limit last 10 for context window)
        $recentHistory = array_slice($history, -10);
        foreach ($recentHistory as $msg) {
            $messages[] = ['role' => $msg['role'], 'content' => $msg['content']];
        }

        $messages[] = ['role' => 'user', 'content' => $newMessage];

        try {
            $response = $this->client->chat()->create([
                'model' => 'gpt-4o',
                'messages' => $messages,
            ]);

            return $response->choices[0]->message->content ?? "I'm not sure how to answer that.";
        } catch (\Exception $e) {
            Log::error("Chat failed: " . $e->getMessage());
            return "Sorry, I encountered an error answering your question.";
        }
    }
}
