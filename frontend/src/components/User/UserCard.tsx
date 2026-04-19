"use client";

import { User } from '@/utils/Types';
import Link from 'next/link';
import UserCardContent from '@/components/User/UserCardContent';

interface UserCardProps {
    user: User;
    showEmail?: boolean;
    showOnlineState?: boolean;
    showFriendBadge?: boolean;
    onClick?: () => void;
    className?: string;
}

function UserCard({
    user,
    showEmail = true,
    showOnlineState = false,
    showFriendBadge = false,
    onClick,
    className = '',
}: UserCardProps) {
    return (
        <Link href={`/profile?id=${user.id}`} onClick={onClick}>
            <div className={`border rounded-lg p-4 transition hover:bg-gray-50 ${className}`.trim()}>
                <UserCardContent
                    user={user}
                    showEmail={showEmail}
                    showOnlineState={showOnlineState}
                    showFriendBadge={showFriendBadge}
                />
            </div>
        </Link>
    );
}

export default UserCard;