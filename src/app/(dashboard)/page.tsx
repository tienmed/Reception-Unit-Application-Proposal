'use client';

import { useQuery } from '@tanstack/react-query';
import { scheduleService } from '@/services/schedule.service';
import { clinicService } from '@/services/clinic.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, CalendarCheck, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
    const today = format(new Date(), 'yyyy-MM-dd');

    // Fetch daily schedules to count doctors working today
    const { data: dailyData } = useQuery({
        queryKey: ['schedules', 'daily', today],
        queryFn: () => scheduleService.getDailySchedules(today),
    });

    // Fetch active clinics
    const { data: clinicsData } = useQuery({
        queryKey: ['clinics'],
        queryFn: () => clinicService.getClinics({ is_active: true }),
    });

    const activeClinicsCount = clinicsData?.data?.length || 0;
    const schedulesTodayCount = dailyData?.data?.total || 0;

    // Count unique doctors working today
    const uniqueDoctors = new Set(dailyData?.data?.schedules.map((s: any) => s.user_id)).size || 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
                <div className="text-sm text-muted-foreground">
                    Hôm nay: {format(new Date(), 'dd/MM/yyyy')}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lịch trực hôm nay</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{schedulesTodayCount}</div>
                        <p className="text-xs text-muted-foreground">Ca trực đã xếp</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bác sĩ trực</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{uniqueDoctors}</div>
                        <p className="text-xs text-muted-foreground">Bác sĩ đang làm việc</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Phòng khám hoạt động</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeClinicsCount}</div>
                        <p className="text-xs text-muted-foreground">Phòng khám mở cửa</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Giờ hiện tại</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Hoạt động</div>
                        <p className="text-xs text-muted-foreground">Hệ thống bình thường</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity or Quick List could go here */}
            <h2 className="text-xl font-semibold mt-8">Lịch trực hôm nay</h2>
            <div className="border rounded-lg p-4 bg-white dark:bg-card">
                {/* Simple list for now, ideally reused Schedule component */}
                {dailyData?.data?.schedules.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Chưa có lịch trực nào hôm nay.</p>
                ) : (
                    <div className="space-y-4">
                        {dailyData?.data?.schedules.map((schedule: any) => (
                            <div key={schedule.id} className="flex justify-between items-center border-b last:border-0 pb-2 last:pb-0">
                                <div>
                                    <div className="font-medium">{schedule.user?.name}</div>
                                    <div className="text-sm text-muted-foreground">{schedule.clinic?.name}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs ${schedule.time_slot === 'morning' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {schedule.time_slot === 'morning' ? 'Sáng' : 'Chiều'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
