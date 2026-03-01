import axios from '@/lib/axios';
import type { MarkerType } from './Types'

export const getEventComments = async (params?: { eventId: number | string; page?: number; search?:string }) =>
    axios.get(`/api/event-comments/${params.eventId}`, { params }).then(r => r.data.data as MarkerType[]);

export const getUserComments = async (params?: { userId: number | string; page?: number; search?:string }) =>
    axios.get(`/api/user-comments/${params.userId}`).then(r => r.data.data as MarkerType);

export const createComment = async (data: { text: string; eventId: number | string }) =>
    axios.post('/api/comment', data).then(r => r.data as MarkerType);