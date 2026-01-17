import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns';
import { promisify } from 'util';

const API_HOSTNAME = 'phongkhamdaihocypnt.edu.vn';
const API_BASE_PATH = '/nhansu/api';

// Force IPv4 first if supported (Node 17+) to avoid Vercel IPv6 timeouts
if (dns.setDefaultResultOrder) {
    try {
        dns.setDefaultResultOrder('ipv4first');
    } catch (e) {
        // Ignore if already set or not supported
    }
}

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
    // Use Hostname directly (rely on dns.setDefaultResultOrder for IPv4)
    // Using IP directly causes SSL Hostname Mismatch errors.
    const url = `https://${API_HOSTNAME}${API_BASE_PATH}/${pathStr}${request.nextUrl.search}`;

    console.log(`[PROXY] Incoming ${request.method} to ${pathStr} (Target: ${url})`);

    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
        // Only pass specific safe headers to avoid upstream issues
        if (['accept', 'content-type', 'user-agent'].includes(key.toLowerCase())) {
            headers[key] = value;
        }
    });

    // Explicitly set Host header
    headers['Host'] = API_HOSTNAME;

    // console.log(`[PROXY] Headers:`, JSON.stringify(headers));
    // Debug Env Token presence
    const envToken = process.env.NEXT_PUBLIC_API_TOKEN;
    console.log(`[PROXY] Env Token Present: ${!!envToken}, Length: ${envToken?.length || 0}`);

    // FORCE OVERRIDE: Always use the Server-Side Environment Token if available.
    // This fixes issues where the Client (Browser) might send an old/cached/invalid token or 
    // where the Client build didn't pick up the new Env Var.
    if (envToken) {
        headers['Authorization'] = `Bearer ${envToken}`;
        console.log(`[PROXY] Force-Injected token from env: Bearer ${envToken.substring(0, 10)}...`);
    } else {
        // Only verify client header if we don't have a server token (Fallback)
        const authHeader = request.headers.get('authorization');
        if (authHeader) {
            headers['Authorization'] = authHeader;
            console.log(`[PROXY] Using Client Authorization header`);
        } else {
            console.warn('[PROXY] No Token found in Request or Env!');
        }
    }

    try {
        const body = ['POST', 'PUT'].includes(request.method) ? await request.text() : undefined;

        const response = await fetch(url, {
            method: request.method,
            headers: headers,
            body: body,
            redirect: 'manual'
        });

        console.log(`[PROXY] Upstream Status: ${response.status}`);

        const responseBody = await response.text();
        if (response.status !== 200) {
            console.log(`[PROXY] Upstream Error Body: ${responseBody}`);
        }

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
        // Safe error object for JSON (avoid circular structure crashes)
        const safeError = {
            message: error.message || 'Unknown Error',
            code: error.code || 'UNKNOWN',
            name: error.name || 'Error'
        };
        return NextResponse.json({ success: false, message: 'Proxy Error', error: safeError }, { status: 500 });
    }
}
