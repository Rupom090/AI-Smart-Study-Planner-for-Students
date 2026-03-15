<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use OpenAI;
use App\Models\File;

class AudioController extends BaseApiController
{
    /**
     * Handle incoming voice recordings and transcribe them to text files.
     */
    public function transcribe(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'audio' => 'required|file|mimes:webm,mpga,wav,mp3,m4a,ogg,flac|max:20480', // max 20MB
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation error', 422, $validator->errors());
        }

        try {
            $uploadedFile = $request->file('audio');
            $originalName = 'Recording_' . now()->format('Ymd_His');

            // Save temporarily to pass to OpenAI
            $tempPath = $uploadedFile->storeAs('temp', $originalName . '.' . $uploadedFile->getClientOriginalExtension());
            $absolutePath = storage_path('app/' . $tempPath);

            $apiKey = config('services.openai.key');
            if (!$apiKey) {
                return $this->errorResponse('OpenAI API key is missing.', 500);
            }
            $client = OpenAI::client($apiKey);

            // Transcribe using Whisper
            $response = $client->audio()->transcribe([
                'model' => 'whisper-1',
                'file' => fopen($absolutePath, 'r'),
                'response_format' => 'text',
            ]);

            $transcribedText = $response->text;

            // Delete temporary audio file
            Storage::delete($tempPath);

            // If empty
            if (empty(trim($transcribedText))) {
                return $this->errorResponse('No speech could be detected in the recording.', 400);
            }

            // Save the transcription as a text document in the user's files
            $fileName = $originalName . '.txt';
            $filePath = 'uploads/' . auth()->id() . '/' . $fileName;

            Storage::disk('local')->put($filePath, $transcribedText);

            $fileModel = File::create([
                'user_id' => auth()->id(),
                'original_name' => $fileName,
                'path' => $filePath,
                'mime_type' => 'text/plain',
                'size' => strlen($transcribedText),
            ]);

            return $this->successResponse([
                'file_id' => $fileModel->id,
                'title' => $originalName,
                'text_preview' => substr($transcribedText, 0, 100) . (strlen($transcribedText) > 100 ? '...' : '')
            ], 'Audio transcribed and saved successfully!');

        } catch (\Exception $e) {
            \Log::error('Audio Transcription Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to transcribe audio. Please try again.', 500, current(array($e->getMessage())));
        }
    }
}
