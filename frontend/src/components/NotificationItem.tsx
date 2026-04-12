import { Fragment, MouseEvent } from 'react';
import Link from 'next/link';
import { AppNotification } from '@/utils/Types';

interface Props {
    notification: AppNotification;
    onClick: (id: string) => void;
    onClose: () => void;
    onDelete?: (id: string) => void;
}

const getNotificationLink = (notification: AppNotification): string => {
    const resource = notification.data.resource;

    if (!resource) {
        return '/events';
    }

    if (resource.type === 'user') {
        return `/profile?id=${resource.id}`;
    }

    return `/event?id=${resource.id}`;
};

const renderNotificationBody = (notification: AppNotification) => {
    const body = notification.data.body;
    const actorName = notification.data.actor?.name?.trim();

    if (!actorName || !body.includes(actorName)) {
        return body;
    }

    const parts = body.split(actorName);

    return parts.map((part, index) => (
        <Fragment key={`${notification.id}-${index}`}>
            {part}
            {index < parts.length - 1 && <span className="font-semibold text-gray-900">{actorName}</span>}
        </Fragment>
    ));
};

const NotificationItem = ({ notification, onClick, onClose, onDelete }: Props) => {
    const handleDelete = (e: MouseEvent) => {
        e.preventDefault();
        onDelete?.(notification.id);
    };

    return (
        <div className={`relative mx-2 my-1 rounded-md border shadow-sm transition ${
            notification.read_at ? 'border-gray-200 bg-white' : 'border-blue-100 bg-blue-50/60'
        }`}>
            <Link
                href={getNotificationLink(notification)}
                onClick={() => {
                    onClose();
                    onClick(notification.id);
                }}
                className="block rounded-md px-4 py-3 hover:bg-gray-50"
            >
                <p className="text-sm font-semibold text-gray-900">{notification.data.title}</p>
                <p className="mt-0.5 text-sm text-gray-600">{renderNotificationBody(notification)}</p>
            </Link>
            {onDelete && (
                <button
                    onClick={handleDelete}
                    className="absolute right-2 top-2 rounded-full bg-white/80 p-1 text-gray-400 hover:text-red-500"
                    title="Delete notification"
                >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            )}
        </div>
    );
};

export default NotificationItem;
