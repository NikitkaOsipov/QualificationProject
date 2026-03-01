import { useState } from "react"

const MIN_LENGTH = 3
const MAX_LENGTH = 300

function CommentsSection() {
    const [comments, setComments] = useState([
        { id: 1, author: "Anna", text: "Looks interesting! I'll probably come." },
        { id: 2, author: "Mark", text: "Is there a schedule available?" }
    ])

    const [newComment, setNewComment] = useState("")
    const [error, setError] = useState("")

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

    const handleSubmit = () => {
        const validationError = validate(newComment)

        if (validationError) {
            setError(validationError)
            return
        }

        const newEntry = {
            id: Date.now(),
            author: "You",
            text: newComment.trim()
        }

        setComments([newEntry, ...comments])
        setNewComment("")
        setError("")
    }

    const handleChange = (value: string) => {
        setNewComment(value)
        setError(validate(value))
    }

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
                {comments.map((c) => (
                    <div key={c.id} className="border rounded-lg p-3">
                        <p className="text-sm font-medium">{c.author}</p>
                        <p className="text-gray-600 text-sm">{c.text}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CommentsSection