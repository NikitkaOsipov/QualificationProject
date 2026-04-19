"use client";

import { useEffect, useMemo, useState } from 'react';
import UserAvatar from '@/components/User/UserAvatar';
import UsersListModal from '@/components/Event/UsersListModal';
import { User } from '@/utils/Types';

type GoingUsersPanelProps = {
    goingCount: number;
    goingUsers: User[];
    onModalOpenChangeAction?: (isOpen: boolean) => void;
};

export default function GoingUsersPanel({ goingCount, goingUsers, onModalOpenChangeAction }: GoingUsersPanelProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const goingFriendUsers = useMemo(
        () => goingUsers.filter((person) => person.is_friend === true),
        [goingUsers],
    );

    useEffect(() => {
        onModalOpenChangeAction?.(isModalOpen);
    }, [isModalOpen, onModalOpenChangeAction]);

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    if (goingCount > 0) {
                        setIsModalOpen(true);
                    }
                }}
                aria-disabled={goingCount === 0}
                className={`border rounded-xl p-5 shadow-sm text-left transition ${
                    goingCount > 0
                        ? 'hover:bg-gray-50'
                        : 'opacity-70 cursor-default pointer-events-none'
                }`}
            >
                <h3 className="font-semibold mb-3">
                    Draugi, kas piedalas
                </h3>

                {goingFriendUsers.length > 0 && (
                    <div className="flex -space-x-2">
                        {goingFriendUsers.slice(0, 5).map((person) => (
                            <div key={person.id} className="ring-2 ring-white rounded-full bg-white">
                                <UserAvatar src={person.avatar_path ?? null} name={person.name} className="w-8 h-8" />
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-sm text-gray-500 mt-2">
                    {goingCount === 0 ? '0 lietotaji atzimeja piedalas' : `Kopa piedalas: ${goingCount}`}
                </p>
            </button>

            <UsersListModal
                isOpen={isModalOpen}
                title="Cilveki, kas piedalas"
                users={goingUsers}
                onCloseAction={() => setIsModalOpen(false)}
            />
        </>
    );
}
