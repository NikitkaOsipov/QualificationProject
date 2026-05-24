import { useContext, useEffect, useMemo, useState } from 'react'
import { AppNotification } from '@/utils/Types';
import NotificationItem from '@/components/NotificationItem';
import {
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    deleteNotification,
    deleteAllNotifications,
} from '@/utils/notification_service';
import { configureAppEcho, getEcho } from '@/lib/echo';
import ResponsiveOverlayPanel from '@/components/ResponsiveOverlayPanel';
import { SnackbarContext } from '@/context/SnackbarContext';
import { extractErrorMessage } from '@/utils/response_helper';

interface Props {
    user: { id: number | string } | null | undefined;
}

const MAX_VISIBLE_NOTIFICATIONS = 8;
const MAX_BUFFERED_NOTIFICATIONS = 50;

const Notifications = ({ user }: Props) => {
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const addSnackbarMessage = useContext(SnackbarContext);

    const latestNotifications = useMemo(
        () => notifications.slice(0, MAX_VISIBLE_NOTIFICATIONS),
        [notifications],
    );

    const mapNotification = (payload: any): AppNotification => {
        const timestamp = payload.created_at ?? new Date().toISOString();

        return {
            id: String(payload.id),
            read_at: payload.read_at ?? null,
            created_at: timestamp,
            data: payload.data,
        };
    };

    // Fetches notifications if user is logged in
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        let isActive = true;

        getNotifications(1, 20)
            .then((response) => {
                if (!isActive) {
                    return;
                }

                setNotifications(response.data.data.slice(0, MAX_BUFFERED_NOTIFICATIONS));
                setUnreadCount(response.meta.unread_count);
            })
            .catch(() => {
                if (!isActive) {
                    return;
                }

                setNotifications([]);
                setUnreadCount(0);
            });

        return () => {
            isActive = false;
        };
    }, [user?.id]);

    // Sets up Echo listener for real-time notifications.
    useEffect(() => {
        if (!user) {
            return;
        }

        // Prevents stale async flow from updating state after unmount or user switch.
        let isActive = true;
        const channelName = `App.Models.User.${user.id}`;

        void (async () => {
            await configureAppEcho();

            if (!isActive) {
                return;
            }

            const echo = getEcho();

            if (!echo) {
                return;
            }

            echo.private(channelName).notification((incoming: any) => {
                const mapped = mapNotification(incoming);

                setNotifications((prev) =>
                    [mapped, ...prev.filter((item) => item.id !== mapped.id)].slice(0, MAX_BUFFERED_NOTIFICATIONS),
                );
                setUnreadCount((prev) => prev + 1);
            });
        })();

        return () => {
            isActive = false;
            const echo = getEcho();
            echo?.leave(channelName);
        };
    }, [user?.id]);

    const handleNotificationClick = async (notificationId: string) => {
        const target = notifications.find((item) => item.id === notificationId);

        if (!target || target.read_at) {
            return;
        }

        await markNotificationAsRead(notificationId);

        setNotifications((prev) =>
            prev.map((item) =>
                item.id === notificationId ? { ...item, read_at: new Date().toISOString() } : item,
            ),
        );
        setUnreadCount((prev) => Math.max(prev - 1, 0));
    };

    const handleReadAll = async () => {
        try {
            await markAllNotificationsAsRead();
        } catch (error) {
            const message = extractErrorMessage(error);
            addSnackbarMessage(message, 'error');
        }

        setNotifications((prev) =>
            prev.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })),
        );
        setUnreadCount(0);
    };

    const handleDeleteNotification = async (notificationId: string) => {
        try {
            await deleteNotification(notificationId);
            setNotifications((prev) => prev.filter((item) => item.id !== notificationId));

            // Update unread count if the deleted notification was unread.
            const deletedNotification = notifications.find((item) => item.id === notificationId);
            if (deletedNotification && !deletedNotification.read_at) {
                setUnreadCount((prev) => Math.max(prev - 1, 0));
            }
        } catch (error) {
            const message = extractErrorMessage(error);
            addSnackbarMessage(message, 'error');
        }
    };

    const handleClearAll = async () => {
        try {
            await deleteAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            const message = extractErrorMessage(error);
            addSnackbarMessage(message, 'error');
        }
    };

    return (
        <ResponsiveOverlayPanel
            isOpen={notificationOpen}
            onClose={() => setNotificationOpen(false)}
            title="Paziņojumi"
            closeOnOutsideClick
            desktopWidthClass="w-96"
            trigger={
                <button
                    onClick={() => setNotificationOpen((value) => !value)}
                    className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Paziņojumi"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold leading-none text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            }
            actions={
                latestNotifications.length || unreadCount > 0 ?
                    <>
                        {latestNotifications.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="text-xs font-medium text-red-600 hover:text-red-700"
                            >
                                Notīrīt visus
                            </button>
                        )}
                        {unreadCount > 0 && (
                            <button
                                onClick={handleReadAll}
                                className="text-xs font-medium text-blue-600 hover:text-blue-700"
                            >
                                Atzīmēt visus kā lasītus
                            </button>
                        )}
                    </>
                    : undefined
            }>
            {latestNotifications.length === 0 && (
                <div className="px-4 py-5 text-sm text-gray-500">Paziņojumu vēl nav.</div>
            )}

            {latestNotifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClick={handleNotificationClick}
                    onClose={() => setNotificationOpen(false)}
                    onDelete={handleDeleteNotification}
                />
            ))}
        </ResponsiveOverlayPanel>
    );
};

export default Notifications;
