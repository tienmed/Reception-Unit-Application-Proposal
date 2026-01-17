import { NextRequest, NextResponse } from 'next/server';
import { Clinic, Schedule } from '@/types';

// Constants for upstream API
const API_HOSTNAME = 'phongkhamdaihocypnt.edu.vn';
const API_BASE_PATH = '/nhansu/api';
const UPSTREAM_URL = `https://${API_HOSTNAME}${API_BASE_PATH}`;

// Helper to fetch from upstream (Server-to-Server)
async function fetchUpstream<T>(path: string, params: Record<string, string>, token: string): Promise<T | null> {
    const query = new URLSearchParams(params).toString();
    const url = `${UPSTREAM_URL}${path}?${query}`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000); // 9s timeout

        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Host': API_HOSTNAME // Explicit Host header
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            console.error(`[BFF] Upstream Fetch Error ${path}: ${res.status} ${res.statusText}`);
            return null;
        }

        const json = await res.json();
        return json.data as T; // Assuming { success: true, data: T }
    } catch (error) {
        console.error(`[BFF] Fetch Exception ${path}:`, error);
        return null;
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const weekStart = searchParams.get('week_start'); // yyyy-MM-dd
    const weekEnd = searchParams.get('week_end');     // yyyy-MM-dd

    // Auth from client request
    const authHeader = request.headers.get('authorization');
    const envToken = process.env.NEXT_PUBLIC_API_TOKEN;
    const token = envToken || (authHeader ? authHeader.replace('Bearer ', '') : '');

    if (!token) {
        return NextResponse.json({ success: false, message: 'Missing Token' }, { status: 401 });
    }

    if (!weekStart || !weekEnd) {
        return NextResponse.json({ success: false, message: 'Missing Date Range' }, { status: 400 });
    }

    // 1. Fetch Data in Parallel
    const [clinics, schedules] = await Promise.all([
        fetchUpstream<Clinic[]>('/clinics', { is_active: 'true', per_page: '100' }, token),
        fetchUpstream<Schedule[]>('/schedules', { from_date: weekStart, to_date: weekEnd, per_page: '1000' }, token)
    ]);

    if (!clinics) {
        return NextResponse.json({ success: false, message: 'Failed to load clinics' }, { status: 502 });
    }

    // 2. Filter Clinics (Client requirement: "Phòng khám" only)
    // IDs: 2, 3, 5, 6
    const validCategoryIds = [2, 3, 5, 6];
    const filteredClinics = clinics.filter(c => validCategoryIds.includes(c.category_id || 0));

    // 3. Build Grid Map
    // Result format: { [clinic_id]: { clinic: Clinic, days: { [date_slot]: Schedule } } }

    const validClinicIds = new Set(filteredClinics.map(c => c.id));

    // Group schedules by Clinic AND TimeSlot
    const scheduleyMap: Record<string, Schedule> = {};
    if (schedules) {
        schedules.forEach(s => {
            if (!validClinicIds.has(s.clinic_id)) return; // Skip checking irrelevant clinics

            // Use derived date from week_start_date (API returns it) 
            // OR simpler: we rely on day_of_week if we want relative index. 
            // BUT UI needs date matching.
            // API Schedule struct: week_start_date (Monday?), day_of_week (0-6 or 1-7?)
            // Step 568 output: "week_start_date": "2026-01-12...", "day_of_week": 1 (Monday?)

            // Let's create a composite key: "clinicId_dayOfWeek_timeSlot"
            // Assumption: day_of_week is reliable.
            // Check usage in Step 541: `const key = ${schedule.day_of_week}_${schedule.time_slot}`;`

            const key = `${s.clinic_id}_${s.day_of_week}_${s.time_slot}`;
            scheduleyMap[key] = s;
        });
    }

    // 4. Construct lightweight view
    const rows = filteredClinics.map(clinic => {
        return {
            id: clinic.id,
            name: clinic.name,
            location: clinic.location, // Useful for UI
            schedules: {
                // Pre-calculate slots for days 0-6 (Sun-Sat) or 1-7 (Mon-Sun)?
                // API day_of_week seems to be 0=Sun, 1=Mon... wait, logic in Step 422 used `addDays(weekStart, i+1)` for Mon-Sat.
                // Let's just return the map/array of schedules valid for this clinic
                // and let Frontend verify day matches.
                // Or better: Return key-value for easy lookup.
            }
        };
    });

    // Actually, passing the schedules list (filtered) is safer than pre-grid construction 
    // because Frontend Date logic is complex (Locales).
    // Let's just return the Filtered Lists.
    // "Merger" means "Get me everything in one call".

    const mergedData = {
        clinics: filteredClinics,
        schedules: schedules ? schedules.filter(s => validClinicIds.has(s.clinic_id)) : []
    };

    return NextResponse.json({
        success: true,
        data: mergedData
    });
}
