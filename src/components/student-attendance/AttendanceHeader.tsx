/**
 * Attendance Page Header Component
 * 
 * Server Component displaying the page title and subtitle.
 * 
 * @module components/student-attendance/AttendanceHeader
 */

import { ClipboardCheck } from "lucide-react";

export function AttendanceHeader() {
  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
        <ClipboardCheck className="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Absensi Saya
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Riwayat kehadiran di semua ekstrakurikuler yang kamu ikuti
        </p>
      </div>
    </div>
  );
}
