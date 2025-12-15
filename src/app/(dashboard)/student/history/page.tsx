/**
 * Student History Page (Riwayat Saya)
 *
 * Displays a read-only historical record of extracurricular participations.
 * Includes summary statistics and a chronological list of enrollments.
 *
 * @module app/(dashboard)/student/history/page
 */

import { redirect } from "next/navigation";
import { History, AlertCircle, BookOpen, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getStudentHistory } from "@/lib/history-data";
import { HistorySummary } from "@/components/student/history/HistorySummary";
import { HistoryList } from "@/components/student/history/HistoryList";

// Force dynamic rendering since this page uses Clerk auth headers
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
        <a href="/student/history">Coba Lagi</a>
      </Button>
    </div>
  );
}

// ============================================
// Empty History Component
// ============================================

function EmptyHistory() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <History className="w-12 h-12 text-slate-400" />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 text-center">
        Kamu belum memiliki riwayat ekstrakurikuler.
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
        Mulai perjalananmu dengan bergabung ke ekstrakurikuler yang tersedia.
      </p>

      <Button asChild size="lg" className="gap-2">
        <Link href="/student/ekstrakurikuler">
          <Search className="w-4 h-4" />
          Jelajahi Ekstrakurikuler
        </Link>
      </Button>
    </div>
  );
}

// ============================================
// Main Page Component
// ============================================

export default async function StudentHistoryPage() {
  // Fetch history data using server-side data layer
  const result = await getStudentHistory();

  // Handle unauthorized - redirect to sign-in
  if (result.errorCode === "UNAUTHORIZED") {
    redirect("/sign-in");
  }

  // Handle forbidden - redirect to home
  if (result.errorCode === "FORBIDDEN") {
    redirect("/");
  }

  // Handle server errors
  if (!result.success || !result.data) {
    return (
      <ErrorDisplay
        message={result.error || "Gagal memuat riwayat ekstrakurikuler."}
      />
    );
  }

  const { records, summary } = result.data;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <History className="w-5 h-5 text-white" />
          </div>
          Riwayat Saya
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Riwayat keikutsertaan ekstrakurikuler yang pernah kamu ikuti
        </p>
      </div>

      {/* Content */}
      {records.length === 0 ? (
        <EmptyHistory />
      ) : (
        <>
          {/* Summary Stats */}
          <HistorySummary stats={summary} />

          {/* History List */}
          <HistoryList enrollments={records} />
        </>
      )}
    </div>
  );
}
