
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
import { SheetClose } from '@/components/ui/sheet'; // Changed from DialogClose

interface CreateUserFormProps {
  branches: string[];
  onUserCreated?: () => void;
}

export const POSITION_OPTIONS = [ // Export POSITION_OPTIONS
  "Tienda",
  "Playa",
  "Capitan TDA",
  "Capitan PLA",
  "Limpiadora",
  "Supervisor",
  "Mantenimiento",
  "Chofer",
  "Administracion",
  "Otro"
];

export function CreateUserForm({ branches, onUserCreated }: CreateUserFormProps) {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string | undefined>(undefined);
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(undefined);
  const [salaryPerHour, setSalaryPerHour] = useState(''); // New state for salary
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !surname || !loginCode || !selectedPosition || !selectedBranch || !salaryPerHour) {
      toast({
        title: 'Error',
        description: 'All fields are required, including salary per hour.',
        variant: 'destructive',
      });
      return;
    }
    const salary = parseFloat(salaryPerHour);
    if (isNaN(salary) || salary <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid positive number for salary per hour.',
        variant: 'destructive',
      });
      return;
    }


    // Mock user creation
    const newUser = { name, surname, loginCode, position: selectedPosition, branch: selectedBranch, salaryPerHour: salary };
    console.log('Creating new user:', newUser);

    toast({
      title: 'User Created (Mock)',
      description: `${name} ${surname} has been added with login code ${loginCode} and salary Gs. ${salary}/hr.`,
    });

    // Reset form
    setName('');
    setSurname('');
    setLoginCode('');
    setSelectedPosition(undefined);
    setSelectedBranch(undefined);
    setSalaryPerHour(''); // Reset salary field

    if (onUserCreated) {
      onUserCreated();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., John" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="surname">Surname</Label>
          <Input id="surname" value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="e.g., Doe" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="loginCode">Login Code</Label>
        <Input id="loginCode" value={loginCode} onChange={(e) => setLoginCode(e.target.value)} placeholder="e.g., EMP123" />
        <p className="text-xs text-muted-foreground">This code will be used by the employee to log into the Kiosk.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="position">Position</Label>
        <Select value={selectedPosition} onValueChange={setSelectedPosition}>
          <SelectTrigger id="position" className="w-full">
            <SelectValue placeholder="Select a position" />
          </SelectTrigger>
          <SelectContent>
            {POSITION_OPTIONS.map((positionName) => (
              <SelectItem key={positionName} value={positionName}>
                {positionName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="branch">Branch</Label>
        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
          <SelectTrigger id="branch" className="w-full">
            <SelectValue placeholder="Select a branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branchName) => (
              <SelectItem key={branchName} value={branchName}>
                {branchName}
              </SelectItem>
            ))}
            {branches.length === 0 && <SelectItem value="nobranch" disabled>No branches available</SelectItem>}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="salaryPerHour">Salary per Hour (Gs.)</Label>
        <Input 
          id="salaryPerHour" 
          type="number" 
          value={salaryPerHour} 
          onChange={(e) => setSalaryPerHour(e.target.value)} 
          placeholder="e.g., 15000" 
          min="0"
        />
        <p className="text-xs text-muted-foreground">Enter the hourly wage in Guaranies.</p>
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
