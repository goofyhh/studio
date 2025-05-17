
"use client";

import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, FileText, Users, Building2, PlusCircle } from 'lucide-react'; // Changed UserPlus back to Users
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CreateUserForm } from './CreateUserForm';
import { MOCK_BRANCHES } from '@/components/settings/BranchSelector';

export function AdminSupervisorDashboard() {
  const { user } = useAppContext();
  const [isCreateUserSheetOpen, setIsCreateUserSheetOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading user data or user not found...</p>
      </div>
    );
  }

  const availableBranches = MOCK_BRANCHES;

  // If the component was simplified for debugging, restore its intended content
  if (user.name === "Simplified for Debugging") {
     return (
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard (Simplified)</h1>
        <p>This is a basic version for testing purposes.</p>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Administrator Dashboard</h1>
        <CardDescription className="text-lg">
          Welcome, {user.name}! Here you can manage system settings, view reports, and oversee operations.
        </CardDescription>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* View Reports Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">View Reports</CardTitle>
            <FileText className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access and export clock-in/out records and other operational data.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => window.location.href = '/app/reports'}>Go to Reports</Button>
          </CardFooter>
        </Card>

        {/* Administrator Specific Cards */}
        {user.role === 'Administrator' && (
          <>
            {/* Manage Kiosks & Branches Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Manage Kiosks & Branches</CardTitle>
                <Building2 className="h-6 w-6 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configure kiosk branches and other system-wide parameters.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => window.location.href = '/app/settings'}>Go to Settings</Button>
              </CardFooter>
            </Card>

            {/* Create Employee Users Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Create Employee Users</CardTitle>
                <Users className="h-6 w-6 text-primary" /> {/* Using Users icon as previously changed */}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add new employees and assign them login codes and branches.
                </p>
              </CardContent>
              <CardFooter>
                <Sheet open={isCreateUserSheetOpen} onOpenChange={setIsCreateUserSheetOpen}>
                  <SheetTrigger asChild>
                    <Button className="w-full" onClick={() => setIsCreateUserSheetOpen(true)}>
                      <PlusCircle className="mr-2 h-5 w-5" /> Add New Employee
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Create New Employee User</SheetTitle>
                      <SheetDescription>
                        Fill in the details below to add a new employee. Their login code will be used for Kiosk access.
                      </SheetDescription>
                    </SheetHeader>
                    <CreateUserForm
                      branches={availableBranches}
                      onUserCreated={() => setIsCreateUserSheetOpen(false)}
                    />
                  </SheetContent>
                </Sheet>
              </CardFooter>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
