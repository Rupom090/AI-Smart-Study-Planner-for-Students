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
}
