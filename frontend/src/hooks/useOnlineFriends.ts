import { useEffect, useMemo, useRef, useState } from 'react';
import { User } from '@/utils/Types';
import { getFriends, updateOnlineStatus } from '@/utils/user_service';

const ONLINE_STATUS_UPDATE_INTERVAL_MS = 30_000;
const ONLINE_REFRESH_INTERVAL_MS = 20_000;

interface UseOnlineFriendsOptions {
    enabled?: boolean;
    search?: string;
    limit?: number;
    autoUpdateOnlineStatus?: boolean;
}

export const useOnlineFriends =
    ({ enabled = true, search, limit, autoUpdateOnlineStatus = true }: UseOnlineFriendsOptions = {}) => {

    const [allFriends, setAllFriends] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const isInitialLoad = useRef(true);

    // Fetches all friends every ONLINE_REFRESH_INTERVAL_MS
    useEffect(() => {
        if (!enabled) {
            setAllFriends([]);
            setLoading(false);
            isInitialLoad.current = true;
            return;
        }

        // for situations if api call finishes after component unmounts
        let isMounted = true;

        const fetchAll = async () => {
            const isFirstLoad = isInitialLoad.current;

            if (isFirstLoad) {
                setLoading(true);
            }

            try {
                const friends = await getFriends({ search, limit });

                if (!isMounted) {
                    return;
                }

                setAllFriends(friends);
                isInitialLoad.current = false;
            } catch {
                if (!isMounted) {
                    return;
                }

                // Keep previous values during refresh failures
                if (isInitialLoad.current) {
                    setAllFriends([]);
                }
            } finally {
                if (isMounted && isFirstLoad) {
                    setLoading(false);
                }
            }
        };

        void fetchAll();

        const refreshTimer = window.setInterval(() => {
            void fetchAll();
        }, ONLINE_REFRESH_INTERVAL_MS);

        return () => {
            isMounted = false;
            window.clearInterval(refreshTimer);
        };
    }, [enabled, search, limit]);

    // Sends online status update of auth user every ONLINE_STATUS_UPDATE_INTERVAL_MS
    useEffect(() => {
        if (!enabled || !autoUpdateOnlineStatus) {
            return;
        }

        // for situations if api call finishes after component unmounts
        let isMounted = true;

        const pushOnlineStatusUpdate = async () => {
            try {
                await updateOnlineStatus();
            } catch {
                console.log("Error occurred updating online status");
            }
        };

        void pushOnlineStatusUpdate();

        const updateOnlineStatusTimer = window.setInterval(() => {
            if (!isMounted) {
                return;
            }
            void pushOnlineStatusUpdate();
        }, ONLINE_STATUS_UPDATE_INTERVAL_MS);

        return () => {
            isMounted = false;
            window.clearInterval(updateOnlineStatusTimer);
        };
    }, [enabled, autoUpdateOnlineStatus]);

    const hasFriends = useMemo(() => allFriends.length > 0, [allFriends.length]);

    return {
        loading,
        hasFriends,
        allFriends,
    };
};

export default useOnlineFriends;



