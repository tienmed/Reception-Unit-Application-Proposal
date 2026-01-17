export interface User {
    id: number;
    name: string;
    email: string;
    employee_id: string;
    cccd_number?: string;
    role: string;
    is_active: boolean;
    created_at?: string;
    doctor_profile?: {
        specialty: string;
        phone?: string;
    };
    legal_schedules?: any[]; // Refine type if legal_schedule structure is known
    assigned_clinics?: any[]; // Refine type if assigned_clinics structure is known
    clinic_schedules?: any[]; // Refine type if clinic_schedules structure is known
}

export interface Clinic {
    id: number;
    name: string;
    capacity: number;
    is_active: boolean;
    category_id?: number; // Added to match API response
    category?: {
        id: number;
        name: string;
    };
    staff?: User[];
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
