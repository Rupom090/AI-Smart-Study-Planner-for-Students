<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\File;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PasteController extends BaseApiController
{
    /**
     * Save pasted text or link as a text file
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string|max:100000', // Limit to ~100KB of text
        ]);

        if ($validator->fails()) {
            return $this->errorResponse(
                'Validation failed',
                422,
                $validator->errors()
            );
        }

        try {
            $userId = $request->user()->id;
            $uniqueFilename = Str::uuid() . '.txt';
            $path = "uploads/{$userId}/documents";

            // Generate valid filename
            $safeTitle = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $request->title);
            $originalName = $safeTitle . '.txt';

            $content = $request->content;

            // Store file locally
            Storage::disk('public')->put($path . '/' . $uniqueFilename, $content);
            $storagePath = $path . '/' . $uniqueFilename;
            $url = Storage::url($storagePath);
            $size = strlen($content);

            $file = File::create([
                'user_id' => $userId,
                'filename' => $uniqueFilename,
                'original_name' => $originalName,
                'url' => $url,
                'storage_path' => $storagePath,
                'size' => $size,
                'mime_type' => 'text/plain',
                'file_type' => 'document',
                'cloud_public_id' => null,
                'metadata' => [
                    'extension' => 'txt',
                    'source' => 'paste',
                ],
            ]);

            return $this->successResponse([
                'file' => [
                    'id' => $file->id,
                    'filename' => $file->filename,
                    'original_name' => $file->original_name,
                    'url' => $file->url,
                    'size' => $file->size,
                    'formatted_size' => $file->formatted_size,
                    'mime_type' => $file->mime_type,
                    'file_type' => $file->file_type,
                    'metadata' => $file->metadata,
                    'created_at' => $file->created_at,
                ],
            ], 'Text saved successfully as a document', 201);

        } catch (\Exception $e) {
            return $this->errorResponse(
                'Failed to save text: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * Fetch the title from a given URL
     */
    public function fetchTitle(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|url|max:2048',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Invalid URL', 422);
        }

        try {
            $url = $request->input('url');

            // Set a user agent to avoid basic blocks
            $opts = [
                "http" => [
                    "method" => "GET",
                    "header" => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\r\n"
                ]
            ];
            $context = stream_context_create($opts);

            // Fetch only the first 8192 bytes to save time, usually enough for the <title>
            $html = @file_get_contents($url, false, $context, 0, 8192);

            $title = 'Document';

            if ($html !== false) {
                // Try to extract the title tag
                if (preg_match('/<title[^>]*>(.*?)<\/title>/ims', $html, $matches)) {
                    // Decode HTML entities
                    $title = html_entity_decode(trim($matches[1]), ENT_QUOTES | ENT_XML1, 'UTF-8');
                    // Remove any newlines or extra spaces
                    $title = preg_replace('/\s+/', ' ', $title);
                }
            }

            return $this->successResponse(['title' => $title], 'Title fetched');

        } catch (\Exception $e) {
            // Silently fail and return a fallback rather than throwing a hard error to the user
            return $this->successResponse(['title' => 'Document'], 'Title fetch failed');
        }
    }
}
