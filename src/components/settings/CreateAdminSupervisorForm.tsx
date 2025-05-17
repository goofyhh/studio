
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { SheetClose } from '@/components/ui/sheet';
import type { UserRole } from '@/contexts/AppContext';

// Matches the structure expected by SettingsPage
export interface NewAdminSupervisorData {
  username: string;
  role: Exclude<UserRole, 'Kiosk'>;
  // Password is not returned, assumed handled by backend in real scenario
}

interface CreateAdminSupervisorFormProps {
  onUserCreated?: (userData: NewAdminSupervisorData) => void;
}

const ADMIN_SUPERVISOR_ROLES: Exclude<UserRole, 'Kiosk'>[] = ["Administrator", "Supervisor"];

export function CreateAdminSupervisorForm({ onUserCreated }: CreateAdminSupervisorFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Exclude<UserRole, 'Kiosk'> | undefined>(undefined);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !selectedRole) {
      toast({
        title: 'Error',
        description: 'All fields are required.',
        variant: 'destructive',
      });
      return;
    }

    const newUser: NewAdminSupervisorData = { username, role: selectedRole };
    console.log('Creating new admin/supervisor user (mock):', { ...newUser, password }); // Log with password for console only

    toast({
      title: 'Admin/Supervisor User Created (Mock)',
      description: `User ${username} with role ${selectedRole} has been added (mock).`,
    });

    if (onUserCreated) {
      onUserCreated(newUser);
    }

    // Reset form
    setUsername('');
    setPassword('');
    setSelectedRole(undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 py-4">
      <div className="space-y-2">
        <Label htmlFor="adminUsername">Username</Label>
        <Input 
          id="adminUsername" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="e.g., newadmin" 
          autoComplete="off"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="adminPassword">Password</Label>
        <Input 
          id="adminPassword" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Enter a secure password" 
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="adminRole">Role</Label>
        <Select value={selectedRole} onValueChange={(value: Exclude<UserRole, 'Kiosk'>) => setSelectedRole(value)}>
          <SelectTrigger id="adminRole" className="w-full">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {ADMIN_SUPERVISOR_ROLES.map((roleName) => (
              <SelectItem key={roleName} value={roleName}>
                {roleName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
         <SheetClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
         </SheetClose>
        <Button type="submit">Create User</Button>
      </div>
    </form>
  );
}
