import { ReportsPage } from "@/components/reports/ReportsPage";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reports',
};

export default function Reports() {
  return <ReportsPage />;
}
