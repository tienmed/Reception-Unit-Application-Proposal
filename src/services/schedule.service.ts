import api from '@/lib/api';
import { ApiResponse, Schedule } from '@/types';
import { isMockMode, mockSchedules, mockApiResponse } from '@/lib/mock-data';
import { format } from 'date-fns';

export const scheduleService = {
    getSchedules: async (params: {
        from_date?: string;
        to_date?: string;
        clinic_id?: number;
        user_id?: number;
        day_of_week?: number;
        time_slot?: 'morning' | 'afternoon';
        per_page?: number;
    }): Promise<ApiResponse<Schedule[]>> => {
        if (isMockMode()) {
            return mockApiResponse(mockSchedules);
        }
        const response = await api.get<ApiResponse<Schedule[]>>('/schedules', { params });
        return response.data;
    },

    getWeeklySchedules: async (week_start?: string) => {
        if (isMockMode()) {
            const grouped: Record<string, Schedule[]> = {};
            mockSchedules.forEach(s => {
                const key = `${s.day_of_week}_${s.time_slot}`;
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(s);
            });

            return mockApiResponse({
                week_start: week_start || '',
                week_end: '',
                schedules: grouped,
                total: mockSchedules.length
            });
        }

        const response = await api.get<ApiResponse<{
            week_start: string;
            week_end: string;
            schedules: Record<string, Schedule[]>;
            total: number;
        }>>('/schedules/weekly', { params: { week_start } });
        return response.data;
    },

    getDailySchedules: async (date: string): Promise<ApiResponse<{
        date: string;
        day_of_week: number;
        schedules: Schedule[];
        total: number;
    }>> => {
        if (isMockMode()) {
            const daily = mockSchedules.filter(s => true); // Mock logic
            return mockApiResponse({
                date,
                day_of_week: new Date(date).getDay(),
                schedules: daily,
                total: daily.length
            });
        }
        const response = await api.get<ApiResponse<{
            date: string;
            day_of_week: number;
            schedules: Schedule[];
            total: number;
        }>>('/schedules/daily', { params: { date } });
        return response.data;
    }
};
