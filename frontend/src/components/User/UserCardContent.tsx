"use client";

import { ReactNode } from 'react';
import UserAvatar from '@/components/User/UserAvatar';
import { User } from '@/utils/Types';

type UserCardContentProps = {
    user: User;
    showEmail?: boolean;
    showOnlineState?: boolean;
    showFriendBadge?: boolean;
    rightSlot?: ReactNode;
};

export default function UserCardContent({
    user,
    showEmail = true,
    showOnlineState = false,
    showFriendBadge = false,
    rightSlot,
}: UserCardContentProps) {
    const isOnline = 'is_online' in user ? Boolean(user.is_online) : false;

    return (
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 relative">
                <UserAvatar src={user.avatar_path ?? user.avatar} name={user.name} className="w-12 h-12" />
                {showOnlineState && (
                    <span
                        className={`absolute right-0 top-0 h-3 w-3 rounded-full ring-2 ring-white ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}
                        title={isOnline ? 'Tiesaistē' : 'Bezsaistē'}
                    />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                    {showFriendBadge && user.is_friend && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Draugs</span>
                    )}
                </div>
                {showEmail && <p className="text-sm text-gray-500 truncate">{user.email}</p>}
            </div>

            {rightSlot && <div className="flex-shrink-0">{rightSlot}</div>}
        </div>
    );
}

