import { User } from '@/utils/Types';
import Link from 'next/link';
import UserAvatar from '@/components/User/UserAvatar';

interface UserCardProps {
    user: User;
}

function UserCard({ user }: UserCardProps) {
    return (
        <Link href={`/profile?id=${user.id}`}>
            <div className="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                            <UserAvatar src={user.avatar_path} name={user.name} className="w-12 h-12" />
                        </div>

                    <div className="flex-1">
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default UserCard;