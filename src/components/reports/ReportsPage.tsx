
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, CalendarIcon, Search, Filter as FilterIcon } from 'lucide-react';
import { TimeReportTable, initialReportData, type ReportEntry } from './TimeReportTable'; // Import initialReportData and ReportEntry
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MOCK_BRANCHES } from '@/components/settings/BranchSelector';
import { useAppContext } from '@/contexts/AppContext'; // For user role

const ALL_BRANCHES_VALUE = "all-branches";
const ALL_ROWS_VALUE = -1; // Special value for "All" rows

export function ReportsPage() {
  const { user } = useAppContext(); // Get user for role-based actions
  const { toast } = useToast();

  const [reportEntries, setReportEntries] = useState<ReportEntry[]>(initialReportData);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);


  const handleEditLog = (entryId: string) => {
    if (user?.role !== 'Administrator') {
      toast({ title: "Permission Denied", description: "Only administrators can edit logs.", variant: "destructive" });
      return;
    }
    setReportEntries(prevEntries =>
      prevEntries.map(entry =>
        entry.id === entryId ? { ...entry, observations: entry.observations ? `${entry.observations}, Audited` : "Audited" } : entry
      )
    );
    toast({
      title: 'Log Audited (Mock)',
      description: `Log ID ${entryId} has been marked as audited. Full edit functionality is pending.`,
    });
  };

  const handleFlagLog = (entryId: string, flag: string) => {
    if (user?.role !== 'Administrator' && user?.role !== 'Supervisor') {
      toast({ title: "Permission Denied", description: "Only administrators or supervisors can flag logs.", variant: "destructive" });
      return;
    }
    setReportEntries(prevEntries =>
      prevEntries.map(entry => {
        if (entry.id === entryId) {
          let newObservations = entry.observations ? entry.observations.split(', ') : [];
          if (flag === "Audited" && !newObservations.includes("Audited")) {
            newObservations.unshift("Audited");
          } else if (flag !== "Audited" && !newObservations.includes(flag)) {
            newObservations.push(flag);
          }
          newObservations = [...new Set(newObservations)].filter(obs => obs.trim() !== "");
          return { ...entry, observations: newObservations.join(', ') || undefined };
        }
        return entry;
      })
    );
    toast({
      title: 'Log Flagged',
      description: `Log ID ${entryId} has been flagged with "${flag}".`,
    });
  };

  const filteredEntries = useMemo(() => {
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
          entry.employeeCode.toLowerCase().includes(lowerSearchTerm) ||
          entry.position.toLowerCase().includes(lowerSearchTerm);
        if (!matchesSearch) return false;
      }

      if (selectedBranch && entry.branch !== selectedBranch) {
        return false;
      }
      
      return true;
    });
  }, [reportEntries, startDate, endDate, searchTerm, selectedBranch]);

  const totalPages = rowsPerPage === ALL_ROWS_VALUE ? 1 : Math.ceil(filteredEntries.length / rowsPerPage);

  const paginatedEntries = useMemo(() => {
    if (rowsPerPage === ALL_ROWS_VALUE) {
      return filteredEntries;
    }
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredEntries.slice(startIndex, endIndex);
  }, [filteredEntries, currentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, searchTerm, selectedBranch, rowsPerPage]);


  const handleExport = () => {
    toast({
      title: 'Export Started',
      description: 'Report generation for Excel has started (mock function).',
    });
    console.log('Exporting report from', startDate, 'to', endDate, 'for employee/code:', searchTerm, 'and branch:', selectedBranch);
  };

  const availableBranches = MOCK_BRANCHES;

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Time Reports</CardTitle>
          <CardDescription>View and export employee clock-in/out data. Filter by date, employee, and branch.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6 p-4 border rounded-md bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="startDate"
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal mt-1"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a start date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="endDate"
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal mt-1"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick an end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) =>
                        startDate ? date < startDate : false
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="lg:col-span-1">
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 items-end">
              <div>
                <Label htmlFor="searchEmployee">Search Employee (Name/Code/Position)</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="searchEmployee"
                    type="text"
                    placeholder="Enter name, code, or position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="branchFilterReports">Filter by Branch</Label>
                <Select
                  value={selectedBranch || ALL_BRANCHES_VALUE}
                  onValueChange={(value) => setSelectedBranch(value === ALL_BRANCHES_VALUE ? "" : value)}
                >
                  <SelectTrigger id="branchFilterReports" className="w-full mt-1">
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
            </div>
          </div>
          
          <div className="flex justify-end mb-6">
            <Button onClick={handleExport} className="w-full md:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
          </div>
          
          <TimeReportTable 
            data={paginatedEntries}
            totalFilteredEntries={filteredEntries.length}
            onEditLog={handleEditLog}
            onFlagLog={handleFlagLog}
            userRole={user?.role || null}
          />

          {filteredEntries.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="rowsPerPageSelectReports" className="text-sm font-medium">Rows per page:</Label>
                <Select
                  value={String(rowsPerPage)}
                  onValueChange={(value) => {
                    setRowsPerPage(Number(value));
                  }}
                >
                  <SelectTrigger id="rowsPerPageSelectReports" className="w-[80px] h-9">
                    <SelectValue placeholder={String(rowsPerPage)} />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 25, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={String(pageSize)}>
                        {pageSize}
                      </SelectItem>
                    ))}
                    <SelectItem value={String(ALL_ROWS_VALUE)}>All</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Page {totalPages > 0 ? currentPage : 0} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || totalPages === 0}
                  className="h-9"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="h-9"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
