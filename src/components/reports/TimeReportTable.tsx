
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
import { initialMockUsers, type UserEntry } from '@/components/users/ManageUsersPage';

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
}

// --- Helper Functions ---

// Define Paraguayan Holidays (month is 0-indexed, day is 1-indexed)
const paraguayanHolidays: Array<{ month: number; day: number }> = [
  { month: 0, day: 1 },   // New Year's Day (Jan 1)
  { month: 2, day: 1 },   // Heroes' Day (Mar 1)
  { month: 4, day: 1 },   // Labor Day (May 1)
  { month: 4, day: 14 },  // Independence Day (May 14)
  { month: 4, day: 15 },  // Independence Day (May 15)
  { month: 5, day: 12 },  // Chaco Armistice (Jun 12)
  { month: 7, day: 15 },  // Founding of Asunción (Aug 15)
  { month: 8, day: 29 },  // Battle of Boquerón Victory (Sep 29)
  { month: 11, day: 8 },  // Virgin of Caacupé Day (Dec 8)
  { month: 11, day: 25 }, // Christmas Day (Dec 25)
];

function isGivenDayHoliday(date: Date): boolean {
  const month = date.getMonth();
  const day = date.getDate();
  return paraguayanHolidays.some(h => h.month === month && h.day === day);
}

function formatDecimalHoursToHM(decimalHours: number): string {
  if (decimalHours < 0.001) return "0h 0m"; // Handle floating point for near-zero
  const totalMinutes = Math.round(decimalHours * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
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

// Helper to calculate surcharge hours
function calculateSurchargeDetails(clockInDate: Date, clockOutDate: Date): { totalSurchargeDecimal: number; workedOnHoliday: boolean } {
  if (clockInDate.getTime() >= clockOutDate.getTime()) {
    return { totalSurchargeDecimal: 0, workedOnHoliday: isGivenDayHoliday(clockInDate) };
  }

  let nightHoursPortion = 0;
  let sundayHoursPortion = 0;
  let holidayHoursPortion = 0;
  let dayIsHoliday = false;

  const tempCurrentTime = new Date(clockInDate.getTime());
  const intervalMillis = 60 * 1000; // 1 minute chunks

  while (tempCurrentTime < clockOutDate) {
    const minuteChunkEnd = new Date(Math.min(tempCurrentTime.getTime() + intervalMillis, clockOutDate.getTime()));
    const chunkDurationMillis = minuteChunkEnd.getTime() - tempCurrentTime.getTime();
    const chunkDurationHours = chunkDurationMillis / (1000 * 60 * 60);

    const hour = tempCurrentTime.getHours();
    const dayOfWeek = tempCurrentTime.getDay(); // 0 for Sunday

    // Night shift check (20:00 to 06:00 next day)
    if (hour >= 20 || hour < 6) {
      nightHoursPortion += chunkDurationHours;
    }

    // Sunday check
    if (dayOfWeek === 0) {
      sundayHoursPortion += chunkDurationHours;
    }

    // Holiday check
    if (isGivenDayHoliday(tempCurrentTime)) {
      holidayHoursPortion += chunkDurationHours;
      dayIsHoliday = true; // Mark if any part of the shift touches a holiday
    }
    
    tempCurrentTime.setTime(tempCurrentTime.getTime() + intervalMillis);
  }
  
  const nightSurcharge = nightHoursPortion * 0.50; // 50% of night hours
  const sundaySurcharge = sundayHoursPortion * 1.00; // 100% of Sunday hours
  const holidaySurcharge = holidayHoursPortion * 1.00; // 100% of holiday hours
  
  // Surcharges are additive based on the hours falling into each category
  const totalSurchargeDecimal = nightSurcharge + sundaySurcharge + holidaySurcharge;

  return { totalSurchargeDecimal, workedOnHoliday: dayIsHoliday };
}


const generateMockReportData = (): ReportEntry[] => {
  const data: ReportEntry[] = [];
  let entryId = 1;
  const activeUsers = initialMockUsers.filter(user => user.status === 'Active');
  
  const today = new Date();
  const reportStartDate = new Date(today.getFullYear(), 4, 1); // May 1st of current year

  for (let d = new Date(reportStartDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Skip generating entries for Saturday (6) and Sunday (0) by default, Sunday surcharge is handled if they *do* work.
      // We still need to generate entries if they *did* work on a Sunday for the surcharge calculation.
      // For simplicity of base data generation, we'll make most entries weekdays.
      // Sunday/Holiday work will be less common in this mock data.
      // Let's allow some Sunday work for testing Sunday surcharge.
      if (dayOfWeek === 6) continue; // Skip most Saturdays
      if (dayOfWeek === 0 && Math.random() > 0.2) continue; // Only 20% chance of working on Sunday for mock data generation.
    }

    const currentDateStr = formatDateForReport(d);

    activeUsers.forEach(user => {
      const isAbsent = Math.random() < 0.05; // 5% chance of being absent

      let clockInDate: Date;
      let clockOutDate: Date;
      let hoursWorkedStr: string;
      let surchargeHoursStr: string;
      let entryIsHoliday = false;

      if (isAbsent) {
        clockInDate = new Date(d); // dummy
        clockOutDate = new Date(d); // dummy
        hoursWorkedStr = '0h 0m - Absent';
        surchargeHoursStr = '0h 0m';
        entryIsHoliday = isGivenDayHoliday(d); // Still check if the day itself was a holiday
      } else {
        const clockInHour = 8 + Math.floor(Math.random() * 2); // Clock in between 8-9 AM
        const clockInMinute = Math.floor(Math.random() * 60);
        clockInDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), clockInHour, clockInMinute);

        // Simulate work duration (around 8 hours, with some variation)
        const workDurationHours = 7.5 + Math.random(); // 7.5 to 8.5 hours
        clockOutDate = new Date(clockInDate.getTime() + workDurationHours * 60 * 60 * 1000);
        
        // Override for specific scenarios to test surcharges
        if (user.loginCode === 'JP101' && d.getDate() % 5 === 0) { // JP101 works some night shifts
            const nightClockInHour = 19 + Math.floor(Math.random() * 2); // 19:xx or 20:xx
            const nightClockInMinute = Math.floor(Math.random() * 60);
            clockInDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), nightClockInHour, nightClockInMinute);
            clockOutDate = new Date(clockInDate.getTime() + (8 + Math.random()) * 60 * 60 * 1000); // 8-9 hours shift
        }
        if (user.loginCode === 'MG202' && d.getDay() === 0) { // MG202 works on some Sundays
             // Already handled by allowing Sunday generation, ensure clock-in/out times are reasonable
            const sundayClockInHour = 9 + Math.floor(Math.random() * 3); // 9-11 AM
            clockInDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), sundayClockInHour, Math.floor(Math.random() * 60));
            clockOutDate = new Date(clockInDate.getTime() + (6 + Math.random()*2) * 60 * 60 * 1000); // 6-8 hours shift
        }


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
      });
    });
  }
  return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || a.employeeName.localeCompare(b.employeeName));
};

const mockReportData: ReportEntry[] = generateMockReportData();

interface TimeReportTableProps {
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
  selectedBranch?: string;
}

export function TimeReportTable({ startDate, endDate, searchTerm, selectedBranch }: TimeReportTableProps) {
  
  const filteredData = mockReportData.filter(entry => {
    const entryDate = new Date(entry.date + "T00:00:00"); // Ensure date is parsed in local timezone context
    
    if (startDate) {
        const filterStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        if (entryDate < filterStartDate) return false;
    }
    if (endDate) {
        const filterEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
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
          <TableHead>Surcharge</TableHead> {/* New Column */}
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
            <TableCell 
              className={entry.isHoliday && !entry.hoursWorked.includes('Absent') ? 'text-red-600 font-semibold' : ''}
            >
              {entry.hoursWorked.includes('Absent') ? 
                <Badge variant="destructive" className="whitespace-nowrap">{entry.hoursWorked}</Badge> : 
                entry.hoursWorked
              }
            </TableCell>
            <TableCell>{entry.surchargeHours}</TableCell> {/* New Cell */}
            <TableCell><Badge variant="outline">{entry.branch}</Badge></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

