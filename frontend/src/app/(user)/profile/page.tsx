"use client"

import { useEffect, useState } from "react";
import Tab from '@/components/User/ProfileTab';
import { followUser, getUserProfile } from '@/utils/user_service'
import { TABS, TabState, User } from '@/utils/Types'
import { API_BASE_URL } from '@/Config/api'
import ProfilePaginationTable from '@/components/User/ProfilePaginationTable'
import { useAuth } from '@/hooks/auth'

const DefaultTab = "events";

export default function ProfilePage() {
    const [profileUser, setprofileUser] = useState<User | null>(null)
    const [isFollowing, setIsFollowing] = useState(false)
    const [isOwner, setIsOwner] = useState(false)
    const [activeTab, setActiveTab] = useState<TabState>(DefaultTab)

    const {user} = useAuth();

    useEffect(() => {
        const id = typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("id")
            : null

        async function fetchUser() {
            if (!id) return

            const data = await getUserProfile(id);

            setprofileUser(data.user)
            setIsFollowing(data.meta.isFollowing)
            setIsOwner(data.meta.isOwner)
        }

        fetchUser()
    }, [])

    const toggleFollow = async () => {
        const response = await followUser(profileUser.id);

        if (response.status == "ok") {
            setIsFollowing(!isFollowing);
        } else {
            console.log(response.message);
        }
    }

    if (!profileUser) return <p className="p-4">Loading...</p>

    console.log(user);
    return (
        <div className="max-w-5xl mx-auto p-4 flex flex-col gap-6">
            <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                    <img
                        src={profileUser.avatar || `${API_BASE_URL}/storage/AvatarImages/DefaultAvatar.jpg`}
                        alt={profileUser.name}
                        className="w-20 h-20 rounded-full object-cover"
                    />

                    <h1 className="text-2xl font-semibold">
                        {profileUser.name}
                    </h1>
                </div>

                {(!isOwner && user) && (
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
                <div><span className="font-semibold">{profileUser.stats.events}</span> Events</div>
                <div><span className="font-semibold">{profileUser.stats.followers}</span> Followers</div>
                <div><span className="font-semibold">{profileUser.stats.friends}</span> Friends</div>
            </div>

            <div className="flex gap-6 border-b">
                <Tab
                    label="Events"
                    active={activeTab === "events"}
                    onClick={() => setActiveTab("events")}
                />

                <Tab
                    label="following"
                    active={activeTab === "following"}
                    onClick={() => setActiveTab("following")}
                />

                <Tab
                    label="friends"
                    active={activeTab === "friends"}
                    onClick={() => setActiveTab("friends")}
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
                <ProfilePaginationTable userId={profileUser.id} tab={activeTab} />
            </div>
        </div>
    )
}