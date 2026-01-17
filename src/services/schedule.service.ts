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
        time_slot?: 'morning' | 'afternoon';
    }): Promise<ApiResponse<Schedule[]>> => {
        if (isMockMode()) {
            return mockApiResponse(mockSchedules);
        }
        const response = await api.get<ApiResponse<Schedule[]>>('/schedules', { params });
        return response.data;
    },

    getWeeklySchedules: async (date?: string) => {
        if (isMockMode()) {
            // Group mock schedules by "dayIndex_timeSlot"
            // Mock data day_of_week: 1 (Mon) .. 6 (Sat).
            // Key format expected: "1_morning", "2_afternoon" etc.
            const grouped: Record<string, Schedule[]> = {};

            mockSchedules.forEach(s => {
                const key = `${s.day_of_week}_${s.time_slot}`;
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(s);
            });

            return mockApiResponse({
                week_start: date || '',
                week_end: '', // Not strictly needed for mock display
                schedules: grouped,
                total: mockSchedules.length
            });
        }

        const response = await api.get<ApiResponse<{
            week_start: string;
            week_end: string;
            schedules: Record<string, Schedule[]>;
            total: number;
        }>>('/schedules/weekly', { params: { week_start: date } });
        return response.data;
    },

    getDailySchedules: async (date: string): Promise<ApiResponse<{ total: number; schedules: Schedule[] }>> => {
        if (isMockMode()) {
            const daily = mockSchedules.filter(s => {
                // Simplified check, normally would check date match
                // For demo, just return a subset
                return true;
            });
            return mockApiResponse({ total: daily.length, schedules: daily });
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
