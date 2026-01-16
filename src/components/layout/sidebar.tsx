'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Calendar, Users, Building2, LogOut } from 'lucide-react';
import { authService } from '@/services/auth.service';

const sidebarItems = [
    { href: '/', icon: LayoutDashboard, label: 'Tổng quan' },
    { href: '/schedules', icon: Calendar, label: 'Lịch trực' },
    { href: '/doctors', icon: Users, label: 'Bác sĩ' },
    { href: '/clinics', icon: Building2, label: 'Phòng khám' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full border-r bg-card">
            <div className="p-6 border-b">
                <h1 className="text-xl font-bold text-primary">Reception Portal</h1>
                <p className="text-xs text-muted-foreground">Phòng khám ĐHYPNT</p>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={pathname === item.href ? 'secondary' : 'ghost'}
                                className={cn('w-full justify-start gap-2', pathname === item.href && 'bg-secondary')}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </Button>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t">
                <Button variant="ghost" className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={authService.logout}>
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                </Button>
            </div>
        </div>
    );
}
