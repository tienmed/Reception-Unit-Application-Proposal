'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { scheduleService } from '@/services/schedule.service';
import { format, startOfWeek, addWeeks, subWeeks, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function SchedulesPage() {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Get start of week (Sunday as per API assumption, or standard ISO)
    // API uses 0=Sunday. Let's align with that.
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // 0 is Sunday
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');

    const { data, isLoading } = useQuery({
        queryKey: ['schedules', 'weekly', weekStartStr],
        queryFn: () => scheduleService.getWeeklySchedules(weekStartStr),
    });

    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

    const weekDays = Array.from({ length: 7 }).map((_, i) => {
        const d = addDays(weekStart, i);
        return {
            date: d,
            dayIndex: i, // 0-6
            label: format(d, 'EEEE (dd/MM)', { locale: vi }),
        };
    });

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Helper to get schedules for a specific day and slot
    // API returns structure like: { '1_morning': [...], '1_afternoon': [...] }
    // where key is `${day_of_week}_${time_slot}`.
    const getSchedules = (dayIndex: number, slot: 'morning' | 'afternoon') => {
        const key = `${dayIndex}_${slot}`;
        return data?.data?.schedules?.[key] || [];
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Lịch Làm Việc</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrevWeek}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-medium min-w-[200px] text-center capitalize">
                        {format(weekStart, 'LLLL yyyy', { locale: vi })}
                    </span>
                    <Button variant="outline" size="icon" onClick={handleNextWeek}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="border p-4 w-[100px] bg-muted/50 text-left font-medium">Ca</th>
                                {weekDays.map((day) => (
                                    <th key={day.dayIndex} className="border p-4 min-w-[150px] bg-muted/50 text-left font-medium capitalize">
                                        {day.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Morning Row */}
                            <tr>
                                <td className="border p-4 font-semibold bg-yellow-50/50">Sáng</td>
                                {weekDays.map((day) => (
                                    <td key={`morning-${day.dayIndex}`} className="border p-2 align-top h-[150px]">
                                        <div className="space-y-2">
                                            {getSchedules(day.dayIndex, 'morning').map((s: any) => (
                                                <div key={s.id} className="p-2 rounded bg-white border shadow-sm text-sm hover:shadow-md transition-shadow">
                                                    <div className="font-bold text-primary">{s.user?.name}</div>
                                                    <div className="text-xs text-muted-foreground">{s.clinic?.name}</div>
                                                    {s.notes && <div className="text-[10px] italic text-gray-500 mt-1">{s.notes}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                            {/* Afternoon Row */}
                            <tr>
                                <td className="border p-4 font-semibold bg-blue-50/50">Chiều</td>
                                {weekDays.map((day) => (
                                    <td key={`afternoon-${day.dayIndex}`} className="border p-2 align-top h-[150px]">
                                        <div className="space-y-2">
                                            {getSchedules(day.dayIndex, 'afternoon').map((s: any) => (
                                                <div key={s.id} className="p-2 rounded bg-white border shadow-sm text-sm hover:shadow-md transition-shadow">
                                                    <div className="font-bold text-primary">{s.user?.name}</div>
                                                    <div className="text-xs text-muted-foreground">{s.clinic?.name}</div>
                                                    {s.notes && <div className="text-[10px] italic text-gray-500 mt-1">{s.notes}</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
