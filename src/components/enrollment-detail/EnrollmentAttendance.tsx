/**
 * Enrollment Attendance Component
 *
 * Displays a read-only table of attendance records.
 * Server Component - no client-side interactivity needed.
 *
 * @module components/enrollment-detail/EnrollmentAttendance
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClipboardCheck } from "lucide-react";
import type { EnrollmentDetailViewModel } from "@/lib/enrollment-detail-data";

// ============================================
// Types
// ============================================

interface EnrollmentAttendanceProps {
  attendances: EnrollmentDetailViewModel["attendances"];
}

// ============================================
// Status Badge Component
// ============================================

function AttendanceStatusBadge({
  status,
}: {
  status: EnrollmentDetailViewModel["attendances"][0]["status"];
}) {
  const statusConfig = {
    PRESENT: {
      label: "HADIR",
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    PERMISSION: {
      label: "IZIN",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    SICK: {
      label: "SAKIT",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    },
    ALPHA: {
      label: "ALPHA",
      className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
    LATE: {
      label: "TERLAMBAT",
      className:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    },
  };

  const config = statusConfig[status] || statusConfig.ALPHA;

  return <Badge className={config.className}>{config.label}</Badge>;
}

// ============================================
// Main Component
// ============================================

export function EnrollmentAttendance({
  attendances,
}: EnrollmentAttendanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-emerald-500" />
          Absensi Saya
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attendances.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardCheck className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              Belum ada data kehadiran
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800">
                  <TableHead className="font-semibold">Tanggal</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendances.map((attendance) => (
                  <TableRow key={attendance.id}>
                    <TableCell className="font-medium">
                      {new Date(attendance.date).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <AttendanceStatusBadge status={attendance.status} />
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
                      {attendance.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
