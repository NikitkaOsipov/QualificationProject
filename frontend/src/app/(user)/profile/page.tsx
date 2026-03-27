"use client"

import { useEffect, useState } from "react";
import Tab from '@/components/User/ProfileTab';
import { followUser, getUserProfile } from '@/utils/user_service'
import { User } from '@/utils/Types'
import { API_BASE_URL } from '@/Config/api'

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null)
    const [isFollowing, setIsFollowing] = useState(false)
    const [isOwner, setIsOwner] = useState(false)
    const [activeTab, setActiveTab] = useState<"events" | "comments" | "likes">("events")

    useEffect(() => {
        const id = typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("id")
            : null

        async function fetchUser() {
            if (!id) return

            const data = await getUserProfile(id);

            setUser(data.user)
            setIsFollowing(data.meta.isFollowing)
            setIsOwner(data.meta.isOwner)
        }

        fetchUser()
    }, [])

    const toggleFollow = async () => {
        const response = await followUser(user.id);

        if (response.status == "ok") {
            setIsFollowing(!isFollowing);
        } else {
            console.log(response.message);
        }
    }

    if (!user) return <p className="p-4">Loading...</p>

    return (
        <div className="max-w-5xl mx-auto p-4 flex flex-col gap-6">
            <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                    <img
                        src={user.avatar || `${API_BASE_URL}/storage/AvatarImages/DefaultAvatar.jpg`}
                        alt={user.name}
                        className="w-20 h-20 rounded-full object-cover"
                    />

                    <h1 className="text-2xl font-semibold">
                        {user.name}
                    </h1>
                </div>

                {(!isOwner && !user) && (
                    <button
                        onClick={toggleFollow}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition
                            ${isFollowing
                            ? "bg-gray-200 text-gray-800"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                    >
                        {isFollowing ? "Following" : "Follow"}
                    </button>
                )}
            </div>

            <div className="flex gap-6 text-sm text-gray-600 border-b pb-3">
                <div><span className="font-semibold">{user.stats.events}</span> Events</div>
                <div><span className="font-semibold">{user.stats.followers}</span> Followers</div>
                <div><span className="font-semibold">{user.stats.friends}</span> Friends</div>
            </div>

            <div className="flex gap-6 border-b">
                <Tab
                    label="Events"
                    active={activeTab === "events"}
                    onClick={() => setActiveTab("events")}
                />

                {isOwner && (
                    <>
                        <Tab
                            label="Comments"
                            active={activeTab === "comments"}
                            onClick={() => setActiveTab("comments")}
                        />
                        <Tab
                            label="Likes"
                            active={activeTab === "likes"}
                            onClick={() => setActiveTab("likes")}
                        />
                    </>
                )}
            </div>

            <div className="mt-4">
                {activeTab === "events" && (
                    <p>Events list goes here...</p>
                )}

                {activeTab === "comments" && isOwner && (
                    <p>Your comments...</p>
                )}

                {activeTab === "likes" && isOwner && (
                    <p>Your liked events...</p>
                )}
            </div>
        </div>
    )
}