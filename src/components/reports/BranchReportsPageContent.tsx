
"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PieChart as PieChartIcon, CalendarIcon as CalendarLucideIcon, Clock10 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { initialReportData, type ReportEntry } from '@/components/reports/TimeReportTable';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(200, 70%, 50%)',
  'hsl(150, 60%, 45%)',
  'hsl(50, 80%, 60%)',
  'hsl(320, 65%, 55%)',
  'hsl(20, 75%, 58%)',
];

// Helper function to parse "Xh Ym" string to decimal hours
// This should be kept consistent with the one in AdminSupervisorDashboard or moved to a util
function parseHoursStringToDecimal(hoursStr: string): number {
  if (!hoursStr || hoursStr.includes('Absent') || hoursStr === 'N/A') {
    return 0;
  }
  let totalHours = 0;
  const hoursMatch = hoursStr.match(/(\d+)h/);
  const minutesMatch = hoursStr.match(/(\d+)m/);
  if (hoursMatch) {
    totalHours += parseInt(hoursMatch[1], 10);
  }
  if (minutesMatch) {
    totalHours += parseInt(minutesMatch[1], 10) / 60;
  }
  return totalHours;
}

export function BranchReportsPageContent() {
  const today = new Date();
  const thirtyDaysAgo = new Date(new Date().setDate(today.getDate() - 30));
  const [startDate, setStartDate] = useState<Date | undefined>(thirtyDaysAgo);
  const [endDate, setEndDate] = useState<Date | undefined>(today);

  const hoursByBranchDistribution = useMemo(() => {
    const branchHours: Record<string, number> = {};

    const filteredReportData = initialReportData.filter(entry => {
      if (!entry.date) return false;
      const entryDateParts = entry.date.split('-').map(Number);
      const entryDateObj = new Date(entryDateParts[0], entryDateParts[1] - 1, entryDateParts[2], 12, 0, 0);

      if (startDate) {
        const filterStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);
        if (entryDateObj < filterStart) return false;
      }
      if (endDate) {
        const filterEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59);
        if (entryDateObj > filterEnd) return false;
      }
      return true;
    });

    filteredReportData.forEach(entry => {
      const hours = parseHoursStringToDecimal(entry.hoursWorked);
      branchHours[entry.branch] = (branchHours[entry.branch] || 0) + hours;
    });

    return Object.entries(branchHours)
      .map(([name, value], index) => ({
        name,
        value: parseFloat(value.toFixed(2)),
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .filter(b => b.value > 0);
  }, [startDate, endDate]);

  const hoursByBranchChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    hoursByBranchDistribution.forEach(branch => {
      config[branch.name] = {
        label: `${branch.name} (${branch.value.toFixed(1)}h)`,
        color: branch.fill,
      };
    });
    return config;
  }, [hoursByBranchDistribution]);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center">
            <Clock10 className="mr-3 h-8 w-8 text-primary" />
            Branch Hours Overview
          </CardTitle>
          <CardDescription>Distribution of total work hours by branch for the selected period.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6 p-4 border rounded-md bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <Label htmlFor="startDateBranchHours">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="startDateBranchHours"
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal mt-1"
                    >
                      <CalendarLucideIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
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
                <Label htmlFor="endDateBranchHours">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="endDateBranchHours"
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal mt-1"
                    >
                      <CalendarLucideIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
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
            </div>
          </div>
          <div className="h-[400px] md:h-[500px] w-full">
            {hoursByBranchDistribution.length > 0 ? (
              <ChartContainer config={hoursByBranchChartConfig} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      content={<ChartTooltipContent formatter={(value, name, props) => `${props.payload.name}: ${Number(value).toFixed(1)} hours`} />}
                    />
                    <Legend contentStyle={{ fontSize: '14px' }} wrapperStyle={{paddingTop: '20px'}} />
                    <Pie
                      data={hoursByBranchDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      labelLine={false}
                      label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (percent * 100) > 3 ? (
                          <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px">
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        ) : null;
                      }}
                    >
                      {hoursByBranchDistribution.map((entry, index) => (
                        <Cell key={`cell-hours-${index}`} fill={entry.fill} stroke={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-muted-foreground text-center pt-20 text-lg">No work hour data for the selected date range.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
