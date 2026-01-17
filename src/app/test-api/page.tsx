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

    const fetchData = async () => {
        setLoading(true);
        setError('');
        setLogs([]);
        addLog('Starting data fetch...');
        addLog(`Config: ${headerName}: ${tokenPrefix}***`);

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (token) {
            headers[headerName] = `${tokenPrefix}${token}`;
        }

        try {
            // Manual fetch to bypass global interceptor for this test
            addLog('Fetching Users via /api/users...');
            const userRes = await fetch('/api/users', { headers });
            const userStatus = userRes.status;
            addLog(`Users Status: ${userStatus} ${userRes.statusText}`);

            if (userRes.ok) {
                const data = await userRes.json();
                if (data.success) {
                    setUsers(data.data);
                    addLog(`Loaded ${data.data.length} users.`);
                } else {
                    addLog(`API Response Error: ${data.message}`);
                }
            } else {
                const text = await userRes.text();
                addLog(`Error Body: ${text.substring(0, 100)}...`);
                throw new Error(`HTTP ${userStatus}`);
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
            <h1 className="text-3xl font-bold">API Connectivity Test (Advanced)</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Auth Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Header Name</label>
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={headerName}
                                onChange={(e) => setHeaderName(e.target.value)}
                                placeholder="Authorization"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Prefix (e.g. 'Bearer ')</label>
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={tokenPrefix}
                                onChange={(e) => setTokenPrefix(e.target.value)}
                                placeholder="Bearer "
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Token</label>
                            <input
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                type="password"
                            />
                        </div>
                    </div>

                    <Button onClick={fetchData} disabled={loading} className="w-full">
                        {loading ? 'Fetching via Proxy...' : 'Test Connection'}
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
