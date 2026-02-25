<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use OpenAI;
use Illuminate\Http\UploadedFile;

class AiSolveService
{
    protected $client;

    public function __construct()
    {
        $apiKey = config('services.openai.key');
        if ($apiKey) {
            $this->client = OpenAI::client($apiKey);
        }
    }

    public function solveText(string $question): string
    {
        if (!$this->client) {
            return "Error: OpenAI API Key is missing. Please add OPENAI_API_KEY to your .env file.";
        }

        try {
            $response = $this->client->chat()->create([
                'model' => 'gpt-4o',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => "You are an expert AI tutor. A student will ask you a question. Provide a clear, step-by-step solution. Format your response beautifully using Markdown. Use bolding for emphasis and code blocks if appropriate."
                    ],
                    [
                        'role' => 'user',
                        'content' => $question
                    ],
                ],
            ]);

            return $response->choices[0]->message->content ?? "Sorry, I couldn't generate a solution. Please try again.";
        } catch (\Exception $e) {
            Log::error("Text solve failed: " . $e->getMessage());
            return "An error occurred while communicating with the AI. Please try again later.";
        }
    }

    public function solveImage(UploadedFile $file): string
    {
        if (!$this->client) {
            return "Error: OpenAI API Key is missing. Please add OPENAI_API_KEY to your .env file.";
        }

        try {
            // Convert the uploaded file to base64
            $imageData = base64_encode(file_get_contents($file->getRealPath()));
            $mimeType = $file->getMimeType();
            $src = 'data:' . $mimeType . ';base64,' . $imageData;

            $response = $this->client->chat()->create([
                'model' => 'gpt-4o',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => "You are an expert AI tutor. The user has uploaded an image of a question, math problem, or scenario. First, briefly state what you see in the image. Then, provide a clear, step-by-step solution or explanation. Format your response beautifully using Markdown."
                    ],
                    [
                        'role' => 'user',
                        'content' => [
                            ['type' => 'text', 'text' => 'Please solve or explain the problem shown in this image.'],
                            ['type' => 'image_url', 'image_url' => ['url' => $src]],
                        ],
                    ],
                ],
            ]);

            return $response->choices[0]->message->content ?? "Sorry, I couldn't generate a solution from the image. Please ensure the text/problem is clear and legible.";
        } catch (\Exception $e) {
            Log::error("Image solve failed: " . $e->getMessage());
            return "An error occurred while analyzing the image. Please try again later.";
        }
    }
}
