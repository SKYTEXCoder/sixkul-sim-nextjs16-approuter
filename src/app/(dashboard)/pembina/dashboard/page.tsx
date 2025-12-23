/**
 * Pembina Dashboard Page
 *
 * Main dashboard view for Pembina role.
 * READ-ONLY: No mutations are allowed from this page.
 * All CTAs navigate to existing management pages.
 *
 * @module app/(dashboard)/pembina/dashboard/page
 */

import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calendar,
  Users,
  Clock,
  AlertCircle,
  ArrowRight,
  MapPin,
} from "lucide-react";
import {
  getPembinaDashboardSummary,
  getPembinaExtracurricularOverview,
  getUpcomingSessions,
  getPendingEnrollmentsPreview,
} from "@/lib/pembina-dashboard-data";

// ============================================
// Loading Skeleton Component
// ============================================

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded mt-2" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 bg-slate-200 dark:bg-slate-700 rounded-lg"
          />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>

      {/* Sessions Skeleton */}
      <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
    </div>
  );
}

// ============================================
// Dashboard Content Component (Server-Side Data Fetching)
// ============================================

async function PembinaDashboardContent() {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId) {
    redirect("/sign-in");
  }

  const userName = user?.fullName || "Pembina";

  // Fetch all dashboard data in parallel
  const [summary, extracurriculars, upcomingSessions, pendingEnrollments] =
    await Promise.all([
      getPembinaDashboardSummary(userId),
      getPembinaExtracurricularOverview(userId),
      getUpcomingSessions(userId),
      getPendingEnrollmentsPreview(userId),
    ]);

  /**
   * Format date for display (Indonesian locale).
   */
  const formatSessionDate = (date: Date): string => {
    const today = new Date();
    const sessionDate = new Date(date);

    // Check if it's today
    if (sessionDate.toDateString() === today.toDateString()) {
      return "Hari Ini";
    }

    // Check if it's tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (sessionDate.toDateString() === tomorrow.toDateString()) {
      return "Besok";
    }

    // Otherwise, format as date
    return sessionDate.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  };

  /**
   * Format relative time for enrollment requests.
   */
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Kemarin";
    return `${diffDays} hari lalu`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header - No "Input Absensi" button (read-only constraint) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Selamat Datang, {userName}! 🎓
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Kelola ekstrakurikuler dan pantau perkembangan siswa.
          </p>
        </div>
        {/* CTA to ekstrakurikuler list (no item context → list page) */}
        <Link href="/pembina/ekstrakurikuler">
          <Button className="w-fit bg-emerald-600 hover:bg-emerald-700 cursor-pointer">
            <BookOpen className="mr-2 h-4 w-4" />
            Kelola Ekstrakurikuler
          </Button>
        </Link>
      </div>

      {/* Summary Stats Cards - All route to /pembina/ekstrakurikuler (no item context) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/pembina/ekstrakurikuler" className="cursor-pointer">
          <Card className="bg-linear-to-br from-emerald-500 to-teal-600 text-white border-0 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-100">
                Ekskul Dikelola
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">
                  {summary.totalExtracurriculars}
                </span>
                <BookOpen className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pembina/ekstrakurikuler" className="cursor-pointer">
          <Card className="bg-linear-to-br from-blue-500 to-indigo-600 text-white border-0 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-100">
                Total Anggota Aktif
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">
                  {summary.totalActiveMembers}
                </span>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pembina/ekstrakurikuler" className="cursor-pointer">
          <Card className="bg-linear-to-br from-amber-500 to-orange-600 text-white border-0 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-100">
                Jadwal 7 Hari Ke Depan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">
                  {summary.totalUpcomingSessions}
                </span>
                <Calendar className="h-8 w-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pembina/ekstrakurikuler" className="cursor-pointer">
          <Card className="bg-linear-to-br from-red-500 to-rose-600 text-white border-0 hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardDescription className="text-red-100">
                Perlu Persetujuan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold">
                  {summary.totalPendingEnrollments}
                </span>
                <AlertCircle className="h-8 w-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Ekskul Overview & Pending Enrollments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ekstrakurikuler Saya */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              Ekstrakurikuler Saya
            </CardTitle>
            <CardDescription>Ekstrakurikuler yang Anda bimbing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {extracurriculars.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                Belum ada ekstrakurikuler yang Anda bimbing.
              </p>
            ) : (
              extracurriculars.map((ekskul) => (
                // CTA with item context → /pembina/ekstrakurikuler/[clicked.id]
                <Link
                  key={ekskul.id}
                  href={`/pembina/ekstrakurikuler/${ekskul.id}`}
                  className="block cursor-pointer"
                >
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {ekskul.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {ekskul.memberCount} anggota aktif
                        {ekskul.pendingCount > 0 && (
                          <span className="ml-2 text-amber-600 dark:text-amber-400">
                            • {ekskul.pendingCount} pending
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          ekskul.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-400"
                        }
                      >
                        {ekskul.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pendaftaran Baru - READ-ONLY: No approve/reject buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Pendaftaran Baru
            </CardTitle>
            <CardDescription>Menunggu persetujuan Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingEnrollments.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                Tidak ada pendaftaran yang menunggu persetujuan.
              </p>
            ) : (
              pendingEnrollments.map((pending) => (
                <div
                  key={pending.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {pending.studentName}
                    </p>
                    <p className="text-sm text-slate-500">
                      {pending.extracurricularName} •{" "}
                      {formatRelativeTime(pending.requestedAt)}
                    </p>
                  </div>
                  {/* CTA with item context → /pembina/ekstrakurikuler/[item.extracurricularId]/enrollments */}
                  <Link
                    href={`/pembina/ekstrakurikuler/${pending.extracurricularId}/enrollments`}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                    >
                      Kelola
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Jadwal Mendatang */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Jadwal Mendatang
          </CardTitle>
          <CardDescription>
            Kegiatan dalam 7 hari ke depan (maks. 5 item)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              Tidak ada jadwal dalam 7 hari ke depan.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingSessions.map((session) => (
                // CTA with item context → /pembina/ekstrakurikuler/[item.extracurricularId]/sessions
                <Link
                  key={session.id}
                  href={`/pembina/ekstrakurikuler/${session.extracurricular.id}/sessions`}
                  className="block cursor-pointer"
                >
                  <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant="secondary"
                        className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        {formatSessionDate(session.date)}
                      </Badge>
                    </div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {session.extracurricular.name}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {session.startTime} - {session.endTime}
                    </p>
                    <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {session.location}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Page Export with Suspense
// ============================================

export const dynamic = "force-dynamic";

export default function PembinaDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <PembinaDashboardContent />
    </Suspense>
  );
}
