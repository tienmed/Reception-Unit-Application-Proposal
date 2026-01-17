'use client';

import { useQuery } from '@tanstack/react-query';
import { scheduleService } from '@/services/schedule.service';
import { clinicService } from '@/services/clinic.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, CalendarCheck, Clock } from 'lucide-react';
import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';


import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
    const today = format(new Date(), 'yyyy-MM-dd');

    // Fetch daily schedules to count doctors working today
    const { data: dailyData, isLoading: isLoadingSchedules } = useQuery({
        queryKey: ['schedules', 'daily', today],
        queryFn: () => scheduleService.getDailySchedules(today),
    });

    // Fetch active clinics
    const { data: clinicsData, isLoading: isLoadingClinics } = useQuery({
        queryKey: ['clinics'],
        queryFn: () => clinicService.getClinics({ is_active: true }),
    });

    const activeClinicsCount = clinicsData?.data?.length || 0;
    const schedulesTodayCount = dailyData?.data?.total || 0;

    // Count unique doctors working today
    const uniqueDoctors = new Set(dailyData?.data?.schedules.map((s) => s.user_id)).size || 0;

    const schedules = dailyData?.data?.schedules || [];
    const clinics = clinicsData?.data || [];

    // Helper to find doctor for a clinic and slot
    const getDoctorForSlot = (clinicId: number, slot: 'morning' | 'afternoon') => {
        const schedule = schedules.find(s => s.clinic_id === clinicId && s.time_slot === slot);
        return schedule ? schedule.user : null;
    };

    const isLoading = isLoadingSchedules || isLoadingClinics;

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
                        {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{schedulesTodayCount}</div>}
                        <p className="text-xs text-muted-foreground">Ca trực đã xếp</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bác sĩ trực</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{uniqueDoctors}</div>}
                        <p className="text-xs text-muted-foreground">Bác sĩ đang làm việc</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Phòng khám hoạt động</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{activeClinicsCount}</div>}
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

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Lịch trực hôm nay</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Phòng khám</TableHead>
                                    <TableHead>Sáng</TableHead>
                                    <TableHead>Chiều</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clinics.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-4">Chưa có dữ liệu phòng khám</TableCell>
                                    </TableRow>
                                ) : (
                                    clinics.map((clinic) => {
                                        const morningDoc = getDoctorForSlot(clinic.id, 'morning');
                                        const afternoonDoc = getDoctorForSlot(clinic.id, 'afternoon');

                                        return (
                                            <TableRow key={clinic.id}>
                                                <TableCell className="font-medium">
                                                    <div>{clinic.name}</div>
                                                    <div className="text-xs text-muted-foreground">{clinic.category?.name}</div>
                                                </TableCell>
                                                <TableCell>
                                                    {morningDoc ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-medium text-blue-700">{morningDoc.name}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">-- Trống --</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {afternoonDoc ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-medium text-blue-700">{afternoonDoc.name}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">-- Trống --</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

