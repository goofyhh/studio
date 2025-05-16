"use client";

import { useAppContext } from '@/contexts/AppContext';
import { ClockInOutCard } from '@/components/kiosk/ClockInOutCard';
import { AdminSupervisorDashboard } from '@/components/dashboard/AdminSupervisorDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function DashboardPage() {
  const { user, isLoading, branch } = useAppContext();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
     return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          User not found. Please try logging in again.
        </AlertDescription>
      </Alert>
    );
  }

  if (user.role === 'Kiosk') {
    if (!branch) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
          <h2 className="text-2xl font-semibold">Kiosk Branch Not Configured</h2>
          <p className="text-muted-foreground">
            Please ask an Administrator to set up the branch for this kiosk in the settings.
          </p>
        </div>
      );
    }
    return <ClockInOutCard />;
  }

  return <AdminSupervisorDashboard />;
}
