"use client";

import { Star } from "lucide-react";
import { useState } from "react";

type InterestedButtonProps = {
    isInterested: boolean;
    onClick: (value: boolean) => void;
    disabled?: boolean;
}

export default function InterestedButton({
                                             isInterested,
                                             onClick,
                                             disabled = false
                                         }: InterestedButtonProps) {
    const [hovered, setHovered] = useState(false)

    return (
        <div className="relative inline-block">
            <button
                onClick={() => onClick(!isInterested)}
                disabled={disabled}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition hover:bg-gray-100 disabled:opacity-50"
            >
                <Star
                    className={`w-5 h-5 transition ${
                        isInterested
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-400"
                    }`}
                />
            </button>

            {hovered && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-8
                                bg-black text-white text-xs px-2 py-1 rounded
                                whitespace-nowrap shadow-md">
                    I am interested
                </div>
            )}
        </div>
    )
}