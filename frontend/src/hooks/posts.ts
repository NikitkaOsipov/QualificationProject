import axios from 'axios'

export interface Post { id: number; title: string; body: string; created_at: string; updated_at: string; }

export const fetchPosts = async (params?: { page?: number; search?:string }) =>
    axios.get('/api/posts', { params }).then(r => r.data as { data: Post[], meta?: any});

export const fetchPost = async (id: number) =>
    axios.get(`/api/posts/${id}`).then(r => r.data as Post);

export const createPost = async (data: { title: string; body: string }) =>
    axios.post('/api/posts', data).then(r => r.data as Post);