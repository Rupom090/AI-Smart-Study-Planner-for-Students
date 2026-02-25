<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\File;
use App\Services\FileUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FileUploadController extends BaseApiController
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }

    /**
     * Upload a file
     */
    public function upload(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240|mimes:jpg,jpeg,png,gif,webp,pdf',
            'use_cloudinary' => 'boolean',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse(
                'Validation failed', 
                422, 
                $validator->errors()
            );
        }

        try {
            $useCloudinary = $request->input('use_cloudinary', true);
            $file = $this->fileUploadService->uploadFile(
                $request->file('file'),
                $request->user()->id,
                $useCloudinary
            );

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
            ], 'File uploaded successfully', 201);
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        } catch (\Exception $e) {
            return $this->errorResponse(
                'File upload failed: ' . $e->getMessage(), 
                500
            );
        }
    }

    /**
     * Upload multiple files
     */
    public function uploadMultiple(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'files' => 'required|array|max:5',
            'files.*' => 'file|max:10240|mimes:jpg,jpeg,png,gif,webp,pdf',
            'use_cloudinary' => 'boolean',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse(
                'Validation failed', 
                422, 
                $validator->errors()
            );
        }

        try {
            $useCloudinary = $request->input('use_cloudinary', true);
            $uploadedFiles = [];
            $errors = [];

            foreach ($request->file('files') as $index => $file) {
                try {
                    $uploadedFile = $this->fileUploadService->uploadFile(
                        $file,
                        $request->user()->id,
                        $useCloudinary
                    );

                    $uploadedFiles[] = [
                        'id' => $uploadedFile->id,
                        'filename' => $uploadedFile->filename,
                        'original_name' => $uploadedFile->original_name,
                        'url' => $uploadedFile->url,
                        'size' => $uploadedFile->size,
                        'formatted_size' => $uploadedFile->formatted_size,
                        'mime_type' => $uploadedFile->mime_type,
                        'file_type' => $uploadedFile->file_type,
                        'metadata' => $uploadedFile->metadata,
                        'created_at' => $uploadedFile->created_at,
                    ];
                } catch (\Exception $e) {
                    $errors[] = [
                        'file_index' => $index,
                        'filename' => $file->getClientOriginalName(),
                        'error' => $e->getMessage(),
                    ];
                }
            }

            return $this->successResponse([
                'uploaded' => $uploadedFiles,
                'failed' => $errors,
                'total' => count($request->file('files')),
                'successful' => count($uploadedFiles),
            ], 'Files upload completed', 201);
        } catch (\Exception $e) {
            return $this->errorResponse('File upload failed', 500);
        }
    }

    /**
     * Get user's files
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->input('per_page', 15);
            $fileType = $request->input('file_type');

            $query = File::where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc');

            if ($fileType) {
                $query->where('file_type', $fileType);
            }

            $files = $query->paginate($perPage);

            return $this->successResponse([
                'files' => $files->items(),
                'pagination' => [
                    'total' => $files->total(),
                    'per_page' => $files->perPage(),
                    'current_page' => $files->currentPage(),
                    'last_page' => $files->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch files', 500);
        }
    }

    /**
     * Get a specific file
     */
    public function show(Request $request, string $id): JsonResponse
    {
        try {
            $file = File::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            return $this->successResponse(['file' => $file]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('File not found', 404);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch file', 500);
        }
    }

    /**
     * Delete a file
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $file = File::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            $deleted = $this->fileUploadService->deleteFile($file);

            if ($deleted) {
                return $this->successResponse(null, 'File deleted successfully');
            }

            return $this->errorResponse('Failed to delete file', 500);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('File not found', 404);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete file', 500);
        }
    }
}
