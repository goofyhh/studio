
"use client";

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
import Image from 'next/image';
import { initialMockUsers, type UserEntry } from '@/components/users/ManageUsersPage'; // Import user data

interface ReportEntry {
  id: string;
  employeeCode: string;
  employeeName: string;
  photoUrl?: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:MM AM/PM
  clockOut: string; // HH:MM AM/PM
  hoursWorked: string; // Xh Ym or "0h 0m - Absent"
  branch: string;
}

// Helper to format Date object to 'HH:MM AM/PM'
function formatTimeForReport(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

// Helper to format Date object to 'YYYY-MM-DD'
function formatDateForReport(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to calculate hours worked
function calculateHoursWorkedReport(clockInDate: Date, clockOutDate: Date): string {
  const diffMs = clockOutDate.getTime() - clockInDate.getTime();
  if (diffMs <= 0) return '0h 0m';
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${diffHours}h ${diffMinutes}m`;
}

const generateMockReportData = (): ReportEntry[] => {
  const data: ReportEntry[] = [];
  let entryId = 1;
  const activeUsers = initialMockUsers.filter(user => user.status === 'Active');
  
  const today = new Date();
  const startDate = new Date(today.getFullYear(), 4, 1); // May 1st of current year

  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Skip Sunday (0) and Saturday (6)
      continue;
    }

    const currentDateStr = formatDateForReport(d);

    activeUsers.forEach(user => {
      const isAbsent = Math.random() < 0.05; // 5% chance of being absent

      if (isAbsent) {
        data.push({
          id: String(entryId++),
          employeeCode: user.loginCode,
          employeeName: `${user.name} ${user.surname}`,
          photoUrl: `https://placehold.co/40x40.png?text=${user.name[0]}${user.surname[0]}`,
          date: currentDateStr,
          clockIn: 'N/A',
          clockOut: 'N/A',
          hoursWorked: '0h 0m - Absent',
          branch: user.branch,
        });
      } else {
        // Simulate clock-in time (e.g., 9:00 AM +/- 15 mins)
        const clockInHour = 9;
        const clockInMinute = Math.floor(Math.random() * 31) - 15; // -15 to +15 minutes around 9:00
        const clockInDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), clockInHour, clockInMinute);

        // Simulate clock-out time (8 hours after clock-in +/- 15 mins)
        const clockOutHour = clockInHour + 8;
        const clockOutMinuteOffset = Math.floor(Math.random() * 31) - 15; // -15 to +15 minutes
        const clockOutDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), clockOutHour, clockInMinute + clockOutMinuteOffset);
        
        // Ensure clock out is after clock in
        if (clockOutDate <= clockInDate) {
            // if somehow clock out is before clock in, adjust to be 8 hours after fixed clock in
            const fixedClockOutDate = new Date(clockInDate);
            fixedClockOutDate.setHours(clockInDate.getHours() + 8);
             data.push({
                id: String(entryId++),
                employeeCode: user.loginCode,
                employeeName: `${user.name} ${user.surname}`,
                photoUrl: `https://placehold.co/40x40.png?text=${user.name[0]}${user.surname[0]}`,
                date: currentDateStr,
                clockIn: formatTimeForReport(clockInDate),
                clockOut: formatTimeForReport(fixedClockOutDate),
                hoursWorked: calculateHoursWorkedReport(clockInDate, fixedClockOutDate),
                branch: user.branch,
            });
        } else {
             data.push({
                id: String(entryId++),
                employeeCode: user.loginCode,
                employeeName: `${user.name} ${user.surname}`,
                photoUrl: `https://placehold.co/40x40.png?text=${user.name[0]}${user.surname[0]}`,
                date: currentDateStr,
                clockIn: formatTimeForReport(clockInDate),
                clockOut: formatTimeForReport(clockOutDate),
                hoursWorked: calculateHoursWorkedReport(clockInDate, clockOutDate),
                branch: user.branch,
            });
        }
      }
    });
  }
  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || a.employeeName.localeCompare(b.employeeName)); // Sort by date desc, then name
};

const mockReportData: ReportEntry[] = generateMockReportData();

export function TimeReportTable({ startDate, endDate }: { startDate?: Date, endDate?: Date }) {
  const filteredData = mockReportData.filter(entry => {
    const entryDate = new Date(entry.date);
    // Adjust entryDate to midnight UTC to match startDate/endDate which are typically midnight local time
    const entryDateUTC = new Date(Date.UTC(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate()));

    if (startDate) {
        const filterStartDateUTC = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
        if (entryDateUTC < filterStartDateUTC) return false;
    }
    if (endDate) {
        const filterEndDateUTC = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()));
        if (entryDateUTC > filterEndDateUTC) return false;
    }
    return true;
  });

  if (filteredData.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No data available for the selected period.</p>;
  }

  return (
    <Table>
      <TableCaption>A list of clock-in/out records. Found {filteredData.length} entries.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Photo</TableHead>
          <TableHead>Employee Code</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Clock In</TableHead>
          <TableHead>Clock Out</TableHead>
          <TableHead>Hours Worked</TableHead>
          <TableHead>Branch</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredData.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>
              {entry.photoUrl ? (
                <Image 
                  src={entry.photoUrl} 
                  alt={entry.employeeName} 
                  width={40} 
                  height={40} 
                  className="rounded-full"
                  data-ai-hint="employee avatar"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">N/A</div>
              )}
            </TableCell>
            <TableCell className="font-medium">{entry.employeeCode}</TableCell>
            <TableCell>{entry.employeeName}</TableCell>
            <TableCell>{entry.date}</TableCell>
            <TableCell>{entry.clockIn}</TableCell>
            <TableCell>{entry.clockOut}</TableCell>
            <TableCell>
              {entry.hoursWorked.includes('Absent') ? 
                <Badge variant="destructive" className="whitespace-nowrap">{entry.hoursWorked}</Badge> : 
                entry.hoursWorked
              }
            </TableCell>
            <TableCell><Badge variant="outline">{entry.branch}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

    