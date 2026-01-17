import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://phongkhamdaihocypnt.edu.vn/nhansu/api';

export async function GET(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
    const params = await props.params;
    return proxyRequest(request, params.path);
}

export async function POST(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
    const params = await props.params;
    return proxyRequest(request, params.path);
}

export async function PUT(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
    const params = await props.params;
    return proxyRequest(request, params.path);
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ path: string[] }> }) {
    const params = await props.params;
    return proxyRequest(request, params.path);
}

async function proxyRequest(request: NextRequest, path: string[]) {
    const pathStr = path.join('/');
    const url = `${API_BASE_URL}/${pathStr}${request.nextUrl.search}`;

    console.log(`[PROXY] Incoming ${request.method} to ${pathStr}`);

    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
        // Pass important headers, skip host/connection specific ones
        // Also skip authorization here to avoid duplication (we handle it explicitly below)
        if (!['host', 'connection', 'content-length', 'authorization'].includes(key)) {
            headers[key] = value;
        }
    });

    // console.log(`[PROXY] Headers:`, JSON.stringify(headers));
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
        // console.log(`[PROXY] Explicit Authorization found: ${authHeader.substring(0, 20)}...`);
        headers['Authorization'] = authHeader;
    }

    try {
        const body = ['POST', 'PUT'].includes(request.method) ? await request.text() : undefined;

        const response = await fetch(url, {
            method: request.method,
            headers: headers,
            body: body,
            // Disable auto-redirect following to trace 302s if any
            redirect: 'manual'
        });

        console.log(`[PROXY] Upstream Status: ${response.status}`);

        const responseBody = await response.text();
        console.log(`[PROXY] Upstream Body Preview: ${responseBody.substring(0, 200)}`);

        // Create new headers to pass back
        const responseHeaders = new Headers();
        response.headers.forEach((value, key) => {
            responseHeaders.set(key, value);
        });

        return new NextResponse(responseBody, {
            status: response.status,
            headers: responseHeaders
        });

    } catch (error: any) {
        console.error('[PROXY] Error:', error);
        return NextResponse.json({ success: false, message: 'Proxy Error', error: error.message }, { status: 500 });
    }
}
