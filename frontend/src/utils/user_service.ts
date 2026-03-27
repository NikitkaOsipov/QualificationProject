import axios from '@/lib/axios'
import type { CreateResponse, UserProfile } from '@/utils/Types'

export const getUserProfile = async (userId) =>
    axios.get(`/api/profile/${userId}`).then(r => r.data as UserProfile);

export const followUser = async (userId)  =>
    axios.get(`/api/users/${userId}/follow`).then(r => r.data as CreateResponse);