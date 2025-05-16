
"use client";

import Link from 'next/link';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Settings, Users, ArrowRight, UserPlus } from 'lucide-react';

export function AdminSupervisorDashboard() {
  const { user, branch } = useAppContext();

  if (!user) return null;

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome, {user.name}!</CardTitle>
          <CardDescription className="text-lg">
            You are logged in as {user.role}. {branch ? `Current branch: ${branch}.` : "No branch selected."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Manage time entries, generate reports, and configure settings from here.</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ActionCard
          title="View Reports"
          description="Access and generate employee clock-in/out reports."
          href="/app/reports"
          icon={FileText}
        />
        {user.role === 'Administrator' && (
          <>
            <ActionCard
              title="Manage Kiosks & Branches"
              description="Configure kiosk branches and set up new kiosk locations."
              href="/app/settings"
              icon={Settings}
            />
            <ActionCard
              title="Create Users"
              description="Add new employee accounts to the system."
              href="#" 
              icon={Users} // Changed from UserPlus to Users
              disabled 
            />
          </>
        )}
         <ActionCard
            title="Manage Users"
            description="View and manage employee records (mock)."
            href="#" 
            icon={Users}
            disabled
        />
      </div>
    </div>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
}

function ActionCard({ title, description, href, icon: Icon, disabled }: ActionCardProps) {
  return (
    <Card className="hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <Icon className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Button asChild variant="default" className="w-full" disabled={disabled}>
          <Link href={href} className={disabled ? "pointer-events-none" : ""}>
            Go to {title} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

