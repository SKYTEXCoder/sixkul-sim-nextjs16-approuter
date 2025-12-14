/**
 * Attendance Summary Cards Component
 * 
 * Server Component showing attendance statistics in styled cards.
 * 
 * @module components/student-attendance/AttendanceSummaryCards
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import {
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { AttendanceSummary } from "@/lib/attendance-data";

interface AttendanceSummaryCardsProps {
  summary: AttendanceSummary;
}

export function AttendanceSummaryCards({ summary }: AttendanceSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Attendance Percentage */}
      <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardDescription className="text-emerald-100">
            Persentase Kehadiran
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-3xl font-bold">{summary.attendancePercentage}%</span>
              <p className="text-sm text-emerald-100 mt-1">semester ini</p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-200" />
          </div>
        </CardContent>
      </Card>

      {/* Total Sessions */}
      <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 shadow-lg">
        <CardHeader className="pb-2">
          <CardDescription className="text-blue-100">
            Total Pertemuan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-3xl font-bold">{summary.totalSessions}</span>
              <p className="text-sm text-blue-100 mt-1">sesi</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-200" />
          </div>
        </CardContent>
      </Card>

      {/* Present Count */}
      <Card className="bg-slate-100 dark:bg-slate-800 border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Hadir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {summary.presentCount}
            </span>
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
        </CardContent>
      </Card>

      {/* Absent/Late Count */}
      <Card className="bg-slate-100 dark:bg-slate-800 border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Tidak Hadir / Terlambat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {summary.absentLateCount}
            </span>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
