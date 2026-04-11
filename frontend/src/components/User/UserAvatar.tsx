import { API_BASE_URL } from '@/Config/api'

interface UserAvatarProps {
    src?: string | null;
    name: string;
    className?: string;
}

export default function UserAvatar({ src, name, className = "w-10 h-10" }: UserAvatarProps) {
    return (
        <img
            src={src || `${API_BASE_URL}/storage/AvatarImages/default.jpg`}
            alt={name}
            className={`${className} rounded-full object-cover`}
        />
    );
}

