import axios from '@/lib/axios';
import { AppNotification, NotificationPreference, NotificationType } from '@/utils/Types';
import { LaravelStatusResponse } from '@/utils/response_helper'

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

interface NotificationPreferenceUpdatePayload {
    in_app_enabled?: boolean;
    email_enabled?: boolean;
}

export const getNotifications = (page = 1, perPage = 10): Promise<NotificationListResponse> =>
    axios.get('/api/notifications', {
        params: {
            page,
            per_page: perPage,
        },
    }).then((r) => r.data as NotificationListResponse);

export const markNotificationAsRead = (notificationId: string) =>
    axios.patch(`/api/notifications/${notificationId}/read`).then((r) => r.data as LaravelStatusResponse);

export const markAllNotificationsAsRead = () =>
    axios.patch('/api/notifications/read-all').then((r) => r.data as LaravelStatusResponse);

export const deleteNotification = (notificationId: string) =>
    axios.delete(`/api/notifications/${notificationId}`).then((r) => r.data as LaravelStatusResponse);

export const deleteAllNotifications = () =>
    axios.delete('/api/notifications').then((r) => r.data as LaravelStatusResponse);

export const getNotificationPreferences = () =>
    axios.get('/api/notification-preferences').then((r) => r.data as NotificationPreference[]);

export const updateNotificationPreference = (
    type: NotificationType,
    payload: NotificationPreferenceUpdatePayload,
) =>
    axios.put(`/api/notification-preferences/${type}`, payload).then((r) => r.data as LaravelStatusResponse);