'use client';

import { useState, useEffect } from 'react';
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

    // Auto-login with env token if available and no local token
    useEffect(() => {
        const envToken = process.env.NEXT_PUBLIC_API_TOKEN;
        const localToken = localStorage.getItem('api_token');

        if (envToken && !localToken) {
            setLoading(true);
            authService.verifyToken(envToken)
                .then(response => {
                    if (response.success && response.data.is_valid) {
                        localStorage.setItem('api_token', envToken);
                        if (response.data.name) {
                            localStorage.setItem('user_name', response.data.name);
                        }
                        router.push('/');
                    } else {
                        // If env token is invalid, just let user try manual login
                        console.warn('Environment API token is invalid');
                    }
                })
                .catch(err => {
                    console.error('Error verifying env token:', err);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [router]);

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
                        {loading ? 'Đang xác thực...' : 'Nhập Token được cung cấp bởi Admin để truy cập'}
                    </CardDescription>
                </CardHeader>

                {process.env.NEXT_PUBLIC_API_TOKEN && loading ? (
                    <CardContent className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </CardContent>
                ) : (
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="token">API Token</Label>
                                <Input
                                    id="token"
                                    type="password"
                                    placeholder="eyJ..."
                                    value={token || process.env.NEXT_PUBLIC_API_TOKEN || ''}
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
                )}
            </Card>
        </div>
    );
}
