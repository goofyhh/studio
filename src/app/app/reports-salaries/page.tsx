
import { ReportsSalariesPage } from "@/components/reports/ReportsSalariesPage";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Salaries Report',
};

export default function SalariesReportRoute() {
  return <ReportsSalariesPage />;
}
