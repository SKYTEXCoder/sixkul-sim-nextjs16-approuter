/**
 * Student Schedule Page (Jadwal Saya)
 * 
 * Server Component that displays all future sessions from ACTIVE enrollments.
 * Uses Prisma directly for data fetching (no API routes).
 * 
 * @module app/(dashboard)/student/schedule/page
 */

import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Calendar, AlertCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStudentSessions, groupSessionsByDate } from "@/lib/session-data";
import {
  ScheduleHeader,
  ScheduleFilters,
  SessionDateGroup,
} from "@/components/student-schedule";

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
        <a href="/student/schedule">Coba Lagi</a>
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
        <Calendar className="w-10 h-10 text-violet-500" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        Kamu belum memiliki jadwal kegiatan
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
        Bergabunglah dengan ekstrakurikuler untuk melihat jadwal pertemuan
      </p>
      <Button asChild>
        <Link href="/student/ekstrakurikuler">
          <Search className="w-4 h-4 mr-2" />
          Jelajahi Ekstrakurikuler
        </Link>
      </Button>
    </div>
  );
}

// ============================================
// No Results State (for filtered searches)
// ============================================

function NoResultsState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Calendar className="w-8 h-8 text-slate-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        Tidak ada jadwal ditemukan
      </h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md">
        Coba ubah filter untuk melihat jadwal lainnya
      </p>
    </div>
  );
}

// ============================================
// Page Props
// ============================================

interface PageProps {
  searchParams: Promise<{
    ekskul?: string;
    start?: string;
    end?: string;
  }>;
}

// ============================================
// Main Page Component
// ============================================

export default async function StudentSchedulePage({ searchParams }: PageProps) {
  // Await searchParams (Next.js 15 async params)
  const params = await searchParams;
  
  // Parse filter params
  const filters = {
    extracurricularId: params.ekskul || undefined,
    startDate: params.start ? new Date(params.start) : undefined,
    endDate: params.end ? new Date(params.end) : undefined,
  };

  // Fetch sessions using server-side data layer
  const result = await getStudentSessions(filters);

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
    return <ErrorDisplay message={result.error || "Gagal memuat jadwal."} />;
  }

  const { sessions, extracurriculars } = result.data;
  const hasFilters = params.ekskul || params.start || params.end;

  // Group sessions by date
  const dateGroups = groupSessionsByDate(sessions);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <ScheduleHeader />

      {/* Filters */}
      {extracurriculars.length > 0 && (
        <Suspense fallback={<div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />}>
          <ScheduleFilters extracurriculars={extracurriculars} />
        </Suspense>
      )}

      {/* Content */}
      {sessions.length === 0 ? (
        hasFilters ? <NoResultsState /> : <EmptyState />
      ) : (
        <div className="space-y-6">
          {dateGroups.map((group) => (
            <SessionDateGroup key={group.dateString} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
