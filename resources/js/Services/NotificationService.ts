import axios from 'axios';

export interface NotificationData {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    data?: Record<string, any>;
    action_url?: string;
    is_read: boolean;
    read_at?: string;
    created_at: string;
}

export interface NotificationListResponse {
    success: boolean;
    data: {
        notifications: NotificationData[];
        unread_count: number;
        pagination: {
            total: number;
            per_page: number;
            current_page: number;
            last_page: number;
        };
    };
}

class NotificationService {
    private static readonly API_URL = '/api/v1/notifications';

    /**
     * Get user's notifications
     */
    static async getNotifications(
        page: number = 1,
        unreadOnly: boolean = false
    ): Promise<NotificationListResponse['data']> {
        try {
            const response = await axios.get<NotificationListResponse>(this.API_URL, {
                params: {
                    page,
                    unread_only: unreadOnly ? 1 : 0,
                },
            });
            return response.data.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
        }
    }

    /**
     * Get unread count
     */
    static async getUnreadCount(): Promise<number> {
        try {
            const response = await axios.get(`${this.API_URL}/unread-count`);
            return response.data.data.unread_count;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to get unread count');
        }
    }

    /**
     * Mark notification as read
     */
    static async markAsRead(id: string): Promise<void> {
        try {
            await axios.patch(`${this.API_URL}/${id}/read`);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to mark as read');
        }
    }

    /**
     * Mark all notifications as read
     */
    static async markAllAsRead(): Promise<number> {
        try {
            const response = await axios.patch(`${this.API_URL}/mark-all-read`);
            return response.data.data.updated_count;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to mark all as read');
        }
    }

    /**
     * Delete notification
     */
    static async deleteNotification(id: string): Promise<void> {
        try {
            await axios.delete(`${this.API_URL}/${id}`);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to delete notification');
        }
    }

    /**
     * Create notification (for testing)
     */
    static async createNotification(
        type: 'info' | 'success' | 'warning' | 'error',
        title: string,
        message: string,
        actionUrl?: string,
        data?: Record<string, any>
    ): Promise<NotificationData> {
        try {
            const response = await axios.post(this.API_URL, {
                type,
                title,
                message,
                action_url: actionUrl,
                data,
            });
            return response.data.data.notification;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to create notification');
        }
    }
}

export default NotificationService;
