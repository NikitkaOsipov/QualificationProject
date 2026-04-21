import axios from '@/lib/axios';
import type { CreateResponse, EventResponse, MarkerType } from './Types'

export type UpdatePostData = {
    title: string;
    description?: string;
    address_name: string;
    start_date: string;
    end_date?: string;
    price?: string | number;
    lat: number;
    lng: number;
    visibility?: 'public' | 'friends_only' | 'private';
};

export const getPosts = async (params?: { page?: number; search?:string }) =>
    axios.get('/api/all-events', { params }).then(r => r.data.data as MarkerType[]);

export const getPost = async (id: string | number) =>
    axios.get(`/api/event/${id}`).then(r => r.data as EventResponse);

export const createPost = async (data: FormData) =>
    axios.post('/api/event', data).then(r => r.data as CreateResponse);

export const updatePost = async (eventId: string | number, data: UpdatePostData) =>
    axios.patch(`/api/event/${eventId}`, data).then(r => r.data as CreateResponse);

export const deletePost = async (eventId: string | number) =>
    axios.delete(`/api/event/${eventId}`).then(r => r.data as CreateResponse);

export const setInterestedPost = async (eventId: string | number, interestedValue: boolean) =>
    axios.post(`/api/event/${eventId}/interested`, { interested: interestedValue }).then(r => r.data as CreateResponse);

export const setGoingPost = async (eventId: string | number, goingValue: boolean) =>
    axios.post(`/api/event/${eventId}/going`, { going: goingValue }).then(r => r.data as CreateResponse);

export const requestEventParticipation = async (eventId: string | number, friendIds: number[]) =>
    axios.post(`/api/event/${eventId}/request-participation`, { friend_ids: friendIds }).then(r => r.data as CreateResponse);
