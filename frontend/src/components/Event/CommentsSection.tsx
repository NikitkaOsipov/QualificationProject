import { useEffect, useState } from 'react'
import { createComment, getEventComments } from '@/utils/comment_service';
import { Comment } from '@/utils/Types';
import Loading from '@/components/Loading'
import { API_BASE_URL } from '@/Config/api'

const MIN_LENGTH = 3
const MAX_LENGTH = 300

interface Params {
    eventId: number | string;
}

function CommentsSection({ eventId }: Params) {
    const [comments, setComments] = useState<Comment[] | null>();

    const [newComment, setNewComment] = useState("")
    const [error, setError] = useState("")

    useEffect(() => {
        const getComments = async () => {
            if (!eventId) return;
            const res = await getEventComments(eventId);
            console.log(res);

            setComments(res);
        }
        getComments();
    }, []);

    const validate = (text: string) => {
        const trimmedText = text.trim();
        if (trimmedText.length != 0 && trimmedText.length < MIN_LENGTH) {
            return `Comment must be at least ${MIN_LENGTH} characters`
        }
        if (trimmedText.length > MAX_LENGTH) {
            return `Comment must be less than ${MAX_LENGTH} characters`
        }
        return ""
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    }

    const getAvatarUrl = (user: any) => {
        if (user.avatar_path) {
            return `${API_BASE_URL}/storage/${user.avatar_path}`;
        }
        return null;
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
    }

    const handleSubmit = async () => {
        const validationError = validate(newComment)

        if (validationError) {
            setError(validationError)
            return
        }

        const result = await createComment(
            newComment.trim(),
            eventId
        );

        console.log(result);

        // Refresh comments after posting
        const updatedComments = await getEventComments(eventId);
        setComments(updatedComments);

        setNewComment("")
        setError("")
    }

    const handleChange = (value: string) => {
        setNewComment(value)
        setError(validate(value))
    }


    if (comments == null) return <Loading />

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">
                Comments
            </h2>

            {/* Input */}
            <div className="mb-6 flex flex-col gap-2">

                <textarea
                    value={newComment}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="Write a comment..."
                    className={`w-full border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 
                        ${error ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
                    rows={3}
                />

                {/* Error + counter */}
                <div className="flex justify-between items-center text-xs">
                    <span className="text-red-500">
                        {error}
                    </span>

                    <span className="text-gray-400">
                        {newComment.length}/{MAX_LENGTH}
                    </span>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={!!error || !newComment.trim()}
                        className={`px-4 py-2 rounded-lg text-white transition
                            ${error || !newComment.trim()
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"}`}
                    >
                        Post
                    </button>
                </div>

            </div>

            {/* Comments */}
            <div className="flex flex-col gap-4">
                {comments.map((c) => {
                    const avatarUrl = getAvatarUrl(c.user);
                    const initials = getInitials(c.user.name);

                    return (
                        <div key={c.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                            <div className="flex gap-3 mb-2">
                                <div className="flex-shrink-0">
                                    <img
                                        src={c.user.avatar || `${API_BASE_URL}/storage/AvatarImages/default.jpg`}
                                        alt={c.user.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">{c.user.name}</p>
                                        <p className="text-xs text-gray-500">{formatDate(c.created_at)}</p>
                                    </div>
                                    <p className="text-gray-700 text-sm mt-1">{c.text}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default CommentsSection