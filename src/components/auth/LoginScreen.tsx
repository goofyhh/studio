
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCog, Users, HardHat } from 'lucide-react'; 
import { siteConfig } from '@/config/site';
import { LoginForm } from './LoginForm';
import type { UserRole } from '@/contexts/AppContext';
import { useAppContext } from '@/contexts/AppContext';

export function LoginScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { user, branch, isLoading: appContextIsLoading, isAuthenticated } = useAppContext();
  const router = useRouter();

  if (appContextIsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-background p-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-timer animate-spin mb-4"><path d="M10 2h4"/><path d="M12 14v-4"/><path d="M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6"/><path d="M9 17H4v5"/></svg>
        <p className="text-lg text-muted-foreground">Loading session...</p>
      </div>
    );
  }

  if (selectedRole) {
    if (selectedRole === 'Kiosk') {
      // If Kiosk role is selected, check if we can redirect immediately
      if (isAuthenticated && user?.role === 'Kiosk' && branch) {
        router.push('/app/dashboard');
        return ( // Show a message while redirecting
          <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-background p-4">
             <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-timer animate-spin mb-4"><path d="M10 2h4"/><path d="M12 14v-4"/><path d="M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6"/><path d="M9 17H4v5"/></svg>
            <p className="text-lg text-muted-foreground">Redirecting to Kiosk mode...</p>
          </div>
        );
      }
      // If not redirecting, show the Kiosk login form (to enter employee code)
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-background p-4">
          <LoginForm role={selectedRole} onLoginSuccess={() => setSelectedRole(null)} />
          <Button variant="link" onClick={() => setSelectedRole(null)} className="mt-6 text-sm">
            Back to role selection
          </Button>
        </div>
      );
    }
    // For Administrator or Supervisor, always show their login form
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-background p-4">
        <LoginForm role={selectedRole} onLoginSuccess={() => setSelectedRole(null)} />
        <Button variant="link" onClick={() => setSelectedRole(null)} className="mt-6 text-sm">
          Back to role selection
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-background p-4">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-timer"><path d="M10 2h4"/><path d="M12 14v-4"/><path d="M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6"/><path d="M9 17H4v5"/></svg>
          </div>
          <CardTitle className="text-4xl font-bold">{siteConfig.name}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">{siteConfig.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-8">
          <p className="text-xl font-medium">Select your access level:</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
            <Button
              onClick={() => setSelectedRole('Administrator')}
              className="w-full text-lg py-8 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              variant="outline"
            >
              <UserCog className="mr-3 h-7 w-7" /> Administrator
            </Button>
            <Button
              onClick={() => setSelectedRole('Supervisor')}
              className="w-full text-lg py-8 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              variant="outline"
            >
              <Users className="mr-3 h-7 w-7" /> Supervisor
            </Button>
            <Button
              onClick={() => setSelectedRole('Kiosk')}
              className="w-full text-lg py-8 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <HardHat className="mr-3 h-7 w-7" /> Kiosk Access
            </Button>
          </div>
        </CardContent>
      </Card>
       <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
      </footer>
    </div>
  );
}
