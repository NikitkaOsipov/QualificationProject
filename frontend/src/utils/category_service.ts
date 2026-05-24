import axios from '@/lib/axios';
import type { Category } from '@/utils/Types'
import type { LaravelStatusResponse } from '@/utils/response_helper'


// Public endpoints
export const getCategories = async (): Promise<Category[]> =>
    axios.get('/api/categories').then(r => r.data as Category[]);

export const getCategory = async (id: number | string): Promise<Category> =>
    axios.get(`/api/categories/${id}`).then(r => r.data as Category);

// Admin endpoints (require authentication)
export const createCategory = async (name: string): Promise<LaravelStatusResponse> =>
    axios.post('/api/categories', { name }).then(r => r.data as LaravelStatusResponse);

export const updateCategory = async (id: number | string, name: string): Promise<LaravelStatusResponse> =>
    axios.patch(`/api/categories/${id}`, { name }).then(r => r.data as LaravelStatusResponse);

export const deleteCategory = async (id: number | string): Promise<LaravelStatusResponse> =>
    axios.delete(`/api/categories/${id}`).then(r => r.data as LaravelStatusResponse);
