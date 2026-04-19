"use client";

import UserCard from '@/components/User/UserCard';
import { User } from '@/utils/Types';

type UsersListModalProps = {
    isOpen: boolean;
    title: string;
    users: User[];
    onCloseAction: () => void;
};

export default function UsersListModal({ isOpen, title, users, onCloseAction }: UsersListModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b px-5 py-3">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button
                        type="button"
                        onClick={onCloseAction}
                        className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100"
                    >
                        Aizvert
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto p-4 space-y-2">
                    {users.length === 0 && (
                        <p className="text-sm text-gray-500">Saraksts ir tukss.</p>
                    )}

                    {users.map((person) => (
                        <UserCard
                            key={person.id}
                            user={person}
                            showFriendBadge
                            onClick={onCloseAction}
                            className="p-3"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
