
"use client";

import React, { useState, useMemo, useEffect } from 'react';
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
import { initialMockUsers, type UserEntry } from '@/components/users/ManageUsersPage';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  surchargeHours: string; // Calculated extra hours
  isHoliday: boolean; // True if the work day was a Paraguayan holiday
  observations?: string; // New field for "Audited" tag
}

// --- Helper Functions ---

// Define Paraguayan Holidays (month is 0-indexed, day is 1-indexed)
const paraguayanHolidays: Array<{ month: number; day: number; name: string }> = [
  { month: 0, day: 1, name: "New Year's Day" },   // New Year's Day (Jan 1)
  { month: 2, day: 1, name: "Heroes' Day" },   // Heroes' Day (Mar 1)
  { month: 4, day: 1, name: "Labor Day" },   // Labor Day (May 1)
  { month: 4, day: 14, name: "Independence Day" },  // Independence Day (May 14)
  { month: 4, day: 15, name: "Independence Day" },  // Independence Day (May 15)
  { month: 5, day: 12, name: "Chaco Armistice" },  // Chaco Armistice (Jun 12)
  { month: 7, day: 15, name: "Founding of Asunción" },  // Founding of Asunción (Aug 15)
  { month: 8, day: 29, name: "Battle of Boquerón Victory" },  // Battle of Boquerón Victory (Sep 29)
  { month: 11, day: 8, name: "Virgin of Caacupé Day" },  // Virgin of Caacupé Day (Dec 8)
  { month: 11, day: 25, name: "Christmas Day" }, // Christmas Day (Dec 25)
  // Good Friday and Holy Thursday are variable, not included for simplicity in mock data.
];

function isGivenDayHoliday(date: Date): boolean {
  const month = date.getMonth();
  const day = date.getDate();
  return paraguayanHolidays.some(h => h.month === month && h.day === day);
}

function formatDecimalHoursToHM(decimalHours: number): string {
  if (decimalHours < 0.001 && decimalHours > -0.001) return "0h 0m"; // Handle floating point for near-zero
  const sign = decimalHours < 0 ? "-" : "";
  const absDecimalHours = Math.abs(decimalHours);
  const totalMinutes = Math.round(absDecimalHours * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${sign}${hours}h ${minutes}m`;
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

// Helper to calculate hours worked as decimal
function calculateHoursWorkedDecimal(clockInDate: Date, clockOutDate: Date): number {
  const diffMs = clockOutDate.getTime() - clockInDate.getTime();
  if (diffMs <= 0) return 0;
  return diffMs / (1000 * 60 * 60); // Convert milliseconds to hours
}

// Helper to calculate surcharge details
function calculateSurchargeDetails(clockInDate: Date, clockOutDate: Date): { totalSurchargeDecimal: number; workedOnHoliday: boolean } {
  if (clockInDate.getTime() >= clockOutDate.getTime()) {
    return { totalSurchargeDecimal: 0, workedOnHoliday: isGivenDayHoliday(clockInDate) };
  }

  let calculatedSurcharge = 0;
  let dayIsHoliday = false;
  const tempCurrentTime = new Date(clockInDate.getTime());
  const intervalMillis = 1 * 60 * 1000; // 1 minute chunks

  while (tempCurrentTime < clockOutDate) {
    const minuteChunkEnd = new Date(Math.min(tempCurrentTime.getTime() + intervalMillis, clockOutDate.getTime()));
    const chunkDurationMillis = minuteChunkEnd.getTime() - tempCurrentTime.getTime();
    const chunkDurationHours = chunkDurationMillis / (1000 * 60 * 60);

    const hour = tempCurrentTime.getHours();
    const dayOfWeek = tempCurrentTime.getDay();
    const isHolidayFlag = isGivenDayHoliday(tempCurrentTime);

    if (isHolidayFlag) {
      calculatedSurcharge += chunkDurationHours * 1.00; // 100% extra for holiday
      dayIsHoliday = true;
    } else if (dayOfWeek === 0) {
      calculatedSurcharge += chunkDurationHours * 1.00; // 100% extra for Sunday
    } else if (hour >= 20 || hour < 6) { // Night shift
      calculatedSurcharge += chunkDurationHours * 0.50; // 50% extra for night
    }
    tempCurrentTime.setTime(tempCurrentTime.getTime() + intervalMillis);
  }

  return { totalSurchargeDecimal: calculatedSurcharge, workedOnHoliday: dayIsHoliday };
}


const generateMockReportData = (): ReportEntry[] => {
  const data: ReportEntry[] = [];
  let entryId = 1;
  const activeUsers = initialMockUsers.filter(user => user.status === 'Active');
  
  const today = new Date();
  const reportStartDate = new Date(today.getFullYear(), 4, 1); // May 1st of current year

  const currentDateLimit = new Date(); 

  for (let d = new Date(reportStartDate); d <= currentDateLimit && d.getMonth() <= today.getMonth(); d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay(); // 0=Sunday, 6=Saturday
    const currentDateStr = formatDateForReport(d);

    activeUsers.forEach(user => {
      // Specific night shift example for Juan Perez (JP101) and Maria Gonzalez (MG202)
      if ((user.loginCode === 'JP101' || user.loginCode === 'MG202') && d.getFullYear() === today.getFullYear() && d.getMonth() === 4 && d.getDate() === 8) {
        const clockInDate = new Date(d.getFullYear(), 4, 8, 21, 0, 0); // May 8th, 21:00
        const clockOutDate = new Date(d.getFullYear(), 4, 9, 5, 0, 0); // May 9th, 05:00

        const actualHoursWorkedDecimal = calculateHoursWorkedDecimal(clockInDate, clockOutDate);
        const hoursWorkedStr = formatDecimalHoursToHM(actualHoursWorkedDecimal);
        const surchargeDetails = calculateSurchargeDetails(clockInDate, clockOutDate);
        const surchargeHoursStr = formatDecimalHoursToHM(surchargeDetails.totalSurchargeDecimal);
        
        data.push({
          id: String(entryId++),
          employeeCode: user.loginCode,
          employeeName: `${user.name} ${user.surname}`,
          photoUrl: `https://placehold.co/40x40.png?text=${user.name[0]}${user.surname[0]}`,
          date: formatDateForReport(clockInDate),
          clockIn: formatTimeForReport(clockInDate),
          clockOut: formatTimeForReport(clockOutDate),
          hoursWorked: hoursWorkedStr,
          branch: user.branch,
          surchargeHours: surchargeHoursStr,
          isHoliday: surchargeDetails.workedOnHoliday,
          observations: undefined,
        });
        return; 
      }

      if (dayOfWeek === 6) return; // Skip Saturday for regular generation
      if (dayOfWeek === 0 && Math.random() > 0.2) return; // 20% chance of working on Sunday for regular mock data

      const isAbsent = Math.random() < 0.05 && !(dayOfWeek === 0 && Math.random() <= 0.2); 
      let clockInDate: Date;
      let clockOutDate: Date;
      let hoursWorkedStr: string;
      let surchargeHoursStr: string;
      let entryIsHoliday = false;

      if (isAbsent) {
        clockInDate = new Date(d); 
        clockOutDate = new Date(d);
        hoursWorkedStr = '0h 0m - Absent';
        surchargeHoursStr = '0h 0m';
        entryIsHoliday = isGivenDayHoliday(d);
      } else {
        let clockInHourBase = 8; 
        let workDurationHoursBase = 8;

        if (dayOfWeek === 0) { // Sunday shift
            clockInHourBase = 9 + Math.floor(Math.random() * 3); 
            workDurationHoursBase = 6 + Math.random()*2; 
        }

        const clockInHour = clockInHourBase + Math.floor(Math.random() * 2); 
        const clockInMinute = Math.floor(Math.random() * 60);
        clockInDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), clockInHour, clockInMinute);
        
        const workDurationHours = workDurationHoursBase -0.5 + Math.random(); 
        clockOutDate = new Date(clockInDate.getTime() + workDurationHours * 60 * 60 * 1000);
        
        const actualHoursWorkedDecimal = calculateHoursWorkedDecimal(clockInDate, clockOutDate);
        hoursWorkedStr = formatDecimalHoursToHM(actualHoursWorkedDecimal);
        
        const surchargeDetails = calculateSurchargeDetails(clockInDate, clockOutDate);
        surchargeHoursStr = formatDecimalHoursToHM(surchargeDetails.totalSurchargeDecimal);
        entryIsHoliday = surchargeDetails.workedOnHoliday;
      }

      data.push({
        id: String(entryId++),
        employeeCode: user.loginCode,
        employeeName: `${user.name} ${user.surname}`,
        photoUrl: `https://placehold.co/40x40.png?text=${user.name[0]}${user.surname[0]}`,
        date: currentDateStr,
        clockIn: isAbsent ? 'N/A' : formatTimeForReport(clockInDate),
        clockOut: isAbsent ? 'N/A' : formatTimeForReport(clockOutDate),
        hoursWorked: hoursWorkedStr,
        branch: user.branch,
        surchargeHours: surchargeHoursStr,
        isHoliday: entryIsHoliday,
        observations: undefined,
      });
    });
  }
  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || a.employeeName.localeCompare(b.employeeName));
};

// This constant is generated once when the module loads.
const initialReportData: ReportEntry[] = generateMockReportData();

interface TimeReportTableProps {
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
  selectedBranch?: string;
}

export function TimeReportTable({ startDate, endDate, searchTerm, selectedBranch }: TimeReportTableProps) {
  const [reportEntries, setReportEntries] = useState<ReportEntry[]>(initialReportData);
  const { user } = useAppContext();
  const { toast } = useToast();

  // If the props for filtering change, reset reportEntries to a fresh filter of initialReportData
  // This is to ensure that if filters change, we are not operating on a stale "audited" set.
  // However, this might clear "Audited" tags if parent re-renders for other reasons.
  // For simplicity now, we'll keep local state for 'Audited' and re-filter the current `reportEntries` state.
  // A more robust system would handle this with a backend or more complex state management.


  const handleEditLog = (entryId: string) => {
    if (user?.role !== 'Administrator') {
      toast({ title: "Permission Denied", description: "Only administrators can edit logs.", variant: "destructive" });
      return;
    }
    setReportEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.id === entryId ? { ...entry, observations: "Audited" } : entry
      )
    );
    toast({
      title: 'Log Audited (Mock)',
      description: `Log ID ${entryId} has been marked as audited. Full edit functionality is pending.`,
    });
  };
  
  const filteredData = useMemo(() => {
    return reportEntries.filter(entry => {
      const entryDateParts = entry.date.split('-').map(Number);
      const entryDate = new Date(entryDateParts[0], entryDateParts[1] - 1, entryDateParts[2], 12, 0, 0);
      
      if (startDate) {
          const filterStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);
          if (entryDate < filterStartDate) return false;
      }
      if (endDate) {
          const filterEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59);
          if (entryDate > filterEndDate) return false;
      }

      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchesSearch = 
          entry.employeeName.toLowerCase().includes(lowerSearchTerm) ||
          entry.employeeCode.toLowerCase().includes(lowerSearchTerm);
        if (!matchesSearch) return false;
      }

      if (selectedBranch && entry.branch !== selectedBranch) {
        return false;
      }
      
      return true;
    });
  }, [reportEntries, startDate, endDate, searchTerm, selectedBranch]);

  if (filteredData.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No data available for the selected criteria.</p>;
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
          <TableHead>Surcharge</TableHead> 
          <TableHead>Branch</TableHead>
          <TableHead>Observations</TableHead>
          <TableHead className="text-right">Actions</TableHead>
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
            <TableCell 
              className={entry.isHoliday && !entry.hoursWorked.includes('Absent') ? 'text-red-600 font-semibold' : ''}
            >
              {entry.hoursWorked.includes('Absent') ? 
                <Badge variant="destructive" className="whitespace-nowrap">{entry.hoursWorked}</Badge> : 
                entry.hoursWorked
              }
            </TableCell>
            <TableCell>{entry.surchargeHours}</TableCell> 
            <TableCell><Badge variant="outline">{entry.branch}</Badge></TableCell>
            <TableCell>
              {entry.observations ? (
                <Badge variant="secondary">{entry.observations}</Badge>
              ) : (
                '-'
              )}
            </TableCell>
            <TableCell className="text-right">
              {user?.role === 'Administrator' && (
                <Button variant="outline" size="sm" onClick={() => handleEditLog(entry.id)}>
                  <Edit className="h-3 w-3 mr-1" /> Edit
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

