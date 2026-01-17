import api from '@/lib/api';
import { ApiResponse, AuthResponse } from '@/types';
import { MOCK_TOKEN, mockAuthResponse } from '@/lib/mock-data';

export const authService = {
    verifyToken: async (token: string): Promise<ApiResponse<AuthResponse>> => {
        if (token === MOCK_TOKEN) {
            return new Promise((resolve) => {
                setTimeout(() => resolve(mockAuthResponse), 500); // Simulate delay
            });
        }

        const response = await api.get<ApiResponse<AuthResponse>>('/auth/verify', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('api_token');
        window.location.href = '/login';
    }
};
