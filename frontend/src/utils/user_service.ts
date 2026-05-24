import axios from '@/lib/axios'
import { FriendshipStatus, User } from '@/utils/Types'
import type { LaravelPaginatedResponse, LaravelStatusResponse } from '@/utils/response_helper'

type UserSearchResponse = LaravelPaginatedResponse<User[]>;
type ProfileTabResponse = LaravelPaginatedResponse<any[]>;

export interface UserProfile {
    user: User;
    meta: {
        isFollowing: boolean;
        isOwner: boolean;
        friendshipStatus: FriendshipStatus;
    };
}

export const getUserProfile = async (userId) =>
    axios.get(`/api/profile/${userId}`).then(r => r.data as UserProfile);

export const followUser = async (userId)  =>
    axios.post(`/api/users/${userId}/follow`).then(r => r.data as LaravelStatusResponse);

export const sendFriendRequest = async (userId: number) =>
    axios.post(`/api/users/${userId}/friend-request`).then(r => r.data as LaravelStatusResponse);

export const respondFriendRequest = async (userId: number, action: 'accept' | 'decline') =>
    axios.post(`/api/users/${userId}/friend-request/respond`, { action }).then(r => r.data as LaravelStatusResponse);

export const removeFriend = async (userId: number) =>
    axios.delete(`/api/users/${userId}/friend`).then(r => r.data as LaravelStatusResponse);

export const getProfileTab = async (userId: number | string, tab: string, pageNumber: number) =>
    axios.get(`api/profile/${userId}/${tab}/?page=${pageNumber}`).then(r => r.data as ProfileTabResponse);

export const getFriends = async (params?: { search?: string; limit?: number }) =>
    axios.get('/api/friends', { params }).then((r) => r.data.data as User[]);

export const updateOnlineStatus = async () =>
    axios.post('/api/users/update-online-status').then((r) => r.data as LaravelStatusResponse);

export const searchUsers = async (params?: { search?: string; page?: number; per_page?: number }) =>
    axios.get('/api/users/search', { params }).then((r) => r.data as UserSearchResponse);

export const updateCurrentUser = async (params?: { name: string; email: string; }) =>
    axios.patch('/api/users', { ...params }).then((r) => r.data as User);

export const getUser = async () =>
    axios.get('/api/user').then((r) => r.data as User);