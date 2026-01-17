
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const token = process.env.NEXT_PUBLIC_API_TOKEN;
    if (!token) {
        return NextResponse.json({ error: 'No Token Env' }, { status: 500 });
    }

    const headers = {
        'Authorization': `Bearer ${token}`
    };

    const fetchJson = async (path: string) => {
        try {
            const res = await fetch(`https://phongkhamdaihocypnt.edu.vn/nhansu/api/${path}`, { headers });
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await res.json();
            }
            return { error: 'Not JSON', status: res.status, text: await res.text() };
        } catch (e: any) {
            return { error: e.message };
        }
    };

    const [users, clinics, schedules] = await Promise.all([
        fetchJson('users?role=doctor&is_active=true'),
        fetchJson('clinics?is_active=true'),
        fetchJson('schedules/weekly')
    ]);

    return NextResponse.json({
        diagnostics: {
            tokenStart: token.substring(0, 5),
            timestamp: new Date().toISOString()
        },
        data: {
            users,
            clinics,
            schedules
        }
    });
}
