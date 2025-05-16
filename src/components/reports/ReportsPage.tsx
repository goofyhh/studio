"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, CalendarIcon } from 'lucide-react';
import { TimeReportTable } from './TimeReportTable';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function ReportsPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();

  const handleExport = () => {
    // Mock export functionality
    toast({
      title: 'Export Started',
      description: 'Report generation for Excel has started (mock function).',
    });
    console.log('Exporting report from', startDate, 'to', endDate);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Time Reports</CardTitle>
          <CardDescription>View and export employee clock-in/out data.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full md:w-[280px] justify-start text-left font-normal"
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
            <span className="text-muted-foreground hidden md:block">-</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className="w-full md:w-[280px] justify-start text-left font-normal"
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
            <Button onClick={handleExport} className="w-full md:w-auto ml-auto">
              <Download className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
          </div>
          
          <TimeReportTable startDate={startDate} endDate={endDate} />
        </CardContent>
      </Card>
    </div>
  );
}
