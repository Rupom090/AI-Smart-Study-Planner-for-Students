<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;

use App\Models\File;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class FileServeController extends Controller
{
    /**
     * Stream file for viewing in iframe/browser
     */
    public function show(File $file): StreamedResponse|string
    {
        // Verify user owns this file
        if ($file->user_id !== auth()->id()) {
            abort(403, 'Unauthorized to access this file');
        }

        // If it's a Cloudinary URL, redirect to it
        if ($file->cloud_public_id) {
            return redirect($file->url);
        }

        // For local files
        if ($file->storage_path && Storage::disk('public')->exists($file->storage_path)) {
            return Storage::disk('public')->response(
                $file->storage_path,
                $file->original_name,
                [
                    'Content-Type' => $file->mime_type,
                    'Content-Disposition' => 'inline; filename="' . $file->original_name . '"',
                ]
            );
        }

        abort(404, 'File not found or no longer available');
    }

    /**
     * Download file
     */
    public function download(File $file)
    {
        // Verify user owns this file
        if ($file->user_id !== auth()->id()) {
            abort(403, 'Unauthorized to access this file');
        }

        // If it's a Cloudinary URL, redirect to it
        if ($file->cloud_public_id) {
            return redirect($file->url);
        }

        // For local files
        if ($file->storage_path && Storage::disk('public')->exists($file->storage_path)) {
            return Storage::disk('public')->download($file->storage_path, $file->original_name);
        }

        abort(404, 'File not found or no longer available');
    }
}
