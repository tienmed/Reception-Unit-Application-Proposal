import api from '@/lib/api';
import { ApiResponse, AuthResponse } from '@/types';

export const authService = {
    verifyToken: async (token: string): Promise<ApiResponse<AuthResponse>> => {
        // We temporarily set the token in header for this specific request if needed, 
        // or we assume the caller has already stored it. 
        // However, to verify a *new* token, we should probably pass it in the header explicitly.
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
