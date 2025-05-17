"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Skeleton } from '@/components/ui/skeleton';


function AuthenticatedLayoutContent({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Header Skeleton */}
        <div className="sticky top-0 z-40 w-full border-b bg-background h-16 flex items-center justify-between px-4 md:px-8">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="flex flex-1">
          {/* Sidebar Skeleton (conditionally rendered if user type would have sidebar) */}
           {/* Determine if sidebar would show for a generic non-kiosk user for skeleton */}
           {(!user || user?.role !== 'Kiosk') && (
            <div className="hidden md:flex md:flex-col md:w-64 border-r bg-background p-4 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          )}
          {/* Main Content Skeleton */}
          <main className="flex-1 p-4 md:p-8 space-y-4">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </main>
        </div>
      </div>
    );
  }
  
  const showSidebar = user && user.role !== 'Kiosk';

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <div className="flex flex-1">
        {showSidebar && <AppSidebar />}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}


export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <AuthenticatedLayoutContent>{children}</AuthenticatedLayoutContent>
    </AppProvider>
  );
}
