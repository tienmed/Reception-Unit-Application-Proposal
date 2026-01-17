import api from '@/lib/api';
import { ApiResponse, User, Schedule } from '@/types';
import { isMockMode, mockUsers, mockApiResponse, mockSchedules } from '@/lib/mock-data';

export const userService = {
    async getUsers(params?: {
        role?: string;
        is_active?: boolean;
        search?: string;
        per_page?: number;
        page?: number;
    }): Promise<ApiResponse<User[]>> {
        if (isMockMode()) {
            let users = [...mockUsers];
            if (params?.search) {
                const lowerQuery = params.search.toLowerCase();
                users = users.filter(u => u.name.toLowerCase().includes(lowerQuery));
            }
            if (params?.role) {
                users = users.filter(u => u.role === params.role);
            }
            return mockApiResponse(users);
        }
        const response = await api.get<ApiResponse<User[]>>('/users', { params });
        return response.data;
    },

    async getUser(id: number): Promise<ApiResponse<User>> {
        if (isMockMode()) {
            const user = mockUsers.find(u => u.id === id);
            if (!user) throw new Error('User not found');
            return mockApiResponse(user);
        }
        const response = await api.get<ApiResponse<User>>(`/users/${id}`);
        return response.data;
    },

    async getUserSchedules(id: number, params?: {
        from_date?: string;
        to_date?: string;
    }): Promise<ApiResponse<Schedule[]>> {
        if (isMockMode()) {
            const schedules = mockSchedules.filter(s => s.user_id === id);
            return mockApiResponse(schedules);
        }
        const response = await api.get<ApiResponse<Schedule[]>>(`/users/${id}/schedules`, { params });
        return response.data;
    }
};
