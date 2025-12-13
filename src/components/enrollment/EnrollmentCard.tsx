/**
 * Enrollment Card Component
 * 
 * Displays a single enrollment with status, metadata, and action buttons.
 * Actions are conditional based on enrollment status.
 * 
 * @module components/enrollment/EnrollmentCard
 */

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Eye,
  Calendar,
  ClipboardCheck,
  User,
  Clock,
  GraduationCap,
} from "lucide-react";
import type { EnrollmentViewModel } from "@/lib/enrollments-data";

// ============================================
// Types
// ============================================

interface EnrollmentCardProps {
  enrollment: EnrollmentViewModel;
}

// ============================================
// Status Badge Component
// ============================================

function StatusBadge({ status }: { status: EnrollmentViewModel["status"] }) {
  const statusConfig = {
    PENDING: {
      label: "Menunggu Persetujuan",
      className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    },
    ACTIVE: {
      label: "Aktif",
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    },
    REJECTED: {
      label: "Ditolak",
      className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    },
    ALUMNI: {
      label: "Alumni",
      className: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-800",
    },
    CANCELLED: {
      label: "Dibatalkan",
      className: "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-500 border-slate-200 dark:border-slate-800",
    },
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

// ============================================
// Category Badge Component
// ============================================

function CategoryBadge({ category }: { category: string }) {
  const categoryColors: Record<string, string> = {
    "Olahraga": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    "Seni": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    "Akademik": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    "Teknologi": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  };

  const colorClass = categoryColors[category] || "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400";

  return (
    <Badge className={colorClass}>
      {category}
    </Badge>
  );
}

// ============================================
// Main Component
// ============================================

export function EnrollmentCard({ enrollment }: EnrollmentCardProps) {
  const isActive = enrollment.status === "ACTIVE";
  const isPending = enrollment.status === "PENDING";

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        {/* Identity Section */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Logo/Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white leading-tight">
                {enrollment.extracurricular.name}
              </h3>
              <div className="flex items-center gap-2 mt-1.5">
                <CategoryBadge category={enrollment.extracurricular.category} />
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <StatusBadge status={enrollment.status} />
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4" />
            <span>{enrollment.pembina.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>
              {enrollment.scheduleCount > 0
                ? `${enrollment.scheduleCount} jadwal`
                : "Belum ada jadwal"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Lihat Detail - Disabled for PENDING */}
          <Button
            variant="outline"
            size="sm"
            asChild={isActive}
            disabled={isPending}
            className="gap-1.5"
          >
            {isActive ? (
              <Link href={`/student/ekstrakurikuler/${enrollment.extracurricular.id}`}>
                <Eye className="w-4 h-4" />
                Lihat Detail
              </Link>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Lihat Detail
              </>
            )}
          </Button>

          {/* Jadwal - Only for ACTIVE */}
          {isActive && (
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <Link href="/student/schedule">
                <Calendar className="w-4 h-4" />
                Jadwal
              </Link>
            </Button>
          )}

          {/* Absensi - Only for ACTIVE */}
          {isActive && (
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <Link href="/student/attendance">
                <ClipboardCheck className="w-4 h-4" />
                Absensi
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default EnrollmentCard;
