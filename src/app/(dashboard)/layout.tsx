'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('api_token');
        const envToken = process.env.NEXT_PUBLIC_API_TOKEN;

        if (token) {
            setAuthorized(true);
        } else if (envToken) {
            // If no local token but env token exists, use it
            localStorage.setItem('api_token', envToken);
            setAuthorized(true);
        } else {
            router.push('/login');
        }
    }, [router]);

    if (!authorized) {
        return null; // Or a loading spinner
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <aside className="w-64 hidden md:block">
                <Sidebar />
            </aside>
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
