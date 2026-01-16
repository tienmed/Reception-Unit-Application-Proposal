import api from '@/lib/api';
import { ApiResponse, Schedule } from '@/types';

export const scheduleService = {
    getSchedules: async (params: {
        from_date?: string;
        to_date?: string;
        clinic_id?: number;
        user_id?: number;
        time_slot?: 'morning' | 'afternoon';
    }) => {
        const response = await api.get<ApiResponse<Schedule[]>>('/schedules', { params });
        return response.data;
    },

    getWeeklySchedules: async (date?: string) => {
        const response = await api.get<ApiResponse<{
            week_start: string;
            week_end: string;
            schedules: Record<string, Schedule[]>;
            total: number;
        }>>('/schedules/weekly', { params: { week_start: date } });
        return response.data;
    },

    getDailySchedules: async (date?: string) => {
        const response = await api.get<ApiResponse<{
            date: string;
            day_of_week: number;
            schedules: Schedule[];
            total: number;
        }>>('/schedules/daily', { params: { date } });
        return response.data;
    }
};
