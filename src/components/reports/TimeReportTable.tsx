
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

  let nightHoursPortion = 0;
  let sundayHoursPortion = 0;
  let holidayHoursPortion = 0;
  let dayIsHoliday = false;

  const tempCurrentTime = new Date(clockInDate.getTime());
  const intervalMillis = 1 * 60 * 1000; // 1 minute chunks

  while (tempCurrentTime < clockOutDate) {
    const minuteChunkEnd = new Date(Math.min(tempCurrentTime.getTime() + intervalMillis, clockOutDate.getTime()));
    const chunkDurationMillis = minuteChunkEnd.getTime() - tempCurrentTime.getTime();
    const chunkDurationHours = chunkDurationMillis / (1000 * 60 * 60);

    const hour = tempCurrentTime.getHours();
    const dayOfWeek = tempCurrentTime.getDay(); // 0 for Sunday

    // Night shift check (20:00 to 06:00 next day)
    // Check if the *start* of the 1-minute interval falls within night hours
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
  
  // Surcharge logic:
  // Night surcharge: 50% of night hours
  // Sunday surcharge: 100% of Sunday hours (these hours are *also* Sunday hours, not *in addition* to normal pay)
  // Holiday surcharge: 100% of holiday hours (similarly, these are holiday hours)

  // Avoid double-counting surcharge if a night hour is also a Sunday/Holiday hour.
  // The highest surcharge rate applies. Sunday/Holiday (100%) > Night (50%).
  // This means we should calculate the base for 100% surcharge first, then night surcharge on remaining hours.
  
  let totalSurchargeDecimal = 0;

  // Calculate holiday and Sunday surcharges first, as they are 100%
  const holidayOrSundayHours = holidayHoursPortion + (dayIsHoliday ? 0 : sundayHoursPortion); // If it's a holiday, holiday surcharge takes precedence over Sunday.
  totalSurchargeDecimal += holidayOrSundayHours * 1.00; // 100%

  // Calculate night surcharge on hours that were NOT already covered by holiday/Sunday surcharge
  // This logic needs refinement. Let's assume for now surcharges are additive for simplicity of mock data generation,
  // but in a real system, this would need careful handling of overlapping conditions.
  // For this mock, we'll simplify: if an hour is night AND holiday, it gets holiday rate. If night AND Sunday (not holiday), it gets Sunday rate.
  
  // Simpler additive model for mock:
  const nightSurcharge = nightHoursPortion * 0.50; 
  const sundaySurchargeVal = sundayHoursPortion * 1.00; 
  const holidaySurchargeVal = holidayHoursPortion * 1.00;

  // The problem asks for "extra hours gained".
  // So if night hours are 4, extra is 4 * 0.5 = 2.
  // If Sunday hours are 8, extra is 8 * 1.0 = 8.
  // If Holiday hours are 8, extra is 8 * 1.0 = 8.

  // If an hour is both night and Sunday, it should get 100% (Sunday rate) not 50% + 100%.
  // The prompt says "multiplied by", implying the surcharge *replaces* normal pay factor for those hours.
  // However, the request is for "extra hours gained".
  // Let's stick to calculating "extra" hours.
  
  let calculatedSurcharge = 0;
  // Reset tempCurrentTime for a new pass to determine non-overlapping surcharge
  tempCurrentTime.setTime(clockInDate.getTime());
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
    } else if (hour >= 20 || hour < 6) {
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

  // Ensure "today" does not go past the actual current date if the script runs for a while.
  const currentDateLimit = new Date(); 

  for (let d = new Date(reportStartDate); d <= currentDateLimit && d.getMonth() <= today.getMonth(); d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    const currentDateStr = formatDateForReport(d);

    activeUsers.forEach(user => {
      // Specific night shift example for May 8th for Juan Perez (JP101) and Maria Gonzalez (MG202)
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
          date: formatDateForReport(clockInDate), // Date of clock-in
          clockIn: formatTimeForReport(clockInDate),
          clockOut: formatTimeForReport(clockOutDate),
          hoursWorked: hoursWorkedStr,
          branch: user.branch,
          surchargeHours: surchargeHoursStr,
          isHoliday: surchargeDetails.workedOnHoliday, // Checks if any part of shift was on holiday
        });
        return; // Skip regular generation for this user on this day
      }


      // Skip most Saturdays and Sundays for regular generation
      if (dayOfWeek === 6) return; // Skip Saturday
      if (dayOfWeek === 0 && Math.random() > 0.2) return; // 20% chance of working on Sunday for regular mock data


      const isAbsent = Math.random() < 0.05 && !(d.getDay() === 0 && Math.random() <= 0.2) ; // 5% chance of being absent, less likely on a "worked" Sunday

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
        let clockInHourBase = 8; // Default clock-in base hour
        let workDurationHoursBase = 8;

        // Simulate some Sunday shifts if dayOfWeek is 0 and not skipped by the 20% chance
        if (dayOfWeek === 0) {
            clockInHourBase = 9 + Math.floor(Math.random() * 3); // Clock in between 9-11 AM on Sundays
            workDurationHoursBase = 6 + Math.random()*2; // 6-8 hours shift on Sunday
        }

        const clockInHour = clockInHourBase + Math.floor(Math.random() * 2); 
        const clockInMinute = Math.floor(Math.random() * 60);
        clockInDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), clockInHour, clockInMinute);
        
        const workDurationHours = workDurationHoursBase -0.5 + Math.random(); // e.g. 7.5 to 8.5 hours
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
    // Entry date is YYYY-MM-DD. We need to parse it carefully to avoid timezone issues.
    // Setting time to noon helps avoid DST or midnight issues with direct date comparisons.
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

