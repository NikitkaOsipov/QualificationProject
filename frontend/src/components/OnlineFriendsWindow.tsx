'use client';

import { useState } from 'react';
import Link from 'next/link';
import useOnlineFriends from '@/hooks/useOnlineFriends';
import UserAvatar from '@/components/User/UserAvatar';
import ResponsiveOverlayPanel from '@/components/ResponsiveOverlayPanel';

interface Props {
    user: { id: number | string } | null | undefined;
}

const OnlineFriendsWindow = ({ user }: Props) => {
    const [isOpen, setIsOpen] = useState(false);
    const { allFriends, loading } = useOnlineFriends({ enabled: Boolean(user), limit: 20 });
    const onlineFriends = allFriends.filter((friend) => friend.is_online === true);

    if (!user) {
        return null;
    }

    return (
        <ResponsiveOverlayPanel
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title="Draugi tiešsaistē"
            desktopWidthClass="w-80"
            trigger={
                <button
                    type="button"
                    onClick={() => setIsOpen((value) => !value)}
                    className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Draugi tiešsaistē"
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="8" cy="9" r="3" />
                        <circle cx="16" cy="9" r="3" />
                        <path d="M3 19c0-2.5 2.2-4 5-4" />
                        <path d="M11 19c0-2.5 2.2-4 5-4" />
                    </svg>
                    <span className="absolute -right-0.5 -top-0.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-green-500 px-1 text-xs font-semibold leading-none text-white">
                        {onlineFriends.length}
                    </span>
                </button>
            }>
            {loading && <div className="px-4 py-2 text-sm text-gray-500">Ielādē...</div>}

            {!loading && onlineFriends.length === 0 && (
                <div className="px-4 py-2 text-sm text-gray-500">Pašlaik neviens draugs nav tiešsaistē.</div>
            )}

            {!loading && onlineFriends.map((friend) => (
                <Link
                    key={friend.id}
                    href={`/profile?id=${friend.id}`}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                >
                    <div className="relative">
                        <UserAvatar src={friend.avatar_path ?? friend.avatar} name={friend.name} className="w-9 h-9" />
                        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{friend.name}</p>
                        <p className="truncate text-xs text-gray-500">{friend.email}</p>
                    </div>
                </Link>
            ))}
        </ResponsiveOverlayPanel>
    );
};

export default OnlineFriendsWindow;

