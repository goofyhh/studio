"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LayoutDashboard, FileText, Settings, HardHat } from 'lucide-react'; // Replaced Building with HardHat

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Array<'Administrator' | 'Supervisor' | 'Kiosk'>;
}

const navItems: NavItem[] = [
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Administrator', 'Supervisor', 'Kiosk'] },
  { href: '/app/reports', label: 'Reports', icon: FileText, roles: ['Administrator', 'Supervisor'] },
  { href: '/app/settings', label: 'Settings', icon: Settings, roles: ['Administrator'] },
];

export function AppSidebar() {
  const { user } = useAppContext();
  const pathname = usePathname();

  if (!user || user.role === 'Kiosk') {
    return null; // No sidebar for Kiosk role or if no user
  }

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 border-r bg-background">
      <ScrollArea className="flex-1 py-4">
        <nav className="grid items-start px-4 text-sm font-medium space-y-1">
          {filteredNavItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              className={cn(
                "w-full justify-start",
                pathname === item.href && "font-semibold"
              )}
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
