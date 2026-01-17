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

    // FORCE OVERRIDE: Always use the Server-Side Environment Token if available.
    // This fixes issues where the Client (Browser) might send an old/cached/invalid token.
    const envToken = process.env.NEXT_PUBLIC_API_TOKEN;
    if (envToken) {
        headers['Authorization'] = `Bearer ${envToken}`;
    } else {
        // Fallback to client header
        const authHeader = request.headers.get('authorization');
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }
    }

    try {
        const body = ['POST', 'PUT'].includes(request.method) ? await request.text() : undefined;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000); // 9 second timeout (Vercel limit is 10s)

        const response = await fetch(url, {
            method: request.method,
            headers: headers,
            body: body,
            redirect: 'manual',
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const responseBody = await response.text();

        // Create new headers to pass back
        const responseHeaders = new Headers();
        response.headers.forEach((value, key) => {
            responseHeaders.set(key, value);
        });

        // OPTIMIZATION: Add Cache-Control for GET requests to mitigate slow upstream response.
        // Vercel will cache this for 60s (s-maxage) and serve stale data for 5 mins (stale-while-revalidate)
        // while fetching fresh data in the background. This hides the 10s+ latency from users.
        if (request.method === 'GET' && response.status === 200) {
            responseHeaders.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
        }

        return new NextResponse(responseBody, {
            status: response.status,
            headers: responseHeaders
        });

    } catch (error: any) {
        console.error('[PROXY] Error:', error);

        let status = 500;
        let message = 'Proxy Error';

        if (error.name === 'AbortError') {
            status = 504; // Gateway Timeout
            message = 'Upstream API Timed Out (Vercel Proxy Limit)';
        } else if (error.code === 'ECONNREFUSED') {
            status = 502; // Bad Gateway
            message = 'Connection Refused';
        } else if (error.code === 'ENOTFOUND') {
            status = 502;
            message = 'DNS Lookup Failed';
        }

        const safeError = {
            message: error.message || message,
            code: error.code || 'UNKNOWN',
            name: error.name || 'Error'
        };
        return NextResponse.json({ success: false, message: message, error: safeError }, { status });
    }
}
