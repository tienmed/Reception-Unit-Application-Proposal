import api from '@/lib/api';
import { ApiResponse, Clinic, Schedule, User } from '@/types';
import { isMockMode, mockClinics, mockApiResponse, mockSchedules, mockUsers } from '@/lib/mock-data';

export const clinicService = {
    async getClinics(params?: {
        is_active?: boolean;
        category_id?: number;
        search?: string;
        per_page?: number;
    }): Promise<ApiResponse<Clinic[]>> {
        if (isMockMode()) {
            return mockApiResponse(mockClinics);
        }
        const response = await api.get<ApiResponse<Clinic[]>>('/clinics', { params });
        return response.data;
    },

    async getClinic(id: number): Promise<ApiResponse<Clinic>> {
        if (isMockMode()) {
            const clinic = mockClinics.find(c => c.id === id);
            if (!clinic) throw new Error('Clinic not found');
            return mockApiResponse(clinic);
        }
        const response = await api.get<ApiResponse<Clinic>>(`/clinics/${id}`);
        return response.data;
    },

    async getClinicSchedules(id: number, params?: {
        from_date?: string;
        to_date?: string;
        day_of_week?: number;
        time_slot?: 'morning' | 'afternoon';
    }): Promise<ApiResponse<Schedule[]>> {
        if (isMockMode()) {
            const schedules = mockSchedules.filter(s => s.clinic_id === id);
            return mockApiResponse(schedules);
        }
        const response = await api.get<ApiResponse<Schedule[]>>(`/clinics/${id}/schedules`, { params });
        return response.data;
    },

    async getClinicStaff(id: number): Promise<ApiResponse<User[]>> {
        if (isMockMode()) {
            // Basic mock
            return mockApiResponse(mockUsers);
        }
        const response = await api.get<ApiResponse<User[]>>(`/clinics/${id}/staff`);
        return response.data;
    }
};
