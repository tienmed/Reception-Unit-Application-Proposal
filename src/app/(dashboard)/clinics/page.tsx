'use client';

import { useQuery } from '@tanstack/react-query';
import { clinicService } from '@/services/clinic.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, DoorOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ClinicsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['clinics'],
        queryFn: () => clinicService.getClinics({ is_active: true }),
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Danh sách Phòng Khám</h1>
            </div>

            {/* DEBUG: Dump Data to verify structure */}
            <div className="bg-slate-100 p-4 rounded text-xs font-mono max-h-40 overflow-auto border border-red-500">
                <p className="font-bold text-red-500">DEBUG DATA DUMP:</p>
                <p>IsLoading: {isLoading ? 'true' : 'false'}</p>
                <p>Data Type: {typeof data}</p>
                <p>Has Data Array: {Array.isArray(data?.data) ? 'Yes' : 'No'}</p>
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>


            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-1/2" />
                                    <div className="flex justify-between items-center text-sm">
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-4 w-1/4" />
                                    </div>
                                    <Skeleton className="mt-2 h-5 w-20 rounded-full" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {data?.data.map((clinic) => (
                        <Card key={clinic.id} className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{clinic.name}</CardTitle>
                                    <DoorOpen className="h-5 w-5 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="text-sm text-muted-foreground">
                                        {clinic.category?.name || 'Chưa phân loại'}
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span>Sức chứa:</span>
                                        <span className="font-medium">{clinic.capacity} lượt/buổi</span>
                                    </div>
                                    <div className="mt-2">
                                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200">
                                            Hoạt động
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
