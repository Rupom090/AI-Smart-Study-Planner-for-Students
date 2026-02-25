<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use OpenAI;

class AiFlashcardService
{
    protected $client;

    public function __construct()
    {
        $apiKey = config('services.openai.key');
        if ($apiKey) {
            $this->client = OpenAI::client($apiKey);
        }
    }

    public function generate(string $sourceText, int $count = 10, string $difficulty = 'intermediate'): array
    {
        if (!$this->client) {
            return [
                'error' => true,
                'message' => 'OpenAI API Key is missing. Please add OPENAI_API_KEY to your .env file.'
            ];
        }

        $systemPrompt = "You are an expert educational content creator. The user will provide a study text. Your task is to extract the most important concepts and turn them into a deck of $count flashcards suitable for a $difficulty level student.
        
        You must respond STRICTLY with a JSON object containing a 'flashcards' array. Each object in the array must have 'term' and 'definition' keys. 
        Example format:
        {
            \"flashcards\": [
                {
                    \"term\": \"Photosynthesis\",
                    \"definition\": \"The process by which green plants use sunlight to synthesize nutrients from carbon dioxide and water.\"
                },
                {
                    \"term\": \"Mitochondria\",
                    \"definition\": \"The powerhouse of the cell, responsible for generating most of the cell's supply of adenosine triphosphate (ATP).\"
                }
            ]
        }";

        try {
            $response = $this->client->chat()->create([
                'model' => 'gpt-4o',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => "Extract EXACTLY $count flashcards from this text:\n\n" . substr($sourceText, 0, 15000)],
                ],
                'response_format' => ['type' => 'json_object'],
            ]);

            $content = $response->choices[0]->message->content;

            $decoded = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE || !isset($decoded['flashcards'])) {
                throw new \Exception("Invalid JSON returned from OpenAI: " . json_last_error_msg());
            }

            return $decoded['flashcards'];

        } catch (\Exception $e) {
            Log::error("Flashcard generation failed: " . $e->getMessage());
            return [
                'error' => true,
                'message' => 'An error occurred while generating flashcards. Please try again later.'
            ];
        }

        return []; // placeholder
    }
}
