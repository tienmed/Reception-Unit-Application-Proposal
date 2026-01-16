'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.verifyToken(token);
            if (response.success && response.data.is_valid) {
                localStorage.setItem('api_token', token);
                // Store user info if needed
                localStorage.setItem('user_name', response.data.name);
                router.push('/');
            } else {
                setError('Token không hợp lệ hoặc đã hết hạn');
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi kiểm tra token');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-primary">Reception Portal</CardTitle>
                    <CardDescription className="text-center">
                        Nhập Token được cung cấp bởi Admin để truy cập
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="token">API Token</Label>
                            <Input
                                id="token"
                                type="password"
                                placeholder="eyJ..."
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                required
                            />
                        </div>
                        {error && (
                            <div className="text-sm text-red-500 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
