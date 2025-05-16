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

interface ReportEntry {
  id: string;
  employeeCode: string;
  employeeName: string;
  photoUrl?: string; // Placeholder for captured photo
  date: string;
  clockIn: string;
  clockOut: string;
  hoursWorked: string;
  branch: string;
}

const mockReportData: ReportEntry[] = [
  { id: '1', employeeCode: 'EMP001', employeeName: 'Alice Smith', photoUrl: 'https://placehold.co/40x40.png?text=AS', date: '2024-07-28', clockIn: '09:02 AM', clockOut: '05:05 PM', hoursWorked: '8h 3m', branch: 'Main Street' },
  { id: '2', employeeCode: 'EMP002', employeeName: 'Bob Johnson', photoUrl: 'https://placehold.co/40x40.png?text=BJ', date: '2024-07-28', clockIn: '08:58 AM', clockOut: '05:15 PM', hoursWorked: '8h 17m', branch: 'Downtown' },
  { id: '3', employeeCode: 'EMP003', employeeName: 'Carol Williams', photoUrl: 'https://placehold.co/40x40.png?text=CW', date: '2024-07-28', clockIn: '09:15 AM', clockOut: '04:50 PM', hoursWorked: '7h 35m', branch: 'Main Street' },
  { id: '4', employeeCode: 'EMP001', employeeName: 'Alice Smith', photoUrl: 'https://placehold.co/40x40.png?text=AS', date: '2024-07-27', clockIn: '09:00 AM', clockOut: '05:01 PM', hoursWorked: '8h 1m', branch: 'Westside' },
  { id: '5', employeeCode: 'EMP004', employeeName: 'David Brown', date: '2024-07-27', clockIn: 'N/A', clockOut: 'N/A', hoursWorked: '0h 0m - Absent', branch: 'Downtown' },
];

// Filter mock data based on selected dates (example)
export function TimeReportTable({ startDate, endDate }: { startDate?: Date, endDate?: Date }) {
  // Basic filtering logic (can be expanded)
  const filteredData = mockReportData.filter(entry => {
    const entryDate = new Date(entry.date);
    if (startDate && entryDate < startDate) return false;
    if (endDate && entryDate > endDate) return false;
    return true;
  });

  if (filteredData.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No data available for the selected period.</p>;
  }

  return (
    <Table>
      <TableCaption>A list of recent clock-in/out records.</TableCaption>
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
                <Badge variant="destructive">{entry.hoursWorked}</Badge> : 
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
