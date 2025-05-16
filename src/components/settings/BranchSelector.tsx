"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Building2, KeyRound, Save } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MOCK_BRANCHES = ["Main Street", "Downtown", "Westside", "North End", "South Park"];
const MOCK_ADMIN_PASSWORD = "admin"; // In a real app, this would be secure

export function BranchSelector() {
  const { branch: currentBranch, setBranch, user } = useAppContext();
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(currentBranch || undefined);
  const [adminPassword, setAdminPassword] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSelectedBranch(currentBranch || undefined);
  }, [currentBranch]);

  if (user?.role !== 'Administrator') {
    return <p>You do not have permission to access these settings.</p>;
  }

  const handleSaveBranch = () => {
    if (!selectedBranch) {
      toast({ title: "Error", description: "Please select a branch.", variant: "destructive" });
      return;
    }
    setIsConfirming(true); // Trigger AlertDialog
  };
  
  const confirmSaveBranch = () => {
    if (adminPassword !== MOCK_ADMIN_PASSWORD) {
      toast({ title: "Authentication Failed", description: "Incorrect admin password.", variant: "destructive" });
      setAdminPassword('');
      return;
    }

    if (selectedBranch) {
      setBranch(selectedBranch);
      toast({ title: "Branch Updated", description: `Kiosk branch set to ${selectedBranch}.` });
    }
    setAdminPassword('');
    setIsConfirming(false); // Close AlertDialog
  };


  return (
    <Card className="w-full max-w-lg shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Building2 className="mr-2 h-6 w-6 text-primary" /> Kiosk Branch Configuration
        </CardTitle>
        <CardDescription>Select the branch for this kiosk. Admin credentials are required to save changes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="branchSelect" className="text-base">Select Branch</Label>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger id="branchSelect" className="w-full h-12 text-base">
              <SelectValue placeholder="Choose a branch..." />
            </SelectTrigger>
            <SelectContent>
              {MOCK_BRANCHES.map((branchName) => (
                <SelectItem key={branchName} value={branchName} className="text-base">
                  {branchName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
         <AlertDialog open={isConfirming} onOpenChange={setIsConfirming}>
          <AlertDialogTrigger asChild>
            <Button onClick={handleSaveBranch} className="w-full text-lg py-3" disabled={!selectedBranch || selectedBranch === currentBranch}>
              <Save className="mr-2 h-5 w-5" /> Save Branch
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Admin Confirmation</AlertDialogTitle>
              <AlertDialogDescription>
                Enter admin password to change the kiosk branch to <span className="font-semibold">{selectedBranch}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-4">
              <Label htmlFor="adminPassword">Admin Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="adminPassword"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="pl-10"
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setAdminPassword('')}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSaveBranch}>Confirm Change</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
      <CardFooter>
        {currentBranch && <p className="text-sm text-muted-foreground">Current active branch: <span className="font-semibold text-primary">{currentBranch}</span></p>}
      </CardFooter>
    </Card>
  );
}
