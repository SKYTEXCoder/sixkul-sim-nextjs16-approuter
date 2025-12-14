/**
 * Schedule Page Header Component
 * 
 * Displays the title and subtitle for the Jadwal Saya page.
 * Server Component - no client-side interactivity needed.
 * 
 * @module components/student-schedule/ScheduleHeader
 */

import { Calendar } from "lucide-react";

export function ScheduleHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          Jadwal Saya
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Semua pertemuan ekstrakurikuler yang akan kamu hadiri
        </p>
      </div>
    </div>
  );
}
