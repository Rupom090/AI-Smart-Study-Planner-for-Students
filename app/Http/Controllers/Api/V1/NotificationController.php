<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotificationController extends BaseApiController
{
    /**
     * Get user's notifications
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->input('per_page', 20);
            $unreadOnly = $request->boolean('unread_only', false);

            $query = Notification::where('user_id', $request->user()->id);

            if ($unreadOnly) {
                $query->unread();
            }

            $notifications = $query->orderBy('created_at', 'desc')
                ->paginate($perPage);

            $unreadCount = Notification::where('user_id', $request->user()->id)
                ->unread()
                ->count();

            return $this->successResponse([
                'notifications' => $notifications->items(),
                'unread_count' => $unreadCount,
                'pagination' => [
                    'total' => $notifications->total(),
                    'per_page' => $notifications->perPage(),
                    'current_page' => $notifications->currentPage(),
                    'last_page' => $notifications->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch notifications', 500);
        }
    }

    /**
     * Create a notification (for testing)
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:info,success,warning,error',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'action_url' => 'nullable|url',
            'data' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse(
                'Validation failed',
                422,
                $validator->errors()
            );
        }

        try {
            $notification = Notification::create([
                'user_id' => $request->user()->id,
                'type' => $request->type,
                'title' => $request->title,
                'message' => $request->message,
                'action_url' => $request->action_url,
                'data' => $request->data,
            ]);

            \App\Events\NotificationCreated::dispatch($notification);

            return $this->successResponse(
                ['notification' => $notification],
                'Notification created successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create notification', 500);
        }
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        try {
            $notification = Notification::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            $notification->markAsRead();

            return $this->successResponse(
                ['notification' => $notification],
                'Notification marked as read'
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Notification not found', 404);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to mark notification as read', 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        try {
            $updated = Notification::where('user_id', $request->user()->id)
                ->unread()
                ->update([
                    'is_read' => true,
                    'read_at' => now(),
                ]);

            return $this->successResponse(
                ['updated_count' => $updated],
                'All notifications marked as read'
            );
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to mark notifications as read', 500);
        }
    }

    /**
     * Delete a notification
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $notification = Notification::where('id', $id)
                ->where('user_id', $request->user()->id)
                ->firstOrFail();

            $notification->delete();

            return $this->successResponse(null, 'Notification deleted successfully');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Notification not found', 404);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete notification', 500);
        }
    }

    /**
     * Get unread count
     */
    public function getUnreadCount(Request $request): JsonResponse
    {
        try {
            $count = Notification::where('user_id', $request->user()->id)
                ->unread()
                ->count();

            return $this->successResponse(['unread_count' => $count]);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to get unread count', 500);
        }
    }
}
