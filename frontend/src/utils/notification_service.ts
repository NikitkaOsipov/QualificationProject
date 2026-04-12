import axios from '@/lib/axios';
import { AppNotification, NotificationPreference, NotificationType } from '@/utils/Types';

interface NotificationListResponse {
    status: string;
    data: {
        data: AppNotification[];
        current_page: number;
        last_page: number;
    };
    meta: {
        unread_count: number;
    };
}

interface NotificationPreferencesResponse {
    status: string;
    data: NotificationPreference[];
}

interface NotificationStatusResponse {
    status: string;
    message?: string;
}

export const getNotifications = (page = 1, perPage = 10): Promise<NotificationListResponse> =>
    axios.get('/api/notifications', {
        params: {
            page,
            per_page: perPage,
        },
    }).then((r) => r.data as NotificationListResponse);

export const markNotificationAsRead = (notificationId: string) =>
    axios.patch(`/api/notifications/${notificationId}/read`).then((r) => r.data as NotificationStatusResponse);

export const markAllNotificationsAsRead = () =>
    axios.patch('/api/notifications/read-all').then((r) => r.data as NotificationStatusResponse);

export const deleteNotification = (notificationId: string) =>
    axios.delete(`/api/notifications/${notificationId}`).then((r) => r.data as NotificationStatusResponse);

export const deleteAllNotifications = () =>
    axios.delete('/api/notifications').then((r) => r.data as NotificationStatusResponse);