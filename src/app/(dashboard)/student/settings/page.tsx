/**
 * Student Settings Page
 *
 * React Server Component for student preferences and account security.
 * Uses Prisma directly for data fetching (no API routes).
 *
 * @module app/(dashboard)/student/settings/page
 */

import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { getStudentPreferences } from "@/lib/preferences-data";
import { SettingsClientWrapper } from "./_components/SettingsClientWrapper";

// Force dynamic rendering since this page uses Clerk auth
export const dynamic = "force-dynamic";

// ============================================
// Error Display Component
// ============================================

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        Terjadi Kesalahan
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-md">
        {message}
      </p>
    </div>
  );
}

// ============================================
// Main Page Component
// ============================================

export default async function StudentSettingsPage() {
  // Fetch preferences with auto-creation
  const result = await getStudentPreferences();

  // Handle unauthorized - redirect to sign-in
  if (result.errorCode === "UNAUTHORIZED") {
    redirect("/sign-in");
  }

  // Handle forbidden - redirect to home
  if (result.errorCode === "FORBIDDEN") {
    redirect("/");
  }

  // Handle errors
  if (!result.success || !result.data) {
    return (
      <ErrorDisplay message={result.error || "Gagal memuat pengaturan."} />
    );
  }

  return <SettingsClientWrapper initialPreferences={result.data} />;
}
