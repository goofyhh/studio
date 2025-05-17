
"use client";

import React, { useState } from 'react';
import { BranchSelector } from './BranchSelector';
import { useAppContext } from '@/contexts/AppContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, UserCog, PlusCircle } from "lucide-react";
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
import { CreateAdminSupervisorForm } from './CreateAdminSupervisorForm';

export function SettingsPage() {
  const { user } = useAppContext();
  const [isCreateAdminSheetOpen, setIsCreateAdminSheetOpen] = useState(false);

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
            Create new Administrator or Supervisor accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                onUserCreated={() => setIsCreateAdminSheetOpen(false)}
              />
            </SheetContent>
          </Sheet>
          <p className="mt-4 text-sm text-muted-foreground">
            Note: User management features such as editing or deleting administrative users are not yet implemented.
          </p>
        </CardContent>
      </Card>

      {/* Other settings can be added here */}
    </div>
  );
}
