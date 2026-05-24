import axios from '@/lib/axios'
import type { User } from '@/utils/Types'
import type { LaravelStatusResponse } from '@/utils/response_helper'

interface AdminUsersResponse {
    data: User[];
    meta: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}

export const getAdminUsers = async (params?: { search?: string; page?: number; per_page?: number }) =>
    axios.get('/api/admin/users', { params }).then((r) => r.data as AdminUsersResponse);

export const updateAdminUser = async (
    userId: number,
    params: { name: string; email: string; role: 'user' | 'admin' },
) => axios.patch(`/api/admin/users/${userId}`, params).then((r) => r.data as LaravelStatusResponse);

export const deleteAdminUser = async (userId: number) =>
    axios.delete(`/api/admin/users/${userId}`).then((r) => r.data as LaravelStatusResponse);
