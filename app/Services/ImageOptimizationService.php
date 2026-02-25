<?php

namespace App\Services;

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageOptimizationService
{
    protected ?ImageManager $manager = null;

    protected const SIZES = [
        'thumbnail' => ['width' => 200, 'height' => 200, 'crop' => true],
        'medium' => ['width' => 800, 'height' => 800, 'crop' => false],
        'large' => ['width' => 1200, 'height' => 1200, 'crop' => false],
    ];

    protected const QUALITY = 80;

    protected function getManager(): ImageManager
    {
        if (!$this->manager) {
            $this->manager = new ImageManager(new Driver());
        }
        return $this->manager;
    }

    /**
     * Optimize and create multiple sizes of an image
     */
    public function optimizeImage(UploadedFile $file, string $folder = 'images'): array
    {
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $uniqueId = Str::uuid();
        $urls = [];

        // Process each size
        foreach (self::SIZES as $sizeName => $dimensions) {
            $filename = "{$uniqueId}_{$sizeName}.webp";
            $path = "{$folder}/{$filename}";

            $image = $this->getManager()->read($file->getRealPath());

            if ($dimensions['crop']) {
                // Square crop for thumbnail
                $image->cover($dimensions['width'], $dimensions['height']);
            } else {
                // Maintain aspect ratio, max dimensions
                $image->scale(
                    width: $dimensions['width'],
                    height: $dimensions['height']
                );
            }

            // Convert to WebP and compress
            $encoded = $image->toWebp(quality: self::QUALITY);

            // Save to storage
            Storage::disk('public')->put($path, (string) $encoded);

            $urls[$sizeName] = Storage::url($path);
        }

        // Get original dimensions
        $originalImage = $this->getManager()->read($file->getRealPath());

        return [
            'urls' => $urls,
            'original_name' => $file->getClientOriginalName(),
            'dimensions' => [
                'width' => $originalImage->width(),
                'height' => $originalImage->height(),
            ],
        ];
    }

    /**
     * Optimize single image to specific size
     */
    public function optimizeSingleSize(
        UploadedFile $file,
        int $maxWidth,
        int $maxHeight,
        bool $crop = false,
        string $folder = 'images'
    ): array {
        $uniqueId = Str::uuid();
        $filename = "{$uniqueId}.webp";
        $path = "{$folder}/{$filename}";

        $image = $this->getManager()->read($file->getRealPath());

        if ($crop) {
            $image->cover($maxWidth, $maxHeight);
        } else {
            $image->scale(width: $maxWidth, height: $maxHeight);
        }

        $encoded = $image->toWebp(quality: self::QUALITY);
        Storage::disk('public')->put($path, (string) $encoded);

        return [
            'url' => Storage::url($path),
            'path' => $path,
            'width' => $image->width(),
            'height' => $image->height(),
        ];
    }

    /**
     * Create avatar from uploaded image
     */
    public function createAvatar(UploadedFile $file): array
    {
        $uniqueId = Str::uuid();
        $urls = [];

        // Create two sizes for avatar
        $sizes = [
            'small' => 50,
            'medium' => 150,
            'large' => 300,
        ];

        foreach ($sizes as $sizeName => $dimension) {
            $filename = "{$uniqueId}_avatar_{$sizeName}.webp";
            $path = "avatars/{$filename}";

            $image = $this->getManager()->read($file->getRealPath());
            $image->cover($dimension, $dimension);
            $encoded = $image->toWebp(quality: 85);

            Storage::disk('public')->put($path, (string) $encoded);
            $urls[$sizeName] = Storage::url($path);
        }

        return [
            'urls' => $urls,
            'primary_url' => $urls['medium'],
        ];
    }

    /**
     * Delete all sizes of an image
     */
    public function deleteImageSizes(string $uniqueId, string $folder = 'images'): void
    {
        foreach (array_keys(self::SIZES) as $sizeName) {
            $path = "{$folder}/{$uniqueId}_{$sizeName}.webp";
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Generate responsive image srcset string
     */
    public function generateSrcSet(array $urls): string
    {
        $srcset = [];

        if (isset($urls['thumbnail'])) {
            $srcset[] = $urls['thumbnail'] . ' 200w';
        }
        if (isset($urls['medium'])) {
            $srcset[] = $urls['medium'] . ' 800w';
        }
        if (isset($urls['large'])) {
            $srcset[] = $urls['large'] . ' 1200w';
        }

        return implode(', ', $srcset);
    }
}
