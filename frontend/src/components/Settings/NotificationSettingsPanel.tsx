import React, { useContext, useState } from 'react';
import useSWR from 'swr';
import { NotificationPreference, NotificationType } from '@/utils/Types';
import { getNotificationPreferences, updateNotificationPreference } from '@/utils/notification_service';
import { SnackbarContext } from '@/context/SnackbarContext';

const NOTIFICATION_TYPES: NotificationType[] = [
    'friend_request_received',
    'friend_request_accepted',
    'comment_received',
    'event_participation_request',
    'followed_user_event_created',
];

const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
    friend_request_received: 'Saņemts draudzības pieprasījums',
    friend_request_accepted: 'Draudzības pieprasījums apstiprināts',
    comment_received: 'Saņemts komentārs',
    event_participation_request: 'Saņemts dalības pieprasījums pasākumam',
    followed_user_event_created: 'Sekotais lietotājs izveidoja pasākumu',
}

const NotificationSettingsPanel = () => {
    // This is for disabling checkboxes which where clicked while fetching response
    const [updatingKeys, setUpdatingKeys] = useState<Set<string>>(new Set());
    const addSnackbarMessage = useContext(SnackbarContext);

    const {
        data: preferences,
        isValidating,
        mutate,
    } = useSWR('notification-preferences', async () => {
        return await getNotificationPreferences();
    });

    const isLoading = !preferences && isValidating;

    const getPreference = (type: NotificationType): NotificationPreference => {
        const preference = preferences?.find((item) => item.type === type);

        return preference ?? {
            type,
            in_app_enabled: true,
            email_enabled: false,
        }
    };

    const updatePreferences = (
        items: NotificationPreference[],
        type: NotificationType,
        channel: 'in_app_enabled' | 'email_enabled',
        value: boolean,
    ): NotificationPreference[] => {
        const current = items.find((item) => item.type === type) ?? {
            type,
            in_app_enabled: true,
            email_enabled: false,
        };
        const next = {
            ...current,
            [channel]: value,
        } as NotificationPreference;

        const hasExisting = items.some((item) => item.type === type);

        // if preferences doesn't have new preference type, add it to the list. 
        if (!hasExisting) {
            return [...items, next];
        }
        // Otherwise, replace the existing one with the new preference.
        return items.map((item) => (item.type === type ? next : item));
    };

    const handleToggle = async (
        type: NotificationType,
        channel: 'in_app_enabled' | 'email_enabled',
        value: boolean,
    ) => {
        const key = `${type}:${channel}`;
        const oldList = preferences ?? [];
        const updatedList = updatePreferences(oldList, type, channel, value);
        const previousValue = (oldList.find((item) => item.type === type)?.[channel]
            ?? (channel === 'in_app_enabled')) as boolean;

        setUpdatingKeys((prev) => new Set(prev).add(key));
        await mutate(updatedList, false);

        try {
            await updateNotificationPreference(type, {
                [channel]: value,
            });

            await mutate();
        } catch (error) {
            // Revert only failed field so unrelated concurrent changes wouldn't be affected
            await mutate((currentList: NotificationPreference[] = []) => {
                return updatePreferences(currentList, type, channel, previousValue);
            }, false);

            addSnackbarMessage('Nevarēja atjaunināt preferences.', 'error');
        } finally {
            setUpdatingKeys((prev) => {
                const next = new Set(prev);
                next.delete(key);
                return next;
            });
        }
    };

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Paziņojumi</h2>
            <p className="mt-1 text-sm text-gray-600">Izvēlieties, kur saņemt katra tipa paziņojumus.</p>

            {isLoading ? (
                <p className="mt-4 text-sm text-gray-500">Ielādē iestatījumus...</p>
            ) : (
                <div className="mt-4 space-y-3">
                    {NOTIFICATION_TYPES.map((type) => {
                        const preference = getPreference(type);
                        const inAppKey = `${type}:in_app_enabled`;
                        const emailKey = `${type}:email_enabled`;

                        return (
                            <div key={type} className="rounded-md border border-gray-200 p-3">
                                <p className="text-sm font-medium text-gray-800">{NOTIFICATION_TYPE_LABELS[type]}</p>
                                <div className="mt-2 flex gap-6 text-sm text-gray-700">
                                    <label className="inline-flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={preference.in_app_enabled}
                                            disabled={updatingKeys.has(inAppKey)}
                                            onChange={(event) =>
                                                void handleToggle(type, 'in_app_enabled', event.target.checked)
                                            }
                                        />
                                        Lietotne
                                    </label>

                                    <label className="inline-flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={preference.email_enabled}
                                            disabled={updatingKeys.has(emailKey)}
                                            onChange={(event) =>
                                                void handleToggle(type, 'email_enabled', event.target.checked)
                                            }
                                        />
                                        E-pasts
                                    </label>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default NotificationSettingsPanel;

