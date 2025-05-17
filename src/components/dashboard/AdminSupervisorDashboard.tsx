
"use client";

import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, Building2, PlusCircle, PieChart as PieChartIcon, Clock10 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CreateUserForm, POSITION_OPTIONS } from './CreateUserForm';
import { BranchSelector, MOCK_BRANCHES } from '@/components/settings/BranchSelector';
import { initialMockUsers, type UserEntry } from '@/components/users/ManageUsersPage'; 
import { initialReportData, type ReportEntry } from '@/components/reports/TimeReportTable'; // Import report data
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

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

export function AdminSupervisorDashboard() {
  const { user } = useAppContext();
  const [isCreateUserSheetOpen, setIsCreateUserSheetOpen] = useState(false);
  const [isManageKiosksSheetOpen, setIsManageKiosksSheetOpen] = useState(false);

  const totalUsers = initialMockUsers.length;

  const branchDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    initialMockUsers.forEach(u => {
      counts[u.branch] = (counts[u.branch] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, []);

  const branchChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    branchDistribution.forEach(branch => {
      config[branch.name] = {
        label: branch.name,
        color: branch.fill,
      };
    });
    return config;
  }, [branchDistribution]);


  const positionDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    initialMockUsers.forEach(u => {
      counts[u.position] = (counts[u.position] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, []);

  const positionChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    positionDistribution.forEach(pos => {
      config[pos.name] = {
        label: pos.name,
        color: pos.fill,
      };
    });
    return config;
  }, [positionDistribution]);

  const hoursByBranchDistribution = useMemo(() => {
    const branchHours: Record<string, number> = {};
    initialReportData.forEach(entry => {
      const hours = parseHoursStringToDecimal(entry.hoursWorked);
      branchHours[entry.branch] = (branchHours[entry.branch] || 0) + hours;
    });
    return Object.entries(branchHours)
      .map(([name, value], index) => ({
        name,
        value: parseFloat(value.toFixed(2)),
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .filter(b => b.value > 0); // Only include branches with hours
  }, []);

  const hoursByBranchChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    hoursByBranchDistribution.forEach(branch => {
      config[branch.name] = {
        label: `${branch.name} (${branch.value.toFixed(1)}h)`, // Show hours in legend label
        color: branch.fill,
      };
    });
    return config;
  }, [hoursByBranchDistribution]);


  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading user data or user not found...</p>
      </div>
    );
  }

  const availableBranches = MOCK_BRANCHES;

  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Administrator Dashboard</h1>
        <CardDescription className="text-lg">
          Welcome, {user.name}! Here you can manage system settings, view reports, and oversee operations.
        </CardDescription>
      </header>

      {/* Row 1: Key Stats and Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Users Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Total Users</CardTitle>
            <Users className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Currently active and suspended users
            </p>
          </CardContent>
        </Card>

        {/* View Reports Card */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">View Reports</CardTitle>
            <FileText className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access and export clock-in/out records.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => window.location.href = '/app/reports'}>Go to Reports</Button>
          </CardFooter>
        </Card>
        
        {/* Administrator Specific Cards */}
        {user.role === 'Administrator' && (
          <>
            {/* Manage Kiosks & Branches Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Manage Kiosks & Branches</CardTitle>
                <Building2 className="h-6 w-6 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configure kiosk branches and add new ones.
                </p>
              </CardContent>
              <CardFooter>
                <Sheet open={isManageKiosksSheetOpen} onOpenChange={setIsManageKiosksSheetOpen}>
                  <SheetTrigger asChild>
                    <Button className="w-full" onClick={() => setIsManageKiosksSheetOpen(true)}>
                      Configure Kiosks/Branches
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Kiosk Branch Configuration</SheetTitle>
                      <SheetDescription>
                        Select the branch for this kiosk or add new branches. Admin credentials are required to save changes.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4">
                      <BranchSelector />
                    </div>
                  </SheetContent>
                </Sheet>
              </CardFooter>
            </Card>

            {/* Create Employee Users Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">Create Employee Users</CardTitle>
                <Users className="h-6 w-6 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Add new employees and assign them login codes.
                </p>
              </CardContent>
              <CardFooter>
                <Sheet open={isCreateUserSheetOpen} onOpenChange={setIsCreateUserSheetOpen}>
                  <SheetTrigger asChild>
                    <Button className="w-full" onClick={() => setIsCreateUserSheetOpen(true)}>
                      <PlusCircle className="mr-2 h-5 w-5" /> Add New Employee
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Create New Employee User</SheetTitle>
                      <SheetDescription>
                        Fill in the details below to add a new employee. Their login code will be used for Kiosk access.
                      </SheetDescription>
                    </SheetHeader>
                    <CreateUserForm
                      branches={availableBranches}
                      onUserCreated={() => setIsCreateUserSheetOpen(false)}
                    />
                  </SheetContent>
                </Sheet>
              </CardFooter>
            </Card>
          </>
        )}
      </div>

      {/* Row 2: Charts - Administrator Only */}
      {user.role === 'Administrator' && (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mt-8">
          {/* Employees by Branch Chart */}
          <Card className="shadow-md hover:shadow-lg transition-shadow lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center">
                <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
                Employees by Branch
              </CardTitle>
              <CardDescription>Distribution of employees across different branches.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] md:h-[350px]">
              {branchDistribution.length > 0 ? (
                <ChartContainer config={branchChartConfig} className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip 
                        cursor={{ fill: 'hsl(var(--muted))' }} 
                        content={<ChartTooltipContent hideLabel />} 
                      />
                      <Legend contentStyle={{ fontSize: '12px' }}/>
                      <Pie
                        data={branchDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return (percent * 100) > 5 ? ( // Only show label if percent is > 5%
                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px">
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          ) : null;
                        }}
                      >
                        {branchDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <p className="text-muted-foreground text-center pt-10">No user data to display branch distribution.</p>
              )}
            </CardContent>
          </Card>

          {/* Employees by Position Chart */}
          <Card className="shadow-md hover:shadow-lg transition-shadow lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center">
                <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
                Employees by Position
              </CardTitle>
              <CardDescription>Distribution of employees across different positions.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] md:h-[350px]">
              {positionDistribution.length > 0 ? (
                <ChartContainer config={positionChartConfig} className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Tooltip 
                        cursor={{ fill: 'hsl(var(--muted))' }} 
                        content={<ChartTooltipContent hideLabel />} 
                      />
                      <Legend contentStyle={{ fontSize: '12px' }}/>
                      <Pie
                        data={positionDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                           return (percent * 100) > 5 ? ( // Only show label if percent is > 5%
                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px">
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                           ) : null;
                        }}
                      >
                        {positionDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                 <p className="text-muted-foreground text-center pt-10">No user data to display position distribution.</p>
              )}
            </CardContent>
          </Card>

          {/* Total Hours Worked by Branch Chart */}
          <Card className="shadow-md hover:shadow-lg transition-shadow lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center">
                <Clock10 className="h-5 w-5 mr-2 text-primary" /> {/* Using Clock10 as an icon for hours */}
                Total Hours Worked by Branch
              </CardTitle>
              <CardDescription>Distribution of total work hours across branches (based on report data).</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] md:h-[350px]">
              {hoursByBranchDistribution.length > 0 ? (
                <ChartContainer config={hoursByBranchChartConfig} className="w-full h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        cursor={{ fill: 'hsl(var(--muted))' }}
                        content={<ChartTooltipContent formatter={(value, name, props) => `${props.payload.name}: ${Number(value).toFixed(1)} hours`} />}
                      />
                      <Legend contentStyle={{ fontSize: '12px' }} />
                      <Pie
                        data={hoursByBranchDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return (percent * 100) > 5 ? (
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
                <p className="text-muted-foreground text-center pt-10">No work hour data available to display distribution.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

