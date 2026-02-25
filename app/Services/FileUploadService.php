<?php

namespace App\Services;

use App\Models\File;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadService
{
    protected ImageOptimizationService $imageOptimizer;

    public function __construct(ImageOptimizationService $imageOptimizer)
    {
        $this->imageOptimizer = $imageOptimizer;
    }

    protected const MAX_FILE_SIZE = 10485760; // 10MB in bytes
    
    protected const ALLOWED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    protected const ALLOWED_DOCUMENT_TYPES = ['pdf'];
    
    protected const ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
    ];

    /**
     * Upload file to Cloudinary or local storage
     */
    public function uploadFile(UploadedFile $file, string $userId, bool $useCloudinary = true, bool $optimizeImage = true): File
    {
        // Validate file
        $this->validateFile($file);

        // Determine file type
        $fileType = $this->determineFileType($file);

        // Optimize images if enabled
        if ($optimizeImage && $fileType === 'image') {
            return $this->uploadOptimizedImage($file, $userId, $useCloudinary);
        }

        // Generate unique filename
        $uniqueFilename = $this->generateUniqueFilename($file);

        if ($useCloudinary && $this->isCloudinaryConfigured()) {
            return $this->uploadToCloudinary($file, $userId, $fileType, $uniqueFilename);
        }

        return $this->uploadToLocal($file, $userId, $fileType, $uniqueFilename);
    }

    /**
     * Upload and optimize image
     */
    protected function uploadOptimizedImage(UploadedFile $file, string $userId, bool $useCloudinary): File
    {
        $optimized = $this->imageOptimizer->optimizeImage($file, "uploads/{$userId}/images");
        
        return File::create([
            'user_id' => $userId,
            'filename' => basename($optimized['urls']['large']),
            'original_name' => $optimized['original_name'],
            'url' => $optimized['urls']['large'],
            'storage_path' => null,
            'size' => $file->getSize(),
            'mime_type' => 'image/webp',
            'file_type' => 'image',
            'cloud_public_id' => null,
            'metadata' => [
                'optimized' => true,
                'sizes' => $optimized['urls'],
                'srcset' => $this->imageOptimizer->generateSrcSet($optimized['urls']),
                'original_dimensions' => $optimized['dimensions'],
            ],
        ]);
    }

    /**
     * Upload file to Cloudinary
     */
    protected function uploadToCloudinary(UploadedFile $file, string $userId, string $fileType, string $uniqueFilename): File
    {
        $folder = "ai-agent/{$userId}/{$fileType}s";
        
        $uploadedFileUrl = Cloudinary::upload($file->getRealPath(), [
            'folder' => $folder,
            'public_id' => pathinfo($uniqueFilename, PATHINFO_FILENAME),
            'resource_type' => $fileType === 'image' ? 'image' : 'raw',
        ]);

        return File::create([
            'user_id' => $userId,
            'filename' => $uniqueFilename,
            'original_name' => $file->getClientOriginalName(),
            'url' => $uploadedFileUrl->getSecurePath(),
            'storage_path' => null,
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'file_type' => $fileType,
            'cloud_public_id' => $uploadedFileUrl->getPublicId(),
            'metadata' => [
                'width' => $uploadedFileUrl->getWidth() ?? null,
                'height' => $uploadedFileUrl->getHeight() ?? null,
                'format' => $uploadedFileUrl->getExtension(),
            ],
        ]);
    }

    /**
     * Upload file to local storage
     */
    protected function uploadToLocal(UploadedFile $file, string $userId, string $fileType, string $uniqueFilename): File
    {
        $path = "uploads/{$userId}/{$fileType}s";
        $storagePath = $file->storeAs($path, $uniqueFilename, 'public');
        $url = Storage::url($storagePath);

        return File::create([
            'user_id' => $userId,
            'filename' => $uniqueFilename,
            'original_name' => $file->getClientOriginalName(),
            'url' => $url,
            'storage_path' => $storagePath,
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'file_type' => $fileType,
            'cloud_public_id' => null,
            'metadata' => $this->extractMetadata($file),
        ]);
    }

    /**
     * Validate uploaded file
     */
    protected function validateFile(UploadedFile $file): void
    {
        // Check file size
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw new \InvalidArgumentException('File size exceeds maximum allowed size of 10MB');
        }

        // Check mime type
        if (!in_array($file->getMimeType(), self::ALLOWED_MIME_TYPES)) {
            throw new \InvalidArgumentException('File type not allowed');
        }

        // Check extension
        $extension = strtolower($file->getClientOriginalExtension());
        $allowedExtensions = array_merge(self::ALLOWED_IMAGE_TYPES, self::ALLOWED_DOCUMENT_TYPES);
        
        if (!in_array($extension, $allowedExtensions)) {
            throw new \InvalidArgumentException('File extension not allowed');
        }
    }

    /**
     * Determine file type (image or document)
     */
    protected function determineFileType(UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension());
        
        if (in_array($extension, self::ALLOWED_IMAGE_TYPES)) {
            return 'image';
        }
        
        if (in_array($extension, self::ALLOWED_DOCUMENT_TYPES)) {
            return 'document';
        }
        
        return 'file';
    }

    /**
     * Generate unique filename
     */
    protected function generateUniqueFilename(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        return Str::uuid() . '.' . $extension;
    }

    /**
     * Extract file metadata
     */
    protected function extractMetadata(UploadedFile $file): array
    {
        $metadata = [
            'extension' => $file->getClientOriginalExtension(),
        ];

        // Extract image dimensions if it's an image
        if (str_starts_with($file->getMimeType(), 'image/')) {
            $imageInfo = getimagesize($file->getRealPath());
            if ($imageInfo) {
                $metadata['width'] = $imageInfo[0];
                $metadata['height'] = $imageInfo[1];
            }
        }

        return $metadata;
    }

    /**
     * Check if Cloudinary is configured
     */
    protected function isCloudinaryConfigured(): bool
    {
        return !empty(env('CLOUDINARY_CLOUD_NAME')) 
            && !empty(env('CLOUDINARY_API_KEY')) 
            && !empty(env('CLOUDINARY_API_SECRET'));
    }

    /**
     * Delete file
     */
    public function deleteFile(File $file): bool
    {
        try {
            if ($file->cloud_public_id) {
                // Delete from Cloudinary
                Cloudinary::destroy($file->cloud_public_id);
            } elseif ($file->storage_path) {
                // Delete from local storage
                Storage::disk('public')->delete($file->storage_path);
            }

            return $file->delete();
        } catch (\Exception $e) {
            return false;
        }
    }
}
