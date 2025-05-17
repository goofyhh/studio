
"use client";

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { initialMockUsers, type UserEntry } from '@/components/users/ManageUsersPage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; // Removed AvatarImage to rely on placehold.co via initials for simplicity now
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, ListChecks } from 'lucide-react';
import Image from 'next/image'; // For placeholder images

interface ClockedInUser extends UserEntry {
  mockClockInTime: string;
}

export function LiveClockedInUsers() {
  const { branch } = useAppContext();
  const [clockedInUsers, setClockedInUsers] = useState<ClockedInUser[]>([]);

  useEffect(() => {
    if (branch) {
      const usersInBranch = initialMockUsers.filter(user => user.branch === branch && user.status === 'Active');
      const simulatedUsers = usersInBranch.map(user => {
        const randomHour = Math.floor(Math.random() * 3) + 7; // 7, 8, 9 AM
        const randomMinute = Math.floor(Math.random() * 60);
        return {
          ...user,
          mockClockInTime: `${String(randomHour).padStart(2, '0')}:${String(randomMinute).padStart(2, '0')} AM`,
        };
      });
      setClockedInUsers(simulatedUsers);
    } else {
      setClockedInUsers([]);
    }
  }, [branch]);

  if (!branch) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ListChecks className="mr-2 h-6 w-6 text-primary" />
            Clocked-In Employees
          </CardTitle>
          <CardDescription>No branch selected for this Kiosk.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground text-center">Please configure the Kiosk branch.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <ListChecks className="mr-3 h-7 w-7 text-primary" />
          Currently Clocked-In ({branch})
        </CardTitle>
        <CardDescription>Live view of employees clocked-in at this branch (mock data).</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full p-6 pt-0">
          {clockedInUsers.length > 0 ? (
            <ul className="space-y-3">
              {clockedInUsers.map((user) => (
                <li key={user.id} className="flex items-center space-x-4 p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors shadow-sm">
                  <Avatar className="h-10 w-10">
                     <Image 
                        src={`https://placehold.co/40x40.png?text=${user.name[0]}${user.surname[0]}`} 
                        alt={`${user.name} ${user.surname}`}
                        width={40}
                        height={40}
                        className="rounded-full"
                        data-ai-hint="employee avatar"
                    />
                    <AvatarFallback>{`${user.name[0]}${user.surname[0]}`}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <p className="font-semibold text-md">{user.name} {user.surname}</p>
                    <p className="text-xs text-muted-foreground">{user.position}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-green-600">Clocked In</p>
                    <p className="text-xs text-muted-foreground">Since: {user.mockClockInTime}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Users className="h-10 w-10 mb-2" />
              <p>No employees currently active for {branch}.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
