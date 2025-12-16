/**
 * Enrollment Schedule Component
 *
 * Displays upcoming sessions for the extracurricular activity.
 * Server Component - no client-side interactivity needed.
 *
 * @module components/enrollment-detail/EnrollmentSchedule
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import type { EnrollmentDetailViewModel } from "@/lib/enrollment-detail-data";

// ============================================
// Types
// ============================================

interface EnrollmentScheduleProps {
  sessions: EnrollmentDetailViewModel["sessions"];
}

// ============================================
// Helper: Format date to Indonesian
// ============================================

function formatDate(date: Date): string {
  const dayNames = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const d = new Date(date);
  const dayName = dayNames[d.getDay()];
  const day = d.getDate();
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();

  return `${dayName}, ${day} ${month} ${year}`;
}

// ============================================
// Main Component
// ============================================

export function EnrollmentSchedule({ sessions }: EnrollmentScheduleProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Jadwal Mendatang
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              Belum ada jadwal kegiatan mendatang
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-slate-900 dark:text-white">
                    {formatDate(session.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="h-4 w-4" />
                  <span>
                    {session.startTime} - {session.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{session.location}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
