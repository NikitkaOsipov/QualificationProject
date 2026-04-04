import axios from '@/lib/axios';
import type { CreateResponse, EventResponse, MarkerType } from './Types'

export const getPosts = async (params?: { page?: number; search?:string }) =>
    axios.get('/api/all-events', { params }).then(r => r.data.data as MarkerType[]);

export const getPost = async (id: string | number) =>
    axios.get(`/api/event/${id}`).then(r => r.data as EventResponse);

export const createPost = async (data: FormData) =>
    axios.post('/api/event', data).then(r => r.data as CreateResponse);

export const setInterestedPost = async (eventId: string | number, interestedValue: boolean) =>
    axios.post(`/api/event/${eventId}/interested`, { interested: interestedValue }).then(r => r.data as CreateResponse);

export const setGoingPost = async (eventId: string | number, goingValue: boolean) =>
    axios.post(`/api/event/${eventId}/going`, { going: goingValue }).then(r => r.data as CreateResponse);