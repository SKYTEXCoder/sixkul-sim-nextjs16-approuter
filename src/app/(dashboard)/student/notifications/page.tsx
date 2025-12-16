/**
 * Student Notifications Page
 *
 * Displays all notifications for the current student.
 * Uses React Server Components with Prisma for data fetching.
 *
 * Route: /student/notifications
 * Role: SISWA only
 *
 * @module app/(dashboard)/student/notifications/page
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationList } from "@/components/notifications/NotificationList";
import { getStudentNotifications } from "@/lib/notification-data";

// Force dynamic rendering since this page uses Clerk auth (reads headers)
export const dynamic = "force-dynamic";

// ============================================
// Error Components
// ============================================

function UnauthorizedError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
        <Bell className="h-8 w-8 text-red-500" />
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
        <Bell className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        Gagal Memuat Notifikasi
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
        Terjadi kesalahan saat memuat data. Silakan coba lagi.
      </p>
      <Button asChild>
        <Link href="/student/notifications">Coba Lagi</Link>
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
        <Bell className="h-12 w-12 text-slate-400" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        Belum ada notifikasi
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
        Notifikasi akan muncul saat ada pembaruan terkait kegiatan
        ekstrakurikuler Anda.
      </p>
      <Button asChild>
        <Link href="/student/dashboard" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>
      </Button>
    </div>
  );
}

// ============================================
// Page Header
// ============================================

function NotificationsHeader() {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="p-2 rounded-lg bg-primary/10">
        <Bell className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Notifikasi Saya
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Pemberitahuan terkait kegiatan ekstrakurikuler
        </p>
      </div>
    </div>
  );
}

// ============================================
// Main Page Component
// ============================================

export default async function StudentNotificationsPage() {
  // Fetch notifications using server-side data layer
  const result = await getStudentNotifications();

  // Handle unauthorized - redirect to sign-in
  if (result.errorCode === "UNAUTHORIZED") {
    redirect("/sign-in");
  }

  // Handle forbidden (wrong role)
  if (result.errorCode === "FORBIDDEN") {
    return <UnauthorizedError />;
  }

  // Handle not found (no user profile)
  if (result.errorCode === "NOT_FOUND") {
    return <UnauthorizedError />;
  }

  // Handle server error
  if (result.errorCode === "SERVER_ERROR" || !result.data) {
    return <ServerError />;
  }

  const { notifications, unreadCount } = result.data;

  // Handle empty state
  if (notifications.length === 0) {
    return (
      <div className="space-y-6">
        <NotificationsHeader />
        <EmptyState />
      </div>
    );
  }

  // Render notifications
  return (
    <div className="space-y-6">
      <NotificationsHeader />
      <NotificationList
        notifications={notifications}
        unreadCount={unreadCount}
      />
    </div>
  );
}
