'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { scheduleService } from '@/services/schedule.service';
import { clinicService } from '@/services/clinic.service';
import { format, startOfWeek, addWeeks, subWeeks, addDays, isSaturday, isSameWeek } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Schedule } from '@/types';

// Helper to get color for clinic
const getClinicColor = (id?: number) => {
    if (!id) return 'bg-white border-gray-200 text-gray-900';
    const colors = [
        'bg-red-50 border-red-200 text-red-900',
        'bg-green-50 border-green-200 text-green-900',
        'bg-purple-50 border-purple-200 text-purple-900',
        'bg-orange-50 border-orange-200 text-orange-900',
        'bg-teal-50 border-teal-200 text-teal-900',
        'bg-pink-50 border-pink-200 text-pink-900',
        'bg-indigo-50 border-indigo-200 text-indigo-900',
        'bg-cyan-50 border-cyan-200 text-cyan-900',
    ];
    return colors[id % colors.length];
};

export default function SchedulesPage() {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(today);

    // Start week on Sunday (0)
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const weekEnd = addDays(weekStart, 6);
    const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

    // Fetch Schedules (Standard List API with Date Range)
    const {
        data: scheduleData,
        isLoading: isLoadingSchedules,
        error: scheduleError,
        isError: isScheduleError
    } = useQuery({
        queryKey: ['schedules', 'list', weekStartStr, weekEndStr], // Unique key for valid caching
        queryFn: () => scheduleService.getSchedules({
            from_date: weekStartStr,
            to_date: weekEndStr,
            per_page: 1000 // Ensure we get enough records for the week
        }),
    });

    // Fetch Clinics
    const { data: clinicsData, isLoading: isLoadingClinics } = useQuery({
        queryKey: ['clinics'],
        queryFn: () => clinicService.getClinics({ is_active: true }),
    });

    // Client-side grouping of schedules
    const groupedSchedules = useMemo(() => {
        const rawList = scheduleData?.data || [];
        return rawList.reduce((acc, schedule) => {
            // Create key: "dayIndex_timeSlot" (e.g., "1_morning")
            // Use day_of_week from API which should be 0-6 (Sun-Sat)
            const key = `${schedule.day_of_week}_${schedule.time_slot}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(schedule);
            return acc;
        }, {} as Record<string, Schedule[]>);
    }, [scheduleData]);

    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const handleCurrentWeek = () => setCurrentDate(today);

    // Generate days (Mon to Sat)
    const weekDays = Array.from({ length: 6 }).map((_, i) => {
        const d = addDays(weekStart, i + 1); // Mon (1) -> Sat (6)
        return {
            date: d,
            dayIndex: d.getDay(),
            label: format(d, 'EEEE', { locale: vi }), // Shorten label for space
            subLabel: format(d, 'dd/MM'),
            isWeekend: isSaturday(d),
        };
    });

    const isLoading = isLoadingSchedules || isLoadingClinics;
    const clinics = clinicsData?.data || [];

    const getClinicSchedules = (clinicId: number, date: Date, slot: 'morning' | 'afternoon') => {
        const dayIndex = date.getDay();
        const key = `${dayIndex}_${slot}`;
        const allSchedulesForSlot = groupedSchedules[key] || [];
        // Filter for clinic and take only the FIRST one as per requirement "1 phòng khám chỉ có duy nhất 1 người"
        return allSchedulesForSlot.find(s => s.clinic_id === clinicId);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] space-y-2 p-2">
            {/* Header Controls */}
            <div className="flex flex-none items-center justify-between">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">Lịch tuần</h1>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 bg-muted/50 p-1 rounded-lg shadow-sm">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevWeek}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold text-xs md:text-sm min-w-[100px] text-center capitalize">
                            {format(weekStart, 'dd/MM', { locale: vi })} - {format(addDays(weekStart, 6), 'dd/MM', { locale: vi })}
                        </span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextWeek}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {!isSameWeek(currentDate, today, { weekStartsOn: 0 }) && (
                        <Button variant="secondary" size="sm" onClick={handleCurrentWeek} className="h-8 gap-1 hidden md:flex">
                            <Calendar className="h-3 w-3" />
                            <span className="text-xs">Hiện tại</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* DEBUG: Dump Data to verify structure */}
            <div className="bg-slate-100 p-4 rounded text-xs font-mono max-h-40 overflow-auto border border-red-500 mb-2">
                <p className="font-bold text-red-500">DEBUG DATA DUMP (Schedules):</p>
                <p>IsLoading: {isLoading ? 'true' : 'false'}</p>
                <p className="text-red-500 font-bold">IsError: {isScheduleError ? 'YES' : 'No'}</p>
                {/* @ts-ignore */}
                <p>Error Msg: {scheduleError?.message || JSON.stringify(scheduleError)}</p>
                <p>Schedules Data Type: {typeof scheduleData}</p>
                <pre>{JSON.stringify(scheduleData, null, 2)}</pre>
            </div>

            {/* Main Table Container - Flex Grow to fill space */}
            <div className="flex-1 border rounded-md bg-white shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-auto flex-1">
                    <table className="w-full h-full table-fixed border-collapse">
                        <thead>
                            <tr className="bg-muted/90 sticky top-0 z-20 shadow-sm">
                                <th className="border p-2 w-[15%] text-left font-bold text-muted-foreground uppercase text-[10px] md:text-xs">
                                    Phòng khám
                                </th>
                                {weekDays.map((day) => (
                                    <th
                                        key={day.date.toISOString()}
                                        className={cn(
                                            "border p-2 text-center font-bold capitalize text-[10px] md:text-xs",
                                            day.isWeekend ? "bg-orange-100 text-orange-900" : "text-slate-700"
                                        )}
                                    >
                                        <div>{day.label}</div>
                                        <div className="font-normal opacity-70 text-[9px] md:text-[10px]">{day.subLabel}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {clinics.map((clinic) => {
                                const clinicColorClass = getClinicColor(clinic.id);
                                return (
                                    <tr key={clinic.id} className="h-20"> {/* Minimum height for rows */}
                                        <td className="border p-2 font-semibold text-xs md:text-sm bg-white sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] truncate">
                                            {clinic.name}
                                        </td>
                                        {weekDays.map((day) => {
                                            const morningSchedule = getClinicSchedules(clinic.id, day.date, 'morning');
                                            const afternoonSchedule = getClinicSchedules(clinic.id, day.date, 'afternoon');

                                            const hasMorning = !!morningSchedule;
                                            const hasAfternoon = !!afternoonSchedule;

                                            return (
                                                <td
                                                    key={day.date.toISOString()}
                                                    className={cn(
                                                        "border p-0 align-top transition-colors text-[10px] md:text-xs",
                                                        day.isWeekend && !hasMorning && !hasAfternoon ? "bg-orange-50/20" : ""
                                                    )}
                                                >
                                                    <div className="flex flex-col h-full min-h-[5rem]">
                                                        {/* Morning */}
                                                        <div className={cn(
                                                            "flex-1 p-1 flex items-center justify-center text-center border-b",
                                                            hasMorning ? clinicColorClass : "bg-gray-100/50 text-gray-400"
                                                        )}>
                                                            {hasMorning ? (
                                                                <span className="font-bold line-clamp-2 leading-tight">
                                                                    {morningSchedule.user?.name}
                                                                </span>
                                                            ) : (
                                                                <span className="italic opacity-50 text-[9px]"></span> // Empty space instead of "(Trống)" to save space/cleaner
                                                            )}
                                                        </div>

                                                        {/* Afternoon */}
                                                        <div className={cn(
                                                            "flex-1 p-1 flex items-center justify-center text-center",
                                                            hasAfternoon ? clinicColorClass : "bg-gray-100/50 text-gray-400"
                                                        )}>
                                                            {hasAfternoon ? (
                                                                <span className="font-bold line-clamp-2 leading-tight">
                                                                    {afternoonSchedule.user?.name}
                                                                </span>
                                                            ) : (
                                                                <span className="italic opacity-50 text-[9px]"></span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
}
