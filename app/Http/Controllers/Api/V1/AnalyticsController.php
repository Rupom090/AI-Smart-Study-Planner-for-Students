<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\AnalyticsEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AnalyticsController extends BaseApiController
{
    /**
     * Track an analytics event
     */
    public function trackEvent(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'event' => 'required|string|max:255',
            'category' => 'nullable|string|max:255',
            'properties' => 'nullable|array',
            'page_url' => 'nullable|url',
            'referrer' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse(
                'Validation failed',
                422,
                $validator->errors()
            );
        }

        try {
            $event = AnalyticsEvent::create([
                'user_id' => $request->user()?->id,
                'session_id' => $request->session()->getId(),
                'event' => $request->event,
                'category' => $request->category,
                'properties' => $request->properties,
                'page_url' => $request->page_url ?? $request->headers->get('referer'),
                'referrer' => $request->referrer,
                'user_agent' => $request->userAgent(),
                'ip_address' => $request->ip(),
            ]);

            return $this->successResponse(
                ['event_id' => $event->id],
                'Event tracked successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to track event', 500);
        }
    }

    /**
     * Get analytics data (admin only)
     */
    public function getEvents(Request $request): JsonResponse
    {
        try {
            $query = AnalyticsEvent::query();

            if ($request->has('event')) {
                $query->where('event', $request->event);
            }

            if ($request->has('category')) {
                $query->where('category', $request->category);
            }

            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }

            if ($request->has('from_date')) {
                $query->where('created_at', '>=', $request->from_date);
            }

            if ($request->has('to_date')) {
                $query->where('created_at', '<=', $request->to_date);
            }

            $perPage = $request->input('per_page', 50);
            $events = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return $this->successResponse([
                'events' => $events->items(),
                'pagination' => [
                    'total' => $events->total(),
                    'per_page' => $events->perPage(),
                    'current_page' => $events->currentPage(),
                    'last_page' => $events->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch analytics', 500);
        }
    }
}
