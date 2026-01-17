'use client';

import { useState, useEffect } from 'react';
import { userService } from '@/services/user.service';
import { Clinic, User } from '@/types';
import { clinicService } from '@/services/clinic.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function TestApiPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [logs, setLogs] = useState<string[]>([]);

    // Auth Config State
    const [endpoint, setEndpoint] = useState('/api/users');
    const [token, setToken] = useState('');
    const [headerName, setHeaderName] = useState('Authorization');
    const [tokenPrefix, setTokenPrefix] = useState('Bearer ');

    useEffect(() => {
        // Load env token on mount
        if (typeof window !== 'undefined') {
            setToken(localStorage.getItem('api_token') || process.env.NEXT_PUBLIC_API_TOKEN || '');
        }
    }, []);

    const addLog = (msg: string) => setLogs(prev => [`${new Date().toLocaleTimeString()}: ${msg}`, ...prev]);

    const applyPreset = (name: string, prefix: string) => {
        setHeaderName(name);
        setTokenPrefix(prefix);
        addLog(`Applied Preset: ${name} with prefix '${prefix}'`);
    };

    const fetchData = async () => {
        setLoading(true);
        setError('');
        setLogs([]);
        addLog(`Starting fetch to ${endpoint}...`);
        addLog(`Header: ${headerName}`);
        addLog(`Prefix: '${tokenPrefix}'`);
        addLog(`Token Length: ${token.length}`);

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (token) {
            headers[headerName] = `${tokenPrefix}${token}`;
        }

        try {
            const res = await fetch(endpoint, { headers });
            addLog(`Status: ${res.status} ${res.statusText}`);

            const text = await res.text();
            try {
                const data = JSON.parse(text);
                addLog(`Response JSON: ${JSON.stringify(data).substring(0, 150)}...`);

                if (data.success || Array.isArray(data)) {
                    // Try to guess data type for display
                    if (endpoint.includes('users')) setUsers(data.data || data);
                    if (endpoint.includes('clinics')) setClinics(data.data || data);
                }
            } catch (e) {
                addLog(`Response Body (Not JSON): ${text.substring(0, 200)}...`);
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Unknown error occurred');
            addLog(`EXCEPTION: ${err.message}`);
        } finally {
            setLoading(false);
            addLog('Fetch complete.');
        }
    };

    return (
        <div className="p-8 space-y-6 container mx-auto">
            <h1 className="text-3xl font-bold">API Debugger</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Target Endpoint</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={endpoint}
                                onChange={(e) => setEndpoint(e.target.value)}
                            >
                                <option value="/api/users">/api/users (Doctors)</option>
                                <option value="/api/clinics">/api/clinics</option>
                                <option value="/api/schedules/daily">/api/schedules/daily</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quick Presets</label>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => applyPreset('Authorization', 'Bearer ')}>Bearer Token</Button>
                                <Button variant="outline" size="sm" onClick={() => applyPreset('Authorization', '')}>Raw Token</Button>
                                <Button variant="outline" size="sm" onClick={() => applyPreset('x-api-key', '')}>API Key</Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 border-t pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Header Name</label>
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={headerName}
                                onChange={(e) => setHeaderName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Prefix</label>
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={tokenPrefix}
                                onChange={(e) => setTokenPrefix(e.target.value)}
                                placeholder="(none)"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Token (Last 4: {token.slice(-4)})</label>
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                type="password"
                            />
                        </div>
                    </div>

                    <Button onClick={fetchData} disabled={loading} className="w-full">
                        {loading ? 'Testing...' : 'Test Connection'}
                    </Button>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
                            <strong>Error:</strong> {error}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Users (Doctors) - Count: {users.length}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 max-h-[400px] overflow-auto">
                            {users.map(u => (
                                <li key={u.id} className="p-2 border rounded shadow-sm">
                                    <div className="font-bold">{u.name}</div>
                                    <div className="text-sm text-gray-500">{u.email} - {u.employee_id}</div>
                                    <Badge variant={u.is_active ? 'default' : 'destructive'}>
                                        {u.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Clinics - Count: {clinics.length}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 max-h-[400px] overflow-auto">
                            {clinics.map(c => (
                                <li key={c.id} className="p-2 border rounded shadow-sm">
                                    <div className="font-bold">{c.name}</div>
                                    <div className="text-sm text-gray-500">Capacity: {c.capacity}</div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Debug Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-black text-green-400 p-4 rounded-md font-mono text-xs h-[200px] overflow-auto">
                        {logs.map((log, i) => (
                            <div key={i}>{log}</div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
