"use client";

import React from 'react';
import { User } from '@/utils/Types';
import UserCardContent from '@/components/User/UserCardContent';

export interface SelectableUserCardProps {
    user: User;
    selected?: boolean;
    showEmail?: boolean;
    showOnlineState?: boolean;
    showFriendBadge?: boolean;
    selectAction?: (user: User) => void;
}

const SelectableUserCard= ({
    user,
    selected = false,
    showEmail = true,
    showOnlineState = false,
    showFriendBadge = false,
    selectAction,
}: SelectableUserCardProps) => {
    return (
        <div className={`border rounded-lg p-4 transition ${selected ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
            <UserCardContent
                user={user}
                showEmail={showEmail}
                showOnlineState={showOnlineState}
                showFriendBadge={showFriendBadge}
                rightSlot={
                    <button
                        type="button"
                        onClick={() => selectAction?.(user)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium ${selected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        {selected ? 'Selected' : 'Select'}
                    </button>
                }
            />
        </div>
    );
};

export default SelectableUserCard;

