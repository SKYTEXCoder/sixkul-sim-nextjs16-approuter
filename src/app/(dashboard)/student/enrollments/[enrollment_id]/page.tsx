/**
 * Student Enrollment Detail Page (Server Component)
 * 
 * Shows detailed information about a student's enrollment in an extracurricular.
 * Displays status, schedules, attendance, and announcements.
 * 
 * @module app/(dashboard)/student/enrollments/[enrollment_id]/page
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getEnrollmentDetail } from "@/lib/enrollment-detail-data";
import { EnrollmentHeader } from "@/components/enrollment-detail/EnrollmentHeader";
import { EnrollmentStatusCard } from "@/components/enrollment-detail/EnrollmentStatusCard";
import { EnrollmentSchedule } from "@/components/enrollment-detail/EnrollmentSchedule";
import { EnrollmentAttendance } from "@/components/enrollment-detail/EnrollmentAttendance";
import { EnrollmentAnnouncements } from "@/components/enrollment-detail/EnrollmentAnnouncements";

// ============================================
// Types
// ============================================

interface PageProps {
  params: Promise<{
    enrollment_id: string;
  }>;
}

// ============================================
// Error Display Components
// ============================================

function NotFoundError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        Data Tidak Ditemukan
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-md">
        Data keikutsertaan tidak ditemukan
      </p>
      <Button asChild>
        <Link href="/student/enrollments">Kembali ke Ekstrakurikuler Saya</Link>
      </Button>
    </div>
  );
}

function UnauthorizedError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
        <ShieldX className="w-8 h-8 text-amber-500" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        Akses Ditolak
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-md">
        Kamu tidak memiliki akses ke data ini
      </p>
      <Button asChild>
        <Link href="/student/enrollments">Kembali ke Ekstrakurikuler Saya</Link>
      </Button>
    </div>
  );
}

function ServerError({ message }: { message: string }) {
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
        <Link href="/student/enrollments">Kembali ke Ekstrakurikuler Saya</Link>
      </Button>
    </div>
  );
}

// ============================================
// Non-Active Status Message
// ============================================

function NonActiveStatusMessage({ status }: { status: string }) {
  const messages = {
    PENDING: {
      title: "Pendaftaran Sedang Diproses",
      description: "Pendaftaran kamu sedang menunggu persetujuan dari pembina. Kamu akan dapat mengakses jadwal, absensi, dan pengumuman setelah pendaftaran disetujui.",
    },
    REJECTED: {
      title: "Pendaftaran Ditolak",
      description: "Maaf, pendaftaran kamu ke ekstrakurikuler ini telah ditolak. Silakan hubungi pembina untuk informasi lebih lanjut.",
    },
    ALUMNI: {
      title: "Status Alumni",
      description: "Kamu sudah berstatus alumni di ekstrakurikuler ini. Terima kasih atas partisipasimu!",
    },
    CANCELLED: {
      title: "Pendaftaran Dibatalkan",
      description: "Pendaftaran kamu ke ekstrakurikuler ini telah dibatalkan.",
    },
  };

  const message = messages[status as keyof typeof messages];

  if (!message) return null;

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
      <CardContent className="pt-6">
        <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">
          {message.title}
        </h3>
        <p className="text-amber-600 dark:text-amber-300 text-sm">
          {message.description}
        </p>
      </CardContent>
    </Card>
  );
}

// ============================================
// Main Page Component
// ============================================

export default async function EnrollmentDetailPage({ params }: PageProps) {
  const { enrollment_id } = await params;

  // Fetch enrollment details using server-side data layer
  const result = await getEnrollmentDetail(enrollment_id);

  // Handle unauthorized - redirect to sign-in
  if (result.errorCode === "UNAUTHORIZED") {
    redirect("/sign-in");
  }

  // Handle forbidden (wrong role or not owner)
  if (result.errorCode === "FORBIDDEN") {
    return <UnauthorizedError />;
  }

  // Handle not found
  if (result.errorCode === "NOT_FOUND") {
    return <NotFoundError />;
  }

  // Handle server error
  if (!result.success || !result.data) {
    return <ServerError message={result.error || "Gagal memuat data."} />;
  }

  const enrollment = result.data;
  const isActive = enrollment.status === "ACTIVE";

  return (
    <div className="space-y-6">
      {/* Header */}
      <EnrollmentHeader />

      {/* Status Card */}
      <EnrollmentStatusCard enrollment={enrollment} />

      {/* Non-active Status Message */}
      {!isActive && <NonActiveStatusMessage status={enrollment.status} />}

      {/* Participation Sections - Only for ACTIVE status */}
      {isActive && (
        <div className="space-y-6">
          {/* Schedule */}
          <EnrollmentSchedule sessions={enrollment.sessions} />

          {/* Attendance */}
          <EnrollmentAttendance attendances={enrollment.attendances} />

          {/* Announcements */}
          <EnrollmentAnnouncements announcements={enrollment.announcements} />
        </div>
      )}
    </div>
  );
}
