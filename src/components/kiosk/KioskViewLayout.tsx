
"use client";

import { ClockInOutCard } from '@/components/kiosk/ClockInOutCard';
import { LiveClockedInUsers } from '@/components/kiosk/LiveClockedInUsers';

export function KioskViewLayout() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <div className="w-full lg:w-2/5 xl:w-1/3 flex flex-col">
        <ClockInOutCard />
      </div>
      <div className="w-full lg:w-3/5 xl:w-2/3 flex flex-col">
        <LiveClockedInUsers />
      </div>
    </div>
  );
}
