/**
 * PEMBINA Settings Page
 *
 * Account settings with theme preferences and Clerk integration for password management.
 * Theme is persisted via next-themes (localStorage/system preference).
 * No password data stored in Prisma.
 *
 * @module app/(dashboard)/pembina/settings/page
 */

import { Settings } from "lucide-react";
import { AppearanceSection } from "./_components/AppearanceSection";
import { SecuritySection } from "./_components/SecuritySection";

// Force dynamic rendering since this page uses Clerk auth
export const dynamic = "force-dynamic";

export default async function PembinaSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Pengaturan
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Kelola pengaturan akun, tampilan, dan keamanan Anda
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6">
        {/* Appearance Section - Theme Settings */}
        <AppearanceSection />

        {/* Security Section - Password Management */}
        <SecuritySection />
      </div>
    </div>
  );
}
