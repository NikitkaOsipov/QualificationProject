import { User } from '@/utils/Types';
import Link from 'next/link';
import { API_BASE_URL } from '@/Config/api'

interface UserCardProps {
    user: User;
}

function UserCard({ user }: UserCardProps) {
    return (
        <Link href={`/profile?id=${user.id}`}>
            <div className="border rounded-lg p-4 hover:bg-gray-50 transition cursor-pointer">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                        {/*{user.avatar_path ? (*/}
                            <img
                                src={user.avatar_path || `${API_BASE_URL}/storage/AvatarImages/default.jpg`}
                                alt={user.name}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                        {/*) : (*/}
                        {/*    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">*/}
                        {/*        {user.name.charAt(0).toUpperCase()}*/}
                        {/*    </div>*/}
                        {/*)}*/}
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