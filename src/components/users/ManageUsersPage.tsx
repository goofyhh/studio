
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Users, PlusCircle, Edit3, UserX, UserCheck, Search, Filter } from "lucide-react";
import { CreateUserForm, POSITION_OPTIONS } from '@/components/dashboard/CreateUserForm'; // Import POSITION_OPTIONS
import { MOCK_BRANCHES } from '@/components/settings/BranchSelector';
import Image from 'next/image';

export interface UserEntry { // Export UserEntry
  id: string;
  name: string;
  surname: string;
  loginCode: string;
  position: string;
  branch: string;
  status: 'Active' | 'Suspended';
}

export const initialMockUsers: UserEntry[] = [ // Export initialMockUsers
  { id: '1', name: 'Juan', surname: 'Perez', loginCode: 'JP101', position: 'Tienda', branch: 'PB Boggiani', status: 'Active' },
  { id: '2', name: 'Maria', surname: 'Gonzalez', loginCode: 'MG202', position: 'Playa', branch: 'PB Remanso', status: 'Active' },
  { id: '3', name: 'Carlos', surname: 'Lopez', loginCode: 'CL303', position: 'Supervisor', branch: 'PB Villa Hayes', status: 'Suspended' },
  { id: '4', name: 'Ana', surname: 'Martinez', loginCode: 'AM404', position: 'Administracion', branch: 'CO San Lorenzo', status: 'Active' },
  { id: '5', name: 'Luis', surname: 'Rodriguez', loginCode: 'LR505', position: 'Chofer', branch: 'PB Km9', status: 'Active' },
  { id: '6', name: 'Laura', surname: 'Fernandez', loginCode: 'LF606', position: 'Limpiadora', branch: 'PB Boggiani', status: 'Active' },
  { id: '7', name: 'Pedro', surname: 'Gomez', loginCode: 'PG707', position: 'Mantenimiento', branch: 'PS Mariano', status: 'Suspended' },
  { id: '8', name: 'Sofia', surname: 'Diaz', loginCode: 'SD808', position: 'Capitan TDA', branch: 'PB Remanso', status: 'Active' },
  { id: '9', name: 'Diego', surname: 'Silva', loginCode: 'DS909', position: 'Capitan PLA', branch: 'PB Villa Hayes', status: 'Active' },
  { id: '10', name: 'Camila', surname: 'Vargas', loginCode: 'CV010', position: 'Otro', branch: 'CO San Lorenzo', status: 'Active' },
];

const STATUS_OPTIONS: UserEntry['status'][] = ['Active', 'Suspended'];

const ALL_POSITIONS_VALUE = "all-positions";
const ALL_BRANCHES_VALUE = "all-branches";
const ALL_STATUSES_VALUE = "all-statuses";

export function ManageUsersPage() {
  const { user } = useAppContext();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserEntry[]>(initialMockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('');
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isCreateUserSheetOpen, setIsCreateUserSheetOpen] = useState(false);

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

  const handleEditUser = (userId: string) => {
    toast({
      title: 'Edit User (Mock)',
      description: `Functionality to edit user ID ${userId} will be implemented here.`,
    });
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id === userId) {
          const newStatus = u.status === 'Active' ? 'Suspended' : 'Active';
          toast({
            title: `User Status Updated (Mock)`,
            description: `User ${u.name} ${u.surname} has been ${newStatus.toLowerCase()}.`,
          });
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        u.name.toLowerCase().includes(searchLower) ||
        u.surname.toLowerCase().includes(searchLower) ||
        u.loginCode.toLowerCase().includes(searchLower);

      const matchesPosition = positionFilter ? u.position === positionFilter : true;
      const matchesBranch = branchFilter ? u.branch === branchFilter : true;
      const matchesStatus = statusFilter ? u.status === statusFilter : true;

      return matchesSearch && matchesPosition && matchesBranch && matchesStatus;
    });
  }, [users, searchTerm, positionFilter, branchFilter, statusFilter]);

  const availableBranches = MOCK_BRANCHES;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl">Manage Users</CardTitle>
                <CardDescription>View, create, edit, and suspend employee users.</CardDescription>
              </div>
            </div>
            <Sheet open={isCreateUserSheetOpen} onOpenChange={setIsCreateUserSheetOpen}>
              <SheetTrigger asChild>
                <Button onClick={() => setIsCreateUserSheetOpen(true)}>
                  <PlusCircle className="mr-2 h-5 w-5" /> Create New Employee
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6 p-4 border rounded-md bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <Label htmlFor="searchUsers">Search Users</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="searchUsers"
                    type="text"
                    placeholder="Name, surname, or login code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 md:pt-0">
                <Filter className="h-5 w-5"/>
                <span>Advanced Filters:</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <Label htmlFor="positionFilter">Filter by Position</Label>
                <Select 
                  value={positionFilter || ALL_POSITIONS_VALUE} 
                  onValueChange={(value) => setPositionFilter(value === ALL_POSITIONS_VALUE ? "" : value)}
                >
                  <SelectTrigger id="positionFilter" className="w-full mt-1">
                    <SelectValue placeholder="All Positions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_POSITIONS_VALUE}>All Positions</SelectItem>
                    {POSITION_OPTIONS.map((position) => (
                      <SelectItem key={position} value={position}>
                        {position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="branchFilter">Filter by Branch</Label>
                <Select 
                  value={branchFilter || ALL_BRANCHES_VALUE} 
                  onValueChange={(value) => setBranchFilter(value === ALL_BRANCHES_VALUE ? "" : value)}
                >
                  <SelectTrigger id="branchFilter" className="w-full mt-1">
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_BRANCHES_VALUE}>All Branches</SelectItem>
                    {availableBranches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="statusFilter">Filter by Status</Label>
                <Select 
                  value={statusFilter || ALL_STATUSES_VALUE} 
                  onValueChange={(value) => setStatusFilter(value === ALL_STATUSES_VALUE ? "" : value)}
                >
                  <SelectTrigger id="statusFilter" className="w-full mt-1">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_STATUSES_VALUE}>All Statuses</SelectItem>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>A list of all employee users. Found {filteredUsers.length} user(s).</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Avatar</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Surname</TableHead>
                    <TableHead>Login Code</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right min-w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <Image
                          src={`https://placehold.co/40x40.png?text=${u.name[0]}${u.surname[0]}`}
                          alt={`${u.name} ${u.surname}`}
                          width={40}
                          height={40}
                          className="rounded-full"
                          data-ai-hint="employee avatar"
                        />
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{u.name}</TableCell>
                      <TableCell className="whitespace-nowrap">{u.surname}</TableCell>
                      <TableCell>{u.loginCode}</TableCell>
                      <TableCell>{u.position}</TableCell>
                      <TableCell><Badge variant="outline">{u.branch}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={u.status === 'Active' ? 'default' : 'destructive'} className={u.status === 'Active' ? 'bg-green-500 hover:bg-green-600' : ''}>
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1 md:space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditUser(u.id)}>
                          <Edit3 className="h-4 w-4 md:mr-1" />
                          <span className="hidden md:inline">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={u.status === 'Active' ? 'hover:bg-red-500/10 hover:text-red-600' : 'hover:bg-green-500/10 hover:text-green-600'}
                        >
                          {u.status === 'Active' ? (
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
            <p className="text-center text-muted-foreground py-8">
              {searchTerm || positionFilter || branchFilter || statusFilter ? 'No users match your search or filter criteria.' : 'No users created yet.'}
            </p>
          )}
          
          <div className="mt-6 p-4 border border-dashed rounded-md bg-muted/30">
            <h3 className="text-lg font-semibold mb-2">Notes & Future Enhancements:</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>User data is currently mocked and changes are not persisted.</li>
              <li>Full edit functionality needs backend integration.</li>
              <li>Pagination for large user lists.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
