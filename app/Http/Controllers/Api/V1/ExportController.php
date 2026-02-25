<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\File;
use App\Models\Notification;
use App\Models\AnalyticsEvent;
use App\Services\ExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExportController extends BaseApiController
{
    protected ExportService $exportService;

    public function __construct(ExportService $exportService)
    {
        $this->exportService = $exportService;
    }

    /**
     * Export user's files
     */
    public function exportFiles(Request $request): JsonResponse
    {
        try {
            $format = $request->input('format', 'csv');
            
            $files = File::where('user_id', $request->user()->id)
                ->get()
                ->map(function ($file) {
                    return [
                        'filename' => $file->filename,
                        'original_name' => $file->original_name,
                        'size' => $file->formatted_size,
                        'type' => $file->file_type,
                        'url' => $file->url,
                        'created_at' => $file->created_at->toDateTimeString(),
                    ];
                });

            if ($format === 'json') {
                $url = $this->exportService->exportToJson(
                    collect($files),
                    'files_export_' . time() . '.json'
                );
            } else {
                $url = $this->exportService->exportArrayToCsv(
                    $files->toArray(),
                    'files_export_' . time() . '.csv'
                );
            }

            return $this->successResponse([
                'download_url' => $url,
                'format' => $format,
                'count' => $files->count(),
            ], 'Export generated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Export failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Export user's notifications
     */
    public function exportNotifications(Request $request): JsonResponse
    {
        try {
            $format = $request->input('format', 'csv');
            
            $notifications = Notification::where('user_id', $request->user()->id)
                ->get()
                ->map(function ($notification) {
                    return [
                        'type' => $notification->type,
                        'title' => $notification->title,
                        'message' => $notification->message,
                        'is_read' => $notification->is_read ? 'Yes' : 'No',
                        'created_at' => $notification->created_at->toDateTimeString(),
                    ];
                });

            if ($format === 'json') {
                $url = $this->exportService->exportToJson(
                    collect($notifications),
                    'notifications_export_' . time() . '.json'
                );
            } else {
                $url = $this->exportService->exportArrayToCsv(
                    $notifications->toArray(),
                    'notifications_export_' . time() . '.csv'
                );
            }

            return $this->successResponse([
                'download_url' => $url,
                'format' => $format,
                'count' => $notifications->count(),
            ], 'Export generated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Export failed', 500);
        }
    }

    /**
     * Export analytics events (admin only)
     */
    public function exportAnalytics(Request $request): JsonResponse
    {
        try {
            $format = $request->input('format', 'csv');
            $query = AnalyticsEvent::query();

            if ($request->has('from_date')) {
                $query->where('created_at', '>=', $request->from_date);
            }

            if ($request->has('to_date')) {
                $query->where('created_at', '<=', $request->to_date);
            }

            $events = $query->get()->map(function ($event) {
                return [
                    'event' => $event->event,
                    'category' => $event->category,
                    'user_id' => $event->user_id,
                    'page_url' => $event->page_url,
                    'created_at' => $event->created_at->toDateTimeString(),
                ];
            });

            if ($format === 'json') {
                $url = $this->exportService->exportToJson(
                    collect($events),
                    'analytics_export_' . time() . '.json'
                );
            } else {
                $url = $this->exportService->exportArrayToCsv(
                    $events->toArray(),
                    'analytics_export_' . time() . '.csv'
                );
            }

            return $this->successResponse([
                'download_url' => $url,
                'format' => $format,
                'count' => $events->count(),
            ], 'Export generated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Export failed', 500);
        }
    }
}
