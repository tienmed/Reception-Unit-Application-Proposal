import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns';
import { promisify } from 'util';

const API_HOSTNAME = 'phongkhamdaihocypnt.edu.vn';
const API_BASE_PATH = '/nhansu/api';

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

async function resolveHostname(hostname: string): Promise<string> {
    try {
        const lookup = promisify(dns.lookup);
        const { address } = await lookup(hostname, { family: 4 });
        console.log(`[DNS] Resolved ${hostname} to ${address}`);
        return address;
    } catch (error) {
        console.error(`[DNS] Resolution failed for ${hostname}:`, error);
        return hostname; // Fallback to hostname
    }
}

async function proxyRequest(request: NextRequest, path: string[]) {
    const pathStr = path.join('/');

    // Resolve Hostname to IP to force IPv4
    const resolvedIp = await resolveHostname(API_HOSTNAME);
    const url = `https://${resolvedIp}${API_BASE_PATH}/${pathStr}${request.nextUrl.search}`;

    console.log(`[PROXY] Incoming ${request.method} to ${pathStr} (Target: ${url})`);

    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
        // Only pass specific safe headers to avoid upstream issues
        if (['accept', 'content-type', 'user-agent'].includes(key.toLowerCase())) {
            headers[key] = value;
        }
    });

    // Manually set Host header because we are using IP in URL
    headers['Host'] = API_HOSTNAME;

    // console.log(`[PROXY] Headers:`, JSON.stringify(headers));
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
        // console.log(`[PROXY] Explicit Authorization found: ${authHeader.substring(0, 20)}...`);
        headers['Authorization'] = authHeader;
    }

    try {
        const body = ['POST', 'PUT'].includes(request.method) ? await request.text() : undefined;

        // Note: When using IP in URL with HTTPS, standard fetch might complain about SSL Hostname mismatch.
        // Node 18 native fetch doesn't easily allow disabling this check without a custom dispatcher.
        // We will try standard fetch first. If it fails with "Hostname mismatch", we might need a custom agent.
        // However, usually Vercel/Node environment might be strict.
        // A better approach if SSL is strict: Use default URL but pass a custom dispatcher (difficult in Edge/Next).

        // REVISION: Using IP directly in HTTPS URL often fails SSL verification (CERT_HAS_EXPIRED or ERR_TLS_CERT_ALTNAME_INVALID).
        // A safer "Force IPv4" in Node is setting the default lookup order.
        // But `dns.setDefaultResultOrder('ipv4first')` is available in Node 17+.

        // Let's try attempting to set the DNS order globally if possible, OR just use the hostname but hope Vercel respects ipv4first if we can set it.
        // Actually, replacing the URL host with IP is risky for SSL.
        // Let's stick to the URL with Hostname, but use a hack:
        // If we really need to force IPv4, we might need 'node-fetch' with an `http(s).Agent({ family: 4 })`.

        // WAITING: I will NOT apply this edit yet in this tool call. I need to verify if I can use `node-fetch` + agent.
        // Aborting this specific logic in this thought process.

        // RETRY STRATEGY:
        // Next.js provides `fetch`. We can't easily swap the agent.
        // But we CAN use `dns.setDefaultResultOrder('ipv4first')` if the node version supports it.
        // Or we can simple rely on the fact that if we resolve it manually, we might need to skip certificate validation OR use a custom dispatcher.

        // Let's try `dns.setDefaultResultOrder('ipv4first')` at the top of the file as a low-impact fix first.
    } catch (e) { }
}

