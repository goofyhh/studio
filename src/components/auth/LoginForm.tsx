
"use client";

import type { UserRole } from '@/contexts/AppContext';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { KeyRound, User, Building } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  role: UserRole;
  onLoginSuccess?: () => void;
}

export function LoginForm({ role, onLoginSuccess }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { login } = useAppContext();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === 'Kiosk') {
      if (!identifier) {
        toast({ title: "Error", description: "Please enter an Employee Code.", variant: "destructive" });
        return;
      }
    } else if (role === 'Administrator') {
      if (!identifier || !password) {
        toast({ title: "Error", description: "Please enter Username and Password.", variant: "destructive" });
        return;
      }
      // Specific credential check for Administrator
      if (identifier.toLowerCase() !== 'admin' || password !== '0000') {
        toast({ title: "Error", description: "Invalid username or password.", variant: "destructive" });
        return;
      }
    } else if (role === 'Supervisor') {
      if (!identifier || !password) {
         toast({ title: "Error", description: "Please enter Username and Password.", variant: "destructive" });
        return;
      }
      // Supervisor logs in with any non-empty username/password (mock authentication)
    }

    login(role, identifier);
    toast({ title: "Login Successful", description: `Welcome!` }); // Simplified welcome message
    if (onLoginSuccess) {
      onLoginSuccess();
    }
    router.push('/app/dashboard');
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {role} Login
        </CardTitle>
        <CardDescription className="text-center">
          {role === 'Kiosk' ? 'Enter your Employee Code to continue.' : 'Enter your credentials to access.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {role === 'Kiosk' ? (
            <div className="space-y-2">
              <Label htmlFor="employeeCode">Employee Code</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="employeeCode"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your code"
                  required
                  className="pl-10"
                  autoComplete="off"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                 <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your username"
                    required
                    className="pl-10"
                    autoComplete="username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="pl-10"
                    autoComplete="current-password"
                  />
                </div>
              </div>
            </>
          )}
          <Button type="submit" className="w-full text-lg py-6">
            Login
          </Button>
        </form>
      </CardContent>
      {role !== 'Kiosk' && (
         <CardFooter className="text-xs text-muted-foreground justify-center">
            <p>Ensure you are authorized before proceeding.</p>
         </CardFooter>
      )}
    </Card>
  );
}
