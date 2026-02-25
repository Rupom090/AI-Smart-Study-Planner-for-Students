<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cloudinary Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your Cloudinary settings. All settings are
    | prefixed with 'CLOUDINARY_' for clarity.
    |
    */

    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
    'api_key' => env('CLOUDINARY_API_KEY'),
    'api_secret' => env('CLOUDINARY_API_SECRET'),
    'url' => env('CLOUDINARY_URL'),

    /*
    |--------------------------------------------------------------------------
    | Upload Preset
    |--------------------------------------------------------------------------
    |
    | Upload presets enable you to define the default behavior for your
    | uploads without having to specify them each time.
    |
    */
    'upload_preset' => env('CLOUDINARY_UPLOAD_PRESET'),

    /*
    |--------------------------------------------------------------------------
    | Secure Distribution
    |--------------------------------------------------------------------------
    |
    | Whether to force HTTPS URLs.
    |
    */
    'secure' => env('CLOUDINARY_SECURE_DISTRIBUTION', true),

];
