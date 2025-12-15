/**
 * Student Attendance Page (Absensi Saya)
 *
 * Server Component that displays attendance history across all ACTIVE enrollments.
 * Uses Prisma directly for data fetching (no API routes).
 *
 * @module app/(dashboard)/student/attendance/page
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Calendar, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStudentAttendance } from "@/lib/attendance-data";
import {
  AttendanceHeader,
  AttendanceSummaryCards,
  AttendanceList,
} from "@/components/student-attendance";

// Force dynamic rendering since this page uses Clerk auth (reads headers)
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
      <Button asChild>
        <a href="/student/attendance">Coba Lagi</a>
      </Button>
    </div>
  );
}

// ============================================
// Empty State Component
// ============================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-6">
        <ClipboardCheck className="w-10 h-10 text-violet-500" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        Belum ada data absensi
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
        Absensi akan muncul setelah kamu mengikuti pertemuan ekstrakurikuler
      </p>
      <Button asChild>
        <Link href="/student/schedule">
          <Calendar className="w-4 h-4 mr-2" />
          Lihat Jadwal Saya
        </Link>
      </Button>
    </div>
  );
}

// ============================================
// Main Page Component
// ============================================

export default async function StudentAttendancePage() {
  // Fetch attendance data using server-side data layer
  const result = await getStudentAttendance();

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
      <ErrorDisplay message={result.error || "Gagal memuat data absensi."} />
    );
  }

  const { records, summary } = result.data;

  // Handle empty state
  if (records.length === 0) {
    return (
      <div className="space-y-6">
        <AttendanceHeader />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AttendanceHeader />

      {/* Summary Cards */}
      <AttendanceSummaryCards summary={summary} />

      {/* Attendance Records with Grouping Toggle */}
      <AttendanceList records={records} />
    </div>
  );
}
