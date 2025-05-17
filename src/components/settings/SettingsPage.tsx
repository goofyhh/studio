
"use client";

import React, { useState } from 'react';
import { BranchSelector } from './BranchSelector';
import { useAppContext, type UserRole } from '@/contexts/AppContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, UserCog, PlusCircle, Edit3, UserX, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CreateAdminSupervisorForm, type NewAdminSupervisorData } from './CreateAdminSupervisorForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';

interface AdminSupervisorUser {
  id: string;
  username: string;
  role: Exclude<UserRole, 'Kiosk'>;
  status: 'Active' | 'Suspended';
}

// Initial mock admin users
const initialMockAdminUsers: AdminSupervisorUser[] = [
  { id: 'admin-001', username: 'admin', role: 'Administrator', status: 'Active' },
  { id: 'supervisor-001', username: 'supervisor_main', role: 'Supervisor', status: 'Active' },
];

export function SettingsPage() {
  const { user } = useAppContext();
  const { toast } = useToast();
  const [isCreateAdminSheetOpen, setIsCreateAdminSheetOpen] = useState(false);
  const [adminSupervisorUsers, setAdminSupervisorUsers] = useState<AdminSupervisorUser[]>(initialMockAdminUsers);

  if (user?.role !== 'Administrator') {
    return (
       <Alert variant="destructive" className="max-w-lg mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to view this page. Administrator access is required.
        </AlertDescription>
      </Alert>
    );
  }

  const handleAdminUserCreated = (newUserData: NewAdminSupervisorData) => {
    setAdminSupervisorUsers(prevUsers => [
      ...prevUsers,
      {
        id: `admin-${Date.now()}`, // Simple unique ID for mock
        username: newUserData.username,
        role: newUserData.role,
        status: 'Active',
      },
    ]);
    setIsCreateAdminSheetOpen(false); // Close the sheet
  };

  const handleEditAdminUser = (userId: string) => {
    toast({
      title: 'Edit Admin/Supervisor (Mock)',
      description: `Functionality to edit user ID ${userId} will be implemented here.`,
    });
  };

  const handleToggleAdminUserStatus = (userId: string) => {
    setAdminSupervisorUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id === userId) {
          const newStatus = u.status === 'Active' ? 'Suspended' : 'Active';
          toast({
            title: `User Status Updated (Mock)`,
            description: `User ${u.username} has been ${newStatus.toLowerCase()}.`,
          });
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Manage core system configurations and administrative users.</p>
      </div>
      
      <BranchSelector />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <UserCog className="mr-3 h-6 w-6 text-primary" />
            Manage Administrative Users
          </CardTitle>
          <CardDescription>
            Create, view, and manage Administrator or Supervisor accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Sheet open={isCreateAdminSheetOpen} onOpenChange={setIsCreateAdminSheetOpen}>
            <SheetTrigger asChild>
              <Button onClick={() => setIsCreateAdminSheetOpen(true)}>
                <PlusCircle className="mr-2 h-5 w-5" /> Create Admin/Supervisor User
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Create New Administrative User</SheetTitle>
                <SheetDescription>
                  Fill in the details to add a new Administrator or Supervisor.
                </SheetDescription>
              </SheetHeader>
              <CreateAdminSupervisorForm
                onUserCreated={handleAdminUserCreated}
              />
            </SheetContent>
          </Sheet>
          
          {adminSupervisorUsers.length > 0 ? (
            <div className="overflow-x-auto pt-4">
              <Table>
                <TableCaption>List of administrative users.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminSupervisorUsers.map((adminUser) => (
                    <TableRow key={adminUser.id}>
                      <TableCell className="font-medium">{adminUser.username}</TableCell>
                      <TableCell>{adminUser.role}</TableCell>
                      <TableCell>
                        <Badge variant={adminUser.status === 'Active' ? 'default' : 'destructive'} className={adminUser.status === 'Active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                          {adminUser.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="outline" size="sm" onClick={() => handleEditAdminUser(adminUser.id)}>
                          <Edit3 className="h-4 w-4 md:mr-1" />
                           <span className="hidden md:inline">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleAdminUserStatus(adminUser.id)}
                           className={adminUser.status === 'Active' ? 'hover:bg-red-500/10 hover:text-red-600' : 'hover:bg-green-500/10 hover:text-green-600'}
                        >
                          {adminUser.status === 'Active' ? (
                            <>
                              <UserX className="h-4 w-4 md:mr-1 text-red-600" />
                              <span className="hidden md:inline">Suspend</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 md:mr-1 text-green-600" />
                              <span className="hidden md:inline">Reactivate</span>
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
             <p className="text-center text-muted-foreground py-4">No administrative users configured yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
