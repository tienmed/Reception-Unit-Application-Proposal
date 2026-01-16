export interface User {
    id: number;
    name: string;
    email: string;
    employee_id: string;
    role: string;
    is_active: boolean;
    doctor_profile?: {
        specialty: string;
        phone?: string;
    };
}

export interface Clinic {
    id: number;
    name: string;
    capacity: number;
    is_active: boolean;
    category?: {
        id: number;
        name: string;
    };
}

export interface Schedule {
    id: number;
    clinic_id: number;
    user_id: number;
    week_start_date: string;
    day_of_week: number;
    time_slot: 'morning' | 'afternoon';
    notes?: string | null;
    user?: User;
    clinic?: Clinic;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    pagination?: {
        current_page: number;
        per_page: number;
        total: number;
        last_page: number;
    };
}

export interface AuthResponse {
    id: number;
    name: string;
    abilities: string[];
    is_valid: boolean;
}
