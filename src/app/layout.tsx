import type { Metadata } from 'next';
// import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import Providers from '@/components/providers';

// const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'Reception Portal - Phòng Khám ĐHYPNT',
  description: 'Hệ thống quản lý lịch và điều phối bệnh nhân',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background antialiased font-sans")}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
