/**
 * Enrollment Schedule Component
 * 
 * Displays the schedule for the extracurricular activity.
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
  schedules: EnrollmentDetailViewModel["schedules"];
}

// ============================================
// Day Names
// ============================================

const dayNames: Record<string, string> = {
  SUNDAY: "Minggu",
  MONDAY: "Senin",
  TUESDAY: "Selasa",
  WEDNESDAY: "Rabu",
  THURSDAY: "Kamis",
  FRIDAY: "Jumat",
  SATURDAY: "Sabtu",
};

// ============================================
// Main Component
// ============================================

export function EnrollmentSchedule({ schedules }: EnrollmentScheduleProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Jadwal Saya
        </CardTitle>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              Belum ada jadwal kegiatan
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-slate-900 dark:text-white">
                    {dayNames[schedule.dayOfWeek] || schedule.dayOfWeek}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="h-4 w-4" />
                  <span>
                    {schedule.startTime} - {schedule.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{schedule.location}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
