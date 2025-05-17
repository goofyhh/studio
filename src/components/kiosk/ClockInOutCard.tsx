
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Clock, Camera, LogIn, LogOut, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';

export function ClockInOutCard() {
  const [currentTime, setCurrentTime] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const { toast } = useToast();
  const { branch } = useAppContext();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    }, 1000);
    setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })); // Initial set
    return () => clearInterval(timer);
  }, []);

  const handleClockAction = (action: 'in' | 'out') => {
    if (!employeeCode) {
      toast({
        title: 'Error',
        description: 'Please enter your Employee Code.',
        variant: 'destructive',
      });
      return;
    }
    if (!branch) {
      toast({
        title: 'Branch Not Set',
        description: 'Kiosk branch is not configured. Please contact an administrator.',
        variant: 'destructive',
      });
      return;
    }
    // Mock action
    console.log(`Employee ${employeeCode} clocked ${action} at ${currentTime} for branch ${branch}`);
    toast({
      title: `Successfully Clocked ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      description: `Employee ${employeeCode} clocked ${action} at ${currentTime}. Photo captured (mock).`,
    });
    setEmployeeCode(''); // Clear code after action
  };

  return (
    <Card className="w-full shadow-lg h-full flex flex-col">
      <CardHeader className="text-center">
        <Clock className="mx-auto h-12 w-12 md:h-16 md:w-16 text-primary mb-2" />
        <CardTitle className="text-3xl md:text-5xl font-mono font-bold tracking-wider">{currentTime || "Loading..."}</CardTitle>
        {branch ? (
          <p className="text-muted-foreground text-md md:text-lg">Branch: {branch}</p>
        ) : (
          <p className="text-destructive text-sm flex items-center justify-center"><AlertCircle className="w-4 h-4 mr-1" />Branch not set. Contact Admin.</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 flex-grow">
        <div className="space-y-2">
          <Label htmlFor="employeeCodeKiosk" className="text-md md:text-lg font-semibold">Employee Code</Label>
          <Input
            id="employeeCodeKiosk"
            type="password" // Use password type to obscure code visually
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value)}
            placeholder="Enter your code"
            className="text-center text-xl md:text-2xl h-14 md:h-16 rounded-lg"
            aria-label="Employee Code"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <Button onClick={() => handleClockAction('in')} className="text-lg md:text-xl py-6 md:py-8 rounded-lg bg-green-600 hover:bg-green-700 text-white">
            <LogIn className="mr-2 h-5 w-5 md:h-6 md:w-6" /> Clock In
          </Button>
          <Button onClick={() => handleClockAction('out')} className="text-lg md:text-xl py-6 md:py-8 rounded-lg bg-red-600 hover:bg-red-700 text-white">
            <LogOut className="mr-2 h-5 w-5 md:h-6 md:w-6" /> Clock Out
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center justify-center p-4 md:p-6 bg-muted/50 rounded-b-lg">
        <div className="flex items-center text-muted-foreground mb-2">
          <Camera className="h-5 w-5 md:h-6 md:w-6 mr-2" />
          <p className="text-xs md:text-sm">Photo will be captured upon clocking in/out.</p>
        </div>
        <div data-ai-hint="photo capture area" className="w-full h-20 md:h-24 bg-gray-200 border-2 border-dashed border-gray-400 rounded-md flex items-center justify-center text-gray-500 text-sm md:text-base">
          Photo Capture Area
        </div>
      </CardFooter>
    </Card>
  );
}
