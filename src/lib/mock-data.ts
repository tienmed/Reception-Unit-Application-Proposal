import { User, Clinic, Schedule, ApiResponse, AuthResponse } from '@/types';
import { addDays, startOfWeek, format } from 'date-fns';

export const MOCK_TOKEN = 'demo';

export const isMockMode = (): boolean => {
    // Force mock mode off for integration
    return process.env.NEXT_PUBLIC_USE_MOCK === 'true';
};

// --- Mock Users (Doctors) ---
export const mockUsers: User[] = [
    { id: 1, name: 'BS. Nguyễn Văn A', email: 'a@ex.com', employee_id: 'BS01', role: 'doctor', is_active: true, doctor_profile: { specialty: 'Nội' } },
    { id: 2, name: 'BS. Trần Thị B', email: 'b@ex.com', employee_id: 'BS02', role: 'doctor', is_active: true, doctor_profile: { specialty: 'Nhi' } },
    { id: 3, name: 'BS. Lê Văn C', email: 'c@ex.com', employee_id: 'BS03', role: 'doctor', is_active: true, doctor_profile: { specialty: 'Mắt' } },
    { id: 4, name: 'BS. Phạm Thị D', email: 'd@ex.com', employee_id: 'BS04', role: 'doctor', is_active: true, doctor_profile: { specialty: 'Da liễu' } },
    { id: 5, name: 'BS. Hoàng Văn E', email: 'e@ex.com', employee_id: 'BS05', role: 'doctor', is_active: true, doctor_profile: { specialty: 'Ngoại' } },
    { id: 6, name: 'BS. Ngô Thị F', email: 'f@ex.com', employee_id: 'BS06', role: 'doctor', is_active: true, doctor_profile: { specialty: 'Tai Mũi Họng' } },
];

// --- Mock Clinics ---
export const mockClinics: Clinic[] = [
    { id: 1, name: 'P.K Nội Tổng Quát', capacity: 20, is_active: true, category: { id: 1, name: 'Nội' } },
    { id: 2, name: 'P.K Nhi', capacity: 15, is_active: true, category: { id: 2, name: 'Nhi' } },
    { id: 3, name: 'P.K Mắt', capacity: 10, is_active: true, category: { id: 3, name: 'Chuyên khoa' } },
    { id: 4, name: 'P.K Da Liễu', capacity: 10, is_active: true, category: { id: 3, name: 'Chuyên khoa' } },
    { id: 5, name: 'P.K Tai Mũi Họng', capacity: 10, is_active: true, category: { id: 3, name: 'Chuyên khoa' } },
];

// --- Mock Schedules Generator ---
const generateMockSchedules = (): Schedule[] => {
    const schedules: Schedule[] = [];
    const today = new Date();

    // Create schedules for CURRENT week, PREVIOUS week, NEXT week to allow navigation testing
    const weeks = [-1, 0, 1];

    weeks.forEach(weekOffset => {
        // Calculate start of week (Sunday)
        const weekStart = addDays(startOfWeek(today, { weekStartsOn: 0 }), weekOffset * 7);

        // Loop Mon(1) to Sat(6)
        for (let day = 1; day <= 6; day++) {
            const currentDate = addDays(weekStart, day);
            const dateStr = format(weekStart, 'yyyy-MM-dd'); // Week Start Date for grouping if needed, or API usage

            // Create Morning slots (Random 2-3 clinics active)
            const morningClinics = mockClinics.slice(0, 3); // First 3 clinics have morning
            morningClinics.forEach((clinic, idx) => {
                // Rotate doctors
                const userIndex = (day + idx + weekOffset) % mockUsers.length;
                schedules.push({
                    id: Math.random() * 10000,
                    clinic_id: clinic.id,
                    user_id: mockUsers[userIndex].id,
                    week_start_date: dateStr,
                    day_of_week: day, // 1=Mon...6=Sat. IMPORTANT: Check if getDay() returns this. getDay() 0=Sun, 1=Mon. Matches.
                    time_slot: 'morning',
                    user: mockUsers[userIndex],
                    clinic: clinic
                });
            });

            // Create Afternoon slots (Random 2 clinics active)
            const afternoonClinics = mockClinics.slice(2, 5); // Last 3 clinics
            afternoonClinics.forEach((clinic, idx) => {
                // Different doctors
                const userIndex = (day + idx + 2 + weekOffset) % mockUsers.length;
                schedules.push({
                    id: Math.random() * 10000,
                    clinic_id: clinic.id,
                    user_id: mockUsers[userIndex].id,
                    week_start_date: dateStr,
                    day_of_week: day,
                    time_slot: 'afternoon',
                    user: mockUsers[userIndex],
                    clinic: clinic
                });
            });
        }
    });

    return schedules;
};

export const mockSchedules = generateMockSchedules();

// --- Helpers to simulate API Responses ---

export const mockApiResponse = <T>(data: T): ApiResponse<T> => ({
    success: true,
    data: data,
    message: 'Mock data retrieved successfully'
});

export const mockAuthResponse: ApiResponse<AuthResponse> = {
    success: true,
    data: {
        id: 1,
        name: 'Demo User',
        abilities: ['view_dashboard', 'view_schedules'],
        is_valid: true
    }
};
