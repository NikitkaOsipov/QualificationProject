import axios from '@/lib/axios';
import { CreateResponse, Category } from '@/utils/Types'


// Public endpoints
export const getCategories = async (): Promise<Category[]> =>
    axios.get('/api/categories').then(r => r.data as Category[]);

export const getCategory = async (id: number | string): Promise<Category> =>
    axios.get(`/api/categories/${id}`).then(r => r.data as Category);

// Admin endpoints (require authentication)
export const createCategory = async (name: string): Promise<CreateResponse> =>
    axios.post('/api/categories', { name }).then(r => r.data as CreateResponse);

export const updateCategory = async (id: number | string, name: string): Promise<CreateResponse> =>
    axios.patch(`/api/categories/${id}`, { name }).then(r => r.data as CreateResponse);

export const deleteCategory = async (id: number | string): Promise<CreateResponse> =>
    axios.delete(`/api/categories/${id}`).then(r => r.data as CreateResponse);
