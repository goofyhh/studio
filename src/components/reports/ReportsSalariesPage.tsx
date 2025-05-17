
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

export function ReportsSalariesPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl">Salaries Report</CardTitle>
              <CardDescription>View and manage salary-related reports. (Under Construction)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will provide detailed salary reports and related functionalities.
            Currently, this page is a placeholder for future development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
