import { SettingsPage } from "@/components/settings/SettingsPage";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings',
};

export default function Settings() {
  return <SettingsPage />;
}
