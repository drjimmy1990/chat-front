// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import QueryProvider from '@/providers/QueryProvider';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import Toast from '@/components/ui/Toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Chat Dashboard',
  description: 'Modern dashboard for managing AI-powered conversations across multiple platforms.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <QueryProvider>
            <Toast />
            <div className="min-h-screen bg-background text-foreground">
              {children}
            </div>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}