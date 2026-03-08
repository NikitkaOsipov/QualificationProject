import axios from '@/lib/axios';
import type { MarkerType } from './Types'

export const getPosts = async (params?: { page?: number; search?:string }) =>
    axios.get('/api/all-events', { params }).then(r => r.data.data as MarkerType[]);

export const getPost = async (id: string | number) =>
    axios.get(`/api/event/${id}`).then(r => r.data.data as MarkerType);

export const createPost = async (data: any) =>
    axios.post('/api/event', data).then(r => r.data as MarkerType);