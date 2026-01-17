import api from '@/lib/api';
import { ApiResponse, User, Schedule } from '@/types';
import { isMockMode, mockUsers, mockApiResponse, mockSchedules } from '@/lib/mock-data';

export const userService = {
    async getUsers(params?: any): Promise<ApiResponse<User[]>> {
        if (isMockMode()) {
            let users = [...mockUsers];
            // Simple search mock
            if (params?.search) {
                const lowerQuery = params.search.toLowerCase();
                users = users.filter(u => u.name.toLowerCase().includes(lowerQuery));
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

    async getUserSchedules(id: number, params?: any): Promise<ApiResponse<Schedule[]>> {
        if (isMockMode()) {
            const schedules = mockSchedules.filter(s => s.user_id === id);
            return mockApiResponse(schedules);
        }
        const response = await api.get<ApiResponse<Schedule[]>>(`/users/${id}/schedules`, { params });
        return response.data;
    }
};
