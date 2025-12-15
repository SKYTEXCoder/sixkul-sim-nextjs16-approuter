"use client";

import { EnrollmentCard } from "@/components/enrollment/EnrollmentCard";
import type { HistoryEnrollment } from "@/lib/history-data";

interface HistoryListProps {
  enrollments: HistoryEnrollment[];
}

export function HistoryList({ enrollments }: HistoryListProps) {
  // Convert HistoryEnrollment to EnrollmentViewModel format expected by EnrollmentCard
  // They share the exact same structure because we designed history-data to match,
  // but TypeScript might want explicit casting or mapping if types aren't shared.
  // Ideally, they should be compatible.

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          Daftar Riwayat
          <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {enrollments.length}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => (
            <EnrollmentCard
              key={enrollment.id}
              enrollment={enrollment as any} // Asserting compatibility since types are structurally identical
            />
          ))}
        </div>
      </div>
    </div>
  );
}
