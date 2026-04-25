"use client";

import { useState } from 'react';
import InterestedButton from '@/components/Event/InterestedButton';
import UsersListModal from '@/components/Event/UsersListModal';
import { User } from '@/utils/Types';

type InterestedUsersDisplayProps = {
    isInterested: boolean;
    onInterestedChangeAction: (value: boolean) => void | Promise<void>;
    interestedCount: number;
    interestedUsers: User[];
};

export default function InterestedUsersDisplay({
    isInterested,
    onInterestedChangeAction,
    interestedCount,
    interestedUsers,
}: InterestedUsersDisplayProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <InterestedButton isInterested={isInterested} onClick={onInterestedChangeAction} />

            <button
                type="button"
                onClick={() => {
                    if (interestedCount > 0) {
                        setIsModalOpen(true);
                    }
                }}
                aria-disabled={interestedCount === 0}
                className={`self-center text-sm ${
                    interestedCount > 0
                        ? 'text-gray-600 hover:text-indigo-700'
                        : 'text-gray-400 cursor-default pointer-events-none'
                }`}
            >
                {interestedCount} interesējas
            </button>

            <UsersListModal
                isOpen={isModalOpen}
                title="Cilvēki, kas interesējas"
                users={interestedUsers}
                onCloseAction={() => setIsModalOpen(false)}
            />
        </>
    );
}
