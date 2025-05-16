
"use client";

import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AdminSupervisorDashboard() {
  const { user } = useAppContext();

  if (!user) {
    return (
      <div>
        <p>Loading user data or user not found...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Simplified Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Welcome, {user.name} ({user.role})!</p>
          <p>If you see this, the basic dashboard page is loading.</p>
        </CardContent>
      </Card>
    </div>
  );
}
