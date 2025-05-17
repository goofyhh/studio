
import { ManageUsersPage } from "@/components/users/ManageUsersPage";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manage Users',
};

export default function ManageUsersRoute() {
  return <ManageUsersPage />;
}
