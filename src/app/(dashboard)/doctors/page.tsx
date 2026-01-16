'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce'; // We might need this, or implement inline

export default function DoctorsPage() {
    const [search, setSearch] = useState('');

    // Custom debounce logic since I didn't create the hook
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Simple effect to debounce (simplified for now)
    const handleSearch = (val: string) => {
        setSearch(val);
        setTimeout(() => setDebouncedSearch(val), 500);
    };

    const { data, isLoading } = useQuery({
        queryKey: ['users', 'doctors', debouncedSearch],
        queryFn: () => userService.getUsers({ role: 'doctor', is_active: true, search: debouncedSearch }),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Danh sách Bác sĩ</h1>
            </div>

            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Tìm kiếm bác sĩ theo tên..."
                    className="pl-8 max-w-sm"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {data?.data.map((user) => (
                        <Card key={user.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={`https://ui-avatars.com/api/?name=${user.name}`} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-lg">{user.name}</CardTitle>
                                    <CardDescription>{user.doctor_profile?.specialty || 'Chưa cập nhật CK'}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Mã NV:</span>
                                        <span className="font-medium">{user.employee_id}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="font-medium">{user.email}</span>
                                    </div>
                                    <div className="mt-2">
                                        <Badge variant={user.is_active ? 'default' : 'secondary'}>
                                            {user.is_active ? 'Đang công tác' : 'Tạm ngưng'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {data?.data.length === 0 && (
                        <p className="text-center col-span-full text-muted-foreground">Không tìm thấy bác sĩ nào.</p>
                    )}
                </div>
            )}
        </div>
    );
}
