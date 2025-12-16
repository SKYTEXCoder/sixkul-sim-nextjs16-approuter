/**
 * PEMBINA Settings Page
 *
 * Account settings with Clerk integration for password management.
 * No password data stored in Prisma.
 *
 * @module app/(dashboard)/pembina/settings/page
 */

import { Settings } from "lucide-react";
import { SecuritySection } from "./_components/SecuritySection";

// Force dynamic rendering since this page uses Clerk auth
export const dynamic = "force-dynamic";

// ============================================
// Main Page Component
// ============================================

export default function PembinaSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Pengaturan
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Kelola pengaturan akun dan keamanan Anda
        </p>
      </div>

      {/* Security Section */}
      <SecuritySection />
    </div>
  );
}
