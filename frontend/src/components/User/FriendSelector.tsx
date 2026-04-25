'use client';

import { useMemo, useState } from 'react';
import SelectableUserCard from '@/components/User/SelectableUserCard';
import useOnlineFriends from '@/hooks/useOnlineFriends';

interface FriendSelectorProps {
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    title?: string;
    description?: string;
    maxHeightClassName?: string;
}

const FriendSelector = ({
    selectedIds,
    onChange,
    title = 'Izvēlies draugus',
    description = 'Izvēlies draugus, kuriem nosūtīt ielūgumu.',
    maxHeightClassName = 'max-h-80',
}: FriendSelectorProps) => {
    const [search, setSearch] = useState('');
    const { loading, allFriends } = useOnlineFriends({ enabled: true, search, limit: 300, autoUpdateOnlineStatus: false });

    const visibleFriends = useMemo(() => allFriends, [allFriends]);

    const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    const toggleFriend = (friendId: number) => {
        if (selectedSet.has(friendId)) {
            onChange(selectedIds.filter((id) => id !== friendId));
            return;
        }
        onChange([...selectedIds, friendId]);
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="mb-3">
                <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
            </div>

            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Meklēt draugus pēc vārda vai e-pasta"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />

            <div className={`mt-3 overflow-y-auto ${maxHeightClassName} space-y-2 pr-1`}>
                {loading && <p className="text-sm text-gray-500">Ielādē draugus...</p>}

                {!loading && visibleFriends.length === 0 && (
                    <p className="text-sm text-gray-500">Draugi netika atrasti.</p>
                )}

                {!loading && visibleFriends.map((friend) => (
                    <SelectableUserCard
                        key={friend.id}
                        user={friend}
                        showOnlineState
                        selected={selectedSet.has(friend.id)}
                        selectAction={() => toggleFriend(friend.id)}
                    />
                ))}
            </div>

            {selectedIds.length > 0 && (
                <p className="mt-3 text-sm text-blue-700">Izvēlēti: {selectedIds.length}</p>
            )}
        </div>
    );
};

export default FriendSelector;
