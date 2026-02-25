<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use OpenAI;

class AiGradingService
{
    protected $client;

    public function __construct()
    {
        $apiKey = config('services.openai.key');
        if ($apiKey) {
            $this->client = OpenAI::client($apiKey);
        }
    }

    public function gradeText(string $text, string $rubric): array
    {
        if (!$this->client) {
            return [
                'error' => true,
                'message' => 'OpenAI API Key is missing. Please add OPENAI_API_KEY to your .env file.'
            ];
        }

        // We want structured JSON out of OpenAI for the frontend to easily map to the UI.
        $systemPrompt = "You are an expert academic grader. The user will provide a text to grade based on the '$rubric' rubric.
        
        You must respond STRICTLY with a JSON object in this format:
        {
            \"score\": 85, // out of 100
            \"letter_grade\": \"B\", // A+, A, B, C, etc.
            \"feedback_summary\": \"A brief 2-3 sentence overall summary of the paper's quality.\",
            \"grammar_syntax\": [
                \"Specific piece of advice about grammar or syntax\",
                \"Another grammar note\"
            ],
            \"argument_structure\": [
                \"Note on the thesis or argument flow\"
            ],
            \"actionable_tips\": [
                \"A tip the student can do right now to improve the grade\",
                \"Another concrete tip\"
            ]
        }";

        try {
            $response = $this->client->chat()->create([
                'model' => 'gpt-4o',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $text],
                ],
                // We strongly encourage the model to output valid JSON
                'response_format' => ['type' => 'json_object'],
            ]);

            $content = $response->choices[0]->message->content;

            $decoded = json_decode($content, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception("Invalid JSON returned from OpenAI: " . json_last_error_msg());
            }

            $decoded['error'] = false;
            return $decoded;

        } catch (\Exception $e) {
            Log::error("Paper grading failed: " . $e->getMessage());
            return [
                'error' => true,
                'message' => 'An error occurred while grading the paper. Please try again later.'
            ];
        }
    }
}
