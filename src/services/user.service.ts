import api from '@/lib/api';
import { ApiResponse, User } from '@/types';

export const userService = {
    getUsers: async (params?: {
        role?: string;
        is_active?: boolean;
        search?: string;
        page?: number;
        per_page?: number;
    }) => {
        const response = await api.get<ApiResponse<User[]>>('/users', { params });
        return response.data;
    },

    getUser: async (id: number) => {
        const response = await api.get<ApiResponse<User>>(`/users/${id}`);
        return response.data;
    },

    getUserSchedules: async (id: number, params?: { from_date?: string; to_date?: string }) => {
        const response = await api.get(`/users/${id}/schedules`, { params });
        return response.data;
    }
};
