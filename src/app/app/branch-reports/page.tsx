
import type { Metadata } from 'next';
import { BranchReportsPageContent } from '@/components/reports/BranchReportsPageContent';

export const metadata: Metadata = {
  title: 'Branch Hours Overview',
};

export default function BranchReportsPage() {
  return <BranchReportsPageContent />;
}
