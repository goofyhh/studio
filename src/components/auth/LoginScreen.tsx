
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserCog, Users, HardHat, KeyRound, Building2 as BuildingIcon } from 'lucide-react'; 
import { siteConfig } from '@/config/site';
import { LoginForm } from './LoginForm';
import type { UserRole } from '@/contexts/AppContext';
import { useAppContext } from '@/contexts/AppContext';
import { MOCK_BRANCHES, MOCK_ADMIN_PASSWORD } from '@/components/settings/BranchSelector';
import { useToast } from '@/hooks/use-toast';

export function LoginScreen() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { user, branch, login, setBranch: setAppContextBranch, isLoading: appContextIsLoading, isAuthenticated } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();

  const [kioskSelectedBranch, setKioskSelectedBranch] = useState<string>('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');

  if (appContextIsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-background p-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-timer animate-spin mb-4"><path d="M10 2h4"/><path d="M12 14v-4"/><path d="M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6"/><path d="M9 17H4v5"/></svg>
        <p className="text-lg text-muted-foreground">Loading session...</p>
      </div>
    );
  }

  const handleKioskBranchConfirm = () => {
    if (!kioskSelectedBranch) {
      toast({ title: "Error", description: "Please select a branch for the kiosk.", variant: "destructive" });
      return;
    }
    if (!adminConfirmPassword) {
      toast({ title: "Error", description: "Please enter the administrator password.", variant: "destructive" });
      return;
    }
    if (adminConfirmPassword !== MOCK_ADMIN_PASSWORD) {
      toast({ title: "Authentication Failed", description: "Incorrect administrator password.", variant: "destructive" });
      setAdminConfirmPassword(''); // Clear password field
      return;
    }

    login('Kiosk'); // Log in as "Kiosk Station"
    setAppContextBranch(kioskSelectedBranch); // Set the branch in context
    toast({ title: "Kiosk Configured", description: `Kiosk set to branch: ${kioskSelectedBranch}.` });
    setAdminConfirmPassword(''); // Clear password field
    setSelectedRole(null); // Reset role selection
    router.push('/app/dashboard');
  };

  if (selectedRole) {
    if (selectedRole === 'Kiosk') {
      // If Kiosk role is selected, check if already authenticated and branch is set
      if (isAuthenticated && user?.role === 'Kiosk' && branch) {
        router.push('/app/dashboard');
        return ( // Show a message while redirecting
          <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-background p-4">
             <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-timer animate-spin mb-4"><path d="M10 2h4"/><path d="M12 14v-4"/><path d="M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6"/><path d="M9 17H4v5"/></svg>
            <p className="text-lg text-muted-foreground">Redirecting to Kiosk mode...</p>
          </div>
        );
      }
      // If not redirecting (i.e., Kiosk not set up or first time), show Kiosk branch setup UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 via-background to-background p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center">
              <BuildingIcon className="mx-auto h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-2xl font-bold">Kiosk Setup</CardTitle>
              <CardDescription>Select a branch and confirm with an administrator password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="kioskBranchSelect">Branch</Label>
                <Select value={kioskSelectedBranch} onValueChange={setKioskSelectedBranch}>
                  <SelectTrigger id="kioskBranchSelect" className="w-full">
                    <SelectValue placeholder="Select a branch for this kiosk" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_BRANCHES.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                    {MOCK_BRANCHES.length === 0 && <SelectItem value="nobranches" disabled>No branches configured</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminConfirmPasswordKiosk">Administrator Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="adminConfirmPasswordKiosk" 
                    type="password" 
                    value={adminConfirmPassword} 
                    onChange={(e) => setAdminConfirmPassword(e.target.value)} 
                    placeholder="Enter admin password"
                    className="pl-10"
                    autoComplete="current-password" // good for password managers, but might be off for kiosk
                  />
                </div>
              </div>
              <Button onClick={handleKioskBranchConfirm} className="w-full text-lg py-3">
                Confirm & Start Kiosk Mode
              </Button>
            </CardContent>
          </Card>
          <Button variant="link" onClick={() => {setSelectedRole(null); setKioskSelectedBranch(''); setAdminConfirmPassword('');}} className="mt-6 text-sm text-muted-foreground">
            Back to role selection
          </Button>
        </div>
      );
    }
    // For Administrator or Supervisor, show their respective login form
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

