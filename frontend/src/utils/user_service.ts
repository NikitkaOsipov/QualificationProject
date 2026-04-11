import axios from '@/lib/axios'
import type { CreateResponse, ProfileTabResponse, UserProfile } from '@/utils/Types'

export const getUserProfile = async (userId) =>
    axios.get(`/api/profile/${userId}`).then(r => r.data as UserProfile);

export const followUser = async (userId)  =>
    axios.post(`/api/users/${userId}/follow`).then(r => r.data as CreateResponse);

export const sendFriendRequest = async (userId: number) =>
    axios.post(`/api/users/${userId}/friend-request`).then(r => r.data as CreateResponse);

export const respondFriendRequest = async (userId: number, action: 'accept' | 'decline') =>
    axios.post(`/api/users/${userId}/friend-request/respond`, { action }).then(r => r.data as CreateResponse);

export const removeFriend = async (userId: number) =>
    axios.delete(`/api/users/${userId}/friend`).then(r => r.data as CreateResponse);

export const getProfileTab = async (userId: number | string, tab: string, pageNumber: number) =>
    axios.get(`api/profile/${userId}/${tab}/?page=${pageNumber}`).then(r => r.data as ProfileTabResponse);