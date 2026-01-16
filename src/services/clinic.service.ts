import api from '@/lib/api';
import { ApiResponse, Clinic } from '@/types';

export const clinicService = {
    getClinics: async (params?: {
        is_active?: boolean;
        category_id?: number;
        search?: string;
        page?: number;
        per_page?: number;
    }) => {
        const response = await api.get<ApiResponse<Clinic[]>>('/clinics', { params });
        return response.data;
    },

    getClinic: async (id: number) => {
        const response = await api.get<ApiResponse<Clinic>>(`/clinics/${id}`);
        return response.data;
    },

    getClinicSchedules: async (id: number, params?: {
        from_date?: string;
        to_date?: string;
        day_of_week?: number;
        time_slot?: 'morning' | 'afternoon';
    }) => {
        const response = await api.get(`/clinics/${id}/schedules`, { params });
        return response.data;
    }
};
