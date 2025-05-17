
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppContext } from '@/contexts/AppContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Users } from "lucide-react";

// Placeholder for a more detailed user data structure
interface UserEntry {
  id: string;
  name: string;
  surname: string;
  loginCode: string;
  position: string;
  branch: string;
  status: 'Active' | 'Suspended';
}

// Mock user data - this would eventually come from a database or context
const mockUsers: UserEntry[] = [
  { id: '1', name: 'Juan', surname: 'Perez', loginCode: 'JP101', position: 'Tienda', branch: 'PB Boggiani', status: 'Active' },
  { id: '2', name: 'Maria', surname: 'Gonzalez', loginCode: 'MG202', position: 'Playa', branch: 'PB Remanso', status: 'Active' },
  { id: '3', name: 'Carlos', surname: 'Lopez', loginCode: 'CL303', position: 'Supervisor', branch: 'PB Villa Hayes', status: 'Suspended' },
];


export function ManageUsersPage() {
  const { user } = useAppContext();

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
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl">Manage Users</CardTitle>
              <CardDescription>View, create, edit, and suspend employee users.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will allow administrators to manage all employee users in the system.
            Functionality to list, filter, edit user details (name, surname, login code, position, branch),
            and suspend/activate user accounts will be implemented here.
          </p>
          <div className="mt-6 p-4 border border-dashed rounded-md">
            <h3 className="text-lg font-semibold mb-2">Future Enhancements:</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Display a table of all created users.</li>
              <li>Allow filtering and searching users.</li>
              <li>Provide options to edit user details.</li>
              <li>Implement functionality to suspend or reactivate user accounts.</li>
              <li>Button to navigate to the "Create Employee User" form (already on dashboard).</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
