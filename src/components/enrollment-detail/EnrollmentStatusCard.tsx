/**
 * Enrollment Status Card Component
 *
 * Displays enrollment status, extracurricular info, and metadata.
 * Server Component - no client-side interactivity needed.
 *
 * @module components/enrollment-detail/EnrollmentStatusCard
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Calendar, BookOpen, User } from "lucide-react";
import type { EnrollmentDetailViewModel } from "@/lib/enrollment-detail-data";

// ============================================
// Types
// ============================================

interface EnrollmentStatusCardProps {
  enrollment: EnrollmentDetailViewModel;
}

// ============================================
// Status Badge Component
// ============================================

function StatusBadge({
  status,
}: {
  status: EnrollmentDetailViewModel["status"];
}) {
  const statusConfig = {
    PENDING: {
      label: "Menunggu Persetujuan",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    },
    ACTIVE: {
      label: "Aktif",
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    },
    REJECTED: {
      label: "Ditolak",
      className:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    },
    ALUMNI: {
      label: "Alumni",
      className:
        "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-800",
    },
    CANCELLED: {
      label: "Dibatalkan",
      className:
        "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-500 border-slate-200 dark:border-slate-800",
    },
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <Badge
      variant="outline"
      className={`text-sm px-3 py-1 ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}

// ============================================
// Category Badge Component
// ============================================

function CategoryBadge({ category }: { category: string }) {
  const categoryColors: Record<string, string> = {
    Olahraga:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Seni: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Akademik:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Teknologi:
      "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  };

  const colorClass =
    categoryColors[category] ||
    "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400";

  return <Badge className={colorClass}>{category}</Badge>;
}

// ============================================
// Main Component
// ============================================

export function EnrollmentStatusCard({
  enrollment,
}: EnrollmentStatusCardProps) {
  const formattedJoinDate = new Date(enrollment.joinedAt).toLocaleDateString(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          {/* Extracurricular Identity */}
          <div className="flex items-start gap-4">
            {/* Logo/Icon */}
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {enrollment.extracurricular.name}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <CategoryBadge category={enrollment.extracurricular.category} />
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <StatusBadge status={enrollment.status} />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          {/* Join Date */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tanggal Bergabung
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {formattedJoinDate}
              </p>
            </div>
          </div>

          {/* Academic Year */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tahun Akademik
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {enrollment.academicYear}
              </p>
            </div>
          </div>

          {/* Pembina */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <User className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pembina
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {enrollment.pembina.name}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
