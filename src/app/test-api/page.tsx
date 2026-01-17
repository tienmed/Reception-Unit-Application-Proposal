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

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        setLogs([]);
        addLog('Starting data fetch...');

        try {
            // Fetch Users
            addLog('Fetching Users...');
            const userRes = await userService.getUsers();
            addLog(`Users Response Status: ${userRes.success ? 'Success' : 'Failed'}`);
            if (userRes.success) {
                setUsers(userRes.data);
                addLog(`Loaded ${userRes.data.length} users.`);
            } else {
                addLog(`User Error: ${userRes.message}`);
            }

            // Fetch Clinics
            addLog('Fetching Clinics...');
            const clinicRes = await clinicService.getClinics();
            addLog(`Clinics Response Status: ${clinicRes.success ? 'Success' : 'Failed'}`);
            if (clinicRes.success) {
                setClinics(clinicRes.data);
                addLog(`Loaded ${clinicRes.data.length} clinics.`);
            } else {
                addLog(`Clinic Error: ${clinicRes.message}`);
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
            <h1 className="text-3xl font-bold">API Connectivity Test</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Control Panel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button onClick={fetchData} disabled={loading}>
                        {loading ? 'Fetching...' : 'Run Test Fetch'}
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
