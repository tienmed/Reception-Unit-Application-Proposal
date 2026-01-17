'use client';

import { useQuery } from '@tanstack/react-query';
import { clinicService } from '@/services/clinic.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

            {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
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
