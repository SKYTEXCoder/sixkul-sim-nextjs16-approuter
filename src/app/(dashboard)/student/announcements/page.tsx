/**
 * Student Announcements Page
 * 
 * Displays announcements from all extracurriculars with ACTIVE enrollments.
 * Uses React Server Components with Prisma for data fetching.
 * 
 * Route: /student/announcements
 * Role: SISWA only
 * 
 * @module app/(dashboard)/student/announcements/page
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { Megaphone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnnouncementsHeader } from "@/components/announcements/AnnouncementsHeader";
import { AnnouncementsClientWrapper } from "@/components/announcements/AnnouncementsClientWrapper";
import { getStudentAnnouncements } from "@/lib/announcements-data";

// ============================================
// Error Components
// ============================================

function UnauthorizedError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
        <Megaphone className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        Akses Ditolak
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
        Halaman ini hanya dapat diakses oleh siswa.
      </p>
      <Button asChild>
        <Link href="/student/dashboard">Kembali ke Dashboard</Link>
      </Button>
    </div>
  );
}

function ServerError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
        <Megaphone className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        Gagal Memuat Pengumuman
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
        Terjadi kesalahan saat memuat data. Silakan coba lagi.
      </p>
      <Button onClick={() => window.location.reload()}>
        Coba Lagi
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
        <Megaphone className="h-12 w-12 text-slate-400" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        Belum ada pengumuman
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
        Pengumuman akan muncul setelah pembina membagikan informasi kegiatan
      </p>
      <Button asChild>
        <Link href="/student/enrollments" className="flex items-center gap-2">
          Lihat Ekstrakurikuler Saya
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

// ============================================
// Main Page Component
// ============================================

export default async function StudentAnnouncementsPage() {
  // Fetch announcements using server-side data layer
  const result = await getStudentAnnouncements();

  // Handle unauthorized - redirect to sign-in
  if (result.errorCode === "UNAUTHORIZED") {
    redirect("/sign-in");
  }

  // Handle forbidden (wrong role)
  if (result.errorCode === "FORBIDDEN") {
    return <UnauthorizedError />;
  }

  // Handle not found (no student profile)
  if (result.errorCode === "NOT_FOUND") {
    return <UnauthorizedError />;
  }

  // Handle server error
  if (result.errorCode === "SERVER_ERROR" || !result.data) {
    return <ServerError />;
  }

  const { announcements } = result.data;

  // Handle empty state
  if (announcements.length === 0) {
    return (
      <div className="space-y-6">
        <AnnouncementsHeader />
        <EmptyState />
      </div>
    );
  }

  // Render announcements
  return (
    <div className="space-y-6">
      <AnnouncementsHeader />
      <AnnouncementsClientWrapper announcements={announcements} />
    </div>
  );
}
