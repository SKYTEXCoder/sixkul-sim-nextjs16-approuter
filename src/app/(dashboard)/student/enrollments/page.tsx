/**
 * Student Enrollments Page (Ekstrakurikuler Saya)
 *
 * Server Component that displays all extracurriculars the student is enrolled in.
 * Uses Prisma directly for data fetching (no API routes).
 *
 * @module app/(dashboard)/student/enrollments/page
 */

import { redirect } from "next/navigation";
import { Trophy, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStudentEnrollments } from "@/lib/enrollments-data";
import { EnrollmentCard } from "@/components/enrollment/EnrollmentCard";
import { EmptyEnrollments } from "@/components/enrollment/EmptyEnrollments";

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
        <a href="/student/enrollments">Coba Lagi</a>
      </Button>
    </div>
  );
}

// ============================================
// Main Page Component
// ============================================

export default async function StudentEnrollmentsPage() {
  // Fetch enrollments using server-side data layer
  const result = await getStudentEnrollments();

  // Handle unauthorized - redirect to sign-in
  if (result.errorCode === "UNAUTHORIZED") {
    redirect("/sign-in");
  }

  // Handle forbidden - redirect to home or show error
  if (result.errorCode === "FORBIDDEN") {
    redirect("/");
  }

  // Handle errors
  if (!result.success || !result.data) {
    return (
      <ErrorDisplay
        message={result.error || "Gagal memuat data ekstrakurikuler."}
      />
    );
  }

  const enrollments = result.data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            Ekstrakurikuler-Ekstrakurikuler Saya
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Daftar ekstrakurikuler yang kamu ikuti
          </p>
        </div>
      </div>

      {/* Content */}
      {enrollments.length === 0 ? (
        <EmptyEnrollments />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map((enrollment) => (
            <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </div>
      )}
    </div>
  );
}
