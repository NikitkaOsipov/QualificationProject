import axios from '@/lib/axios';
import type { Comment, EventType } from './Types'
import type { LaravelStatusResponse } from './response_helper'

interface CreateCommentResponse {
    status: 'ok' | 'error';
    data?: {
        comment: Comment
    };
    message: string;
}

export const getEventComments = async (eventId: number | string, page?: number) =>
    axios.get(`/api/event-comments/${eventId}?page=${page}`).then(r => r.data.data as Comment[]);

export const getUserComments = async (params?: { userId: number | string; page?: number; search?:string }) =>
    axios.get(`/api/user-comments/${params.userId}`).then(r => r.data.data as EventType);

export const createComment = async (text: string, eventId: number | string) =>
{
    const data = {
        text: text,
        event_id: eventId
    };

    return axios.post('/api/comment', data).then(r => r.data as CreateCommentResponse);
}

export const updateComment = async (commentId: number | string, text: string) =>
    axios.patch(`/api/comment/${commentId}`, { text }).then(r => r.data as LaravelStatusResponse);

export const deleteComment = async (commentId: number | string) =>
    axios.delete(`/api/comment/${commentId}`).then(r => r.data as LaravelStatusResponse);
