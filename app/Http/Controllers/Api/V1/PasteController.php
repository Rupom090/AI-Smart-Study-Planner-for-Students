<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\File;
use App\Models\StudyMaterial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Throwable;

class PasteController extends BaseApiController
{
    /**
     * Download HTML from a URL with resilient fallbacks.
     */
    private function downloadHtml(string $url, int $timeoutSeconds = 8, int $maxBytes = 61440): ?string
    {
        $headers = [
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
            'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language' => 'en-US,en;q=0.9',
        ];

        try {
            $response = Http::withHeaders($headers)
                ->timeout($timeoutSeconds)
                ->withOptions(['allow_redirects' => true])
                ->get($url);

            $body = (string) $response->body();
            if ($body !== '') {
                return mb_substr($body, 0, $maxBytes);
            }
        } catch (Throwable $e) {
            Log::info('downloadHtml primary fetch failed', ['url' => $url, 'error' => $e->getMessage()]);
        }

        if (app()->environment('local', 'testing')) {
            try {
                $response = Http::withoutVerifying()
                    ->withHeaders($headers)
                    ->timeout($timeoutSeconds)
                    ->withOptions(['allow_redirects' => true])
                    ->get($url);

                $body = (string) $response->body();
                if ($body !== '') {
                    return mb_substr($body, 0, $maxBytes);
                }
            } catch (Throwable $e) {
                Log::info('downloadHtml insecure fallback failed', ['url' => $url, 'error' => $e->getMessage()]);
            }
        }

        try {
            $opts = [
                'http' => [
                    'method' => 'GET',
                    'header' => "User-Agent: Mozilla/5.0\r\nAccept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\n",
                    'timeout' => $timeoutSeconds,
                    'ignore_errors' => true,
                ],
                'ssl' => [
                    'verify_peer' => !app()->environment('local', 'testing'),
                    'verify_peer_name' => !app()->environment('local', 'testing'),
                ],
            ];

            $context = stream_context_create($opts);
            $html = @file_get_contents($url, false, $context, 0, $maxBytes);

            return $html !== false ? $html : null;
        } catch (Throwable $e) {
            Log::warning('downloadHtml final fallback failed', ['url' => $url, 'error' => $e->getMessage()]);
            return null;
        }
    }

    /**
     * Save pasted text or link as a text file
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title'   => 'required|string|max:255',
            'content' => 'required|string|max:100000',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        try {
            $userId   = $request->user()->id;
            $content  = $request->input('content');
            $safeTitle = Str::limit(preg_replace('/[^a-zA-Z0-9_\-\s]/', '_', $request->input('title')), 200);
            $safeTitle = preg_replace('/\s+/', '_', trim($safeTitle));

            $uniqueFilename = Str::uuid() . '.txt';
            $storagePath    = "uploads/{$userId}/documents/{$uniqueFilename}";

            // Wrap in a transaction so we never have an orphaned File without a StudyMaterial
            $result = DB::transaction(function () use ($userId, $content, $safeTitle, $uniqueFilename, $storagePath, $request) {
                Storage::disk('public')->put($storagePath, $content);

                $file = File::create([
                    'user_id'        => $userId,
                    'filename'       => $uniqueFilename,
                    'original_name'  => $safeTitle . '.txt',
                    'url'            => Storage::url($storagePath),
                    'storage_path'   => $storagePath,
                    'size'           => mb_strlen($content, '8bit'), // byte length, not char count
                    'mime_type'      => 'text/plain',
                    'file_type'      => 'document',
                    'cloud_public_id'=> null,
                    'metadata'       => ['extension' => 'txt', 'source' => 'paste'],
                ]);

                StudyMaterial::create([
                    'user_id'           => $userId,
                    'file_id'           => $file->id,
                    'title'             => $request->input('title'),
                    'document_type'     => 'document',
                    'content_extracted' => $content,
                    'status'            => 'completed',
                ]);

                return $file;
            });

            return $this->successResponse([
                'file' => [
                    'id'             => $result->id,
                    'filename'       => $result->filename,
                    'original_name'  => $result->original_name,
                    'url'            => $result->url,
                    'size'           => $result->size,
                    'formatted_size' => $result->formatted_size,
                    'mime_type'      => $result->mime_type,
                    'file_type'      => $result->file_type,
                    'metadata'       => $result->metadata,
                    'created_at'     => $result->created_at,
                ],
            ], 'Text saved successfully as a document', 201);

        } catch (\Exception $e) {
            Log::error('PasteController::store failed', ['error' => $e->getMessage(), 'user' => $request->user()?->id]);
            return $this->errorResponse('Failed to save text: ' . $e->getMessage(), 500);
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
            $url  = $request->input('url');
            $html = $this->downloadHtml($url, 6, 8192);
            $title   = 'Document';

            if (!empty($html) && preg_match('/<title[^>]*>(.*?)<\/title>/ims', $html, $m)) {
                $title = html_entity_decode(trim(preg_replace('/\s+/', ' ', $m[1])), ENT_QUOTES | ENT_XML1, 'UTF-8');
                $title = Str::limit($title, 200); // guard against absurdly long titles
            }

            return $this->successResponse(['title' => $title], 'Title fetched');

        } catch (\Exception $e) {
            Log::warning('fetchTitle failed', ['url' => $request->input('url'), 'error' => $e->getMessage()]);
            return $this->successResponse(['title' => 'Document'], 'Title fetch failed');
        }
    }

    /**
     * Fetch the readable text content from a URL so the frontend can pass it to Grok.
     * Grok cannot browse URLs itself — this endpoint scrapes and strips the HTML,
     * returning up to 4 000 characters of plain text.
     */
    public function fetchContent(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|url|max:2048',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Invalid URL', 422);
        }

        try {
            $url  = $request->input('url');
            $html = $this->downloadHtml($url, 8, 61440);

            if (empty($html)) {
                return $this->successResponse(['text' => '', 'title' => 'Document'], 'Could not fetch URL');
            }

            // Extract title
            $title = 'Document';
            if (preg_match('/<title[^>]*>(.*?)<\/title>/ims', $html, $m)) {
                $title = html_entity_decode(
                    trim(preg_replace('/\s+/', ' ', $m[1])),
                    ENT_QUOTES | ENT_XML1,
                    'UTF-8'
                );
                $title = Str::limit($title, 200);
            }

            // Remove noisy tags: scripts, styles, navigation chrome
            $html = preg_replace('/<(script|style|nav|footer|header|aside|noscript)[^>]*>.*?<\/\1>/ims', '', $html);

            // Strip remaining HTML tags and decode entities
            $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_XML1, 'UTF-8');

            // Normalize whitespace
            $text = preg_replace('/[ \t]+/', ' ', $text);
            $text = preg_replace('/\n{3,}/', "\n\n", $text);
            $text = trim($text);

            // Trim to 4 000 chars so Grok context stays within free-tier limits
            if (mb_strlen($text) > 4000) {
                $text = mb_substr($text, 0, 4000) . '...';
            }

            return $this->successResponse(['text' => $text, 'title' => $title], 'Content fetched');

        } catch (\Exception $e) {
            Log::warning('fetchContent failed', ['url' => $request->input('url'), 'error' => $e->getMessage()]);
            return $this->successResponse(['text' => '', 'title' => 'Document'], 'Content fetch failed');
        }
    }
}
