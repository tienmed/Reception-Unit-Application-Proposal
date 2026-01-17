
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const token = process.env.NEXT_PUBLIC_API_TOKEN;

    const diagnostics = {
        envVarFound: !!token,
        tokenLength: token?.length || 0,
        tokenPreview: token ? `${token.substring(0, 5)}...${token.substring(token.length - 5)}` : 'N/A',
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    };

    try {
        if (!token) {
            return NextResponse.json({ ...diagnostics, message: 'FAIL: Token not found in env vars' }, { status: 500 });
        }

        const url = 'https://phongkhamdaihocypnt.edu.vn/nhansu/api/clinics';
        console.log(`[DEBUG] Fetching ${url}`);

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'Debugging-Script/1.0 (Vercel)'
            }
        });

        const text = await response.text();

        return NextResponse.json({
            ...diagnostics,
            upstreamStatus: response.status,
            upstreamBodyPrefix: text.substring(0, 200),
            connectionSuccess: response.status === 200
        });
    } catch (error: any) {
        return NextResponse.json({
            ...diagnostics,
            connectionError: error.message
        }, { status: 500 });
    }
}
