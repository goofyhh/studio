
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, CalendarIcon, Search, Filter as FilterIcon } from 'lucide-react'; // Added Search and FilterIcon
import { TimeReportTable } from './TimeReportTable';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input'; // Added Input
import { Label } from '@/components/ui/label'; // Added Label
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Added Select
import { MOCK_BRANCHES } from '@/components/settings/BranchSelector'; // Import MOCK_BRANCHES

const ALL_BRANCHES_VALUE = "all-branches";

export function ReportsPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>(''); // Empty string for 'All Branches'
  const { toast } = useToast();

  const handleExport = () => {
    // Mock export functionality
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
              {/* Date Filters */}
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
               <div className="lg:col-span-1"> {/* Empty div to push export button to the right on larger screens or use for export button */}
                {/* Export button will be placed after filters */}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 items-end">
              {/* Search and Branch Filter */}
              <div>
                <Label htmlFor="searchEmployee">Search Employee (Name/Code)</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="searchEmployee"
                    type="text"
                    placeholder="Enter name or code..."
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
            startDate={startDate} 
            endDate={endDate}
            searchTerm={searchTerm}
            selectedBranch={selectedBranch}
          />
        </CardContent>
      </Card>
    </div>
  );
}
