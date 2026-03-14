import axios from '@/lib/axios';
import type { Comment, MarkerType } from './Types'

export const getEventComments = async (eventId: number | string, page?: number) =>
    axios.get(`/api/event-comments/${eventId}?page=${page}`).then(r => r.data.data as Comment[]);

export const getUserComments = async (params?: { userId: number | string; page?: number; search?:string }) =>
    axios.get(`/api/user-comments/${params.userId}`).then(r => r.data.data as MarkerType);

export const createComment = async (text: string, eventId: number | string) =>
{
    const data = {
        text: text,
        event_id: eventId
    };

    return axios.post('/api/comment', data).then(r => r.data as MarkerType);
}

