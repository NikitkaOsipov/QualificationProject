import axios from '@/lib/axios';
import type { MarkerType } from './Types'

export const getPosts = async (params?: { page?: number; search?:string }) =>
    axios.get('/api/all-events', { params }).then(r => r.data.data as MarkerType[]);

export const getPost = async (id: number) =>
    axios.get(`/api/posts/${id}`).then(r => r.data as MarkerType);

export const createPost = async (data: { title: string; body: string }) =>
    axios.post('/api/posts', data).then(r => r.data as MarkerType);