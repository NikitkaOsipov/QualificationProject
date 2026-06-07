"use client";

import { useContext, useEffect, useState } from 'react'
import Button from '@/components/Button';
import Tab from '@/components/User/ProfileTab';
import { followUser, getUserProfile, sendFriendRequest, respondFriendRequest, removeFriend } from '@/utils/user_service';
import { TabState, User, FriendshipStatus } from '@/utils/Types';
import ProfilePaginationTable from '@/components/User/ProfilePaginationTable';
import { useAuth } from '@/hooks/auth';
import Loading from '@/components/Loading';
import UserAvatar from '@/components/User/UserAvatar';
import { SnackbarContext } from '@/context/SnackbarContext';
import { useRouter } from 'next/navigation';
import { extractValidationErrors, isValidationError } from '@/utils/response_helper';

const DefaultTab = "events";

export default function ProfilePage() {
    const [profileId, setProfileId] = useState<string | null>(null);

    const [profileUser, setProfileUser] = useState<User | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [friendshipStatus, setFriendshipStatus] = useState<FriendshipStatus>('none');
    const [activeTab, setActiveTab] = useState<TabState>(DefaultTab);
    const [actionLoading, setActionLoading] = useState(false);
    const router = useRouter();
    const addSnackbarMessage = useContext(SnackbarContext);

    const { user } = useAuth();

    // As page files are statically generated I can't use useSearchParams to easily check id.
    // So when user changes id in search params it should update page. This is what this useEffect for.
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const readProfileId = () => new URLSearchParams(window.location.search).get('id');

        const onUrlChange = () => {
            const id = readProfileId();
            if (!id) {
                addSnackbarMessage('Lietotājs nav atrasts.', 'error');
                router.push('/');
                return;
            }

            setProfileId(id);
        };

        const emitUrlChangeAsync = () => {
            // Defer to next tick to avoid scheduling React updates in sensitive render/effect phases.
            setTimeout(() => {
                window.dispatchEvent(new Event('app:url-change'));
            }, 0);
        };

        onUrlChange();

        const originalPushState = window.history.pushState;
        const originalReplaceState = window.history.replaceState;

        window.history.pushState = function (...args) {
            originalPushState.apply(this, args as Parameters<History['pushState']>);
            emitUrlChangeAsync();
        };

        window.history.replaceState = function (...args) {
            originalReplaceState.apply(this, args as Parameters<History['replaceState']>);
            emitUrlChangeAsync();
        };

        window.addEventListener('popstate', onUrlChange);
        window.addEventListener('app:url-change', onUrlChange);

        return () => {
            window.history.pushState = originalPushState;
            window.history.replaceState = originalReplaceState;
            window.removeEventListener('popstate', onUrlChange);
            window.removeEventListener('app:url-change', onUrlChange);
        };
    }, [router]);

    useEffect(() => {
        let isCancelled = false;

        async function fetchUser() {
            if (!profileId) {
                return;
            }

            setProfileUser(null);

            try {
                const data = await getUserProfile(profileId);
                if (isCancelled) {
                    return;
                }

                setProfileUser(data.user);
                setIsFollowing(data.meta.isFollowing);
                setIsOwner(data.meta.isOwner);
                setFriendshipStatus(data.meta.friendshipStatus);
                setActiveTab(DefaultTab);
            } catch (error) {
                if (isCancelled) {
                    return;
                }

                if (isValidationError(error)) {
                    const errors = extractValidationErrors(error);
                    Object.values(errors).forEach(messages => {
                        messages?.forEach(message => addSnackbarMessage(message, 'error'));
                    });
                }

                addSnackbarMessage('Lietotājs nav atrasts. Iespējams, profils neeksistē vai nav pieejams.', 'error');
                setProfileUser(null);
                router.push('/');
            }
        }

        fetchUser();

        return () => {
            isCancelled = true;
        };
    }, [profileId, router])

    const toggleFollow = async () => {
        if (actionLoading) return;
        setActionLoading(true);
        const response = await followUser(profileUser.id);
        if (response.status === "ok") setIsFollowing(prev => !prev);
        setActionLoading(false);
    }

    const handleSendFriendRequest = async () => {
        if (actionLoading) return;
        setActionLoading(true);
        const response = await sendFriendRequest(profileUser.id);
        if (response.status === "ok") setFriendshipStatus('pending_sent');
        setActionLoading(false);
    }

    const handleRespondRequest = async (action: 'accept' | 'decline') => {
        if (actionLoading) return;
        setActionLoading(true);
        const response = await respondFriendRequest(profileUser.id, action);
        if (response.status === "ok") setFriendshipStatus(action === 'accept' ? 'friends' : 'none');
        setActionLoading(false);
    }

    const handleRemoveFriend = async () => {
        if (actionLoading) return;
        setActionLoading(true);
        const response = await removeFriend(profileUser.id);
        if (response.status === "ok") setFriendshipStatus('none');
        setActionLoading(false);
    }

    if (!profileUser) return <Loading />;

    return (
        <div className="max-w-5xl mx-auto p-4 flex flex-col gap-6">
            {/* Header card */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Avatar + Name */}
                <div className="flex items-center gap-4">
                    <UserAvatar avatarPath={profileUser.avatar_path} name={profileUser.name} className="w-20 h-20 ring-2 ring-gray-100" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{profileUser.name}</h1>
                        {friendshipStatus === 'friends' && (
                            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                Draugi
                            </span>
                        )}
                    </div>
                </div>

                {/* Action buttons — only shown to logged-in non-owners */}
                {(!isOwner && user) && (
                    <div className="flex flex-wrap gap-2">
                        {/* Follow button */}
                        <Button
                            onClick={toggleFollow}
                            disabled={actionLoading}
                            variant='secondary'
                            className={`text-sm font-medium ${isFollowing ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : ''}`}
                        >
                            {isFollowing ? "Seko" : "Sekot"}
                        </Button>

                        {/* Friend request button — state-driven */}
                        {friendshipStatus === 'none' && (
                            <Button
                                onClick={handleSendFriendRequest}
                                disabled={actionLoading}
                                variant='secondary'
                                className="text-sm font-medium"
                            >
                                Pievienot draugos
                            </Button>
                        )}

                        {friendshipStatus === 'pending_sent' && (
                            <button
                                onClick={handleRemoveFriend}
                                disabled={actionLoading}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-yellow-50 text-yellow-700 border border-yellow-300 hover:bg-yellow-100 transition disabled:opacity-60"
                            >
                                Pieprasījums nosūtīts - Atcelt
                            </button>
                        )}

                        {friendshipStatus === 'pending_received' && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleRespondRequest('accept')}
                                    disabled={actionLoading}
                                    className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-60"
                                >
                                    Apstiprināt
                                </button>
                                <button
                                    onClick={() => handleRespondRequest('decline')}
                                    disabled={actionLoading}
                                    className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-60"
                                >
                                    Noraidīt
                                </button>
                            </div>
                        )}

                        {friendshipStatus === 'friends' && (
                            <button
                                onClick={handleRemoveFriend}
                                disabled={actionLoading}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition disabled:opacity-60"
                            >
                                Izņemt no draugiem
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Stats row */}
            <div className="flex gap-8 text-sm text-gray-600">
                <div className="flex flex-col items-center">
                    <span className="text-xl font-bold text-gray-900">{profileUser.stats.events}</span>
                    <span>Pasākumi</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xl font-bold text-gray-900">{profileUser.stats.followers}</span>
                    <span>Sekotāji</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xl font-bold text-gray-900">{profileUser.stats.friends}</span>
                    <span>Draugi</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200">
                <Tab label="Pasākumi" active={activeTab === "events"} onClick={() => setActiveTab("events")} />
                <Tab label="Seko" active={activeTab === "following"} onClick={() => setActiveTab("following")} />
                <Tab label="Draugi" active={activeTab === "friends"} onClick={() => setActiveTab("friends")} />
                {isOwner && (
                    <Tab label="Komentāri" active={activeTab === "comments"} onClick={() => setActiveTab("comments")} />
                )}
            </div>

            <div className="mt-2">
                <ProfilePaginationTable userId={profileUser.id} tab={activeTab} />
            </div>
        </div>
    )
}