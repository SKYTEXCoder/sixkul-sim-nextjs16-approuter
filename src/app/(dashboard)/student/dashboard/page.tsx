/**
 * Student Dashboard Page
 * 
 * Main dashboard view for Student (SISWA) role with dynamic data.
 * 
 * @module app/(dashboard)/student/dashboard/page
 */

"use client";

import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Trophy,
  Megaphone,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

// ============================================
// Types
// ============================================

interface DashboardData {
  user: {
    fullName: string;
  };
  stats: {
    activeEnrollmentsCount: number;
    attendancePercentage: number;
    schedulesThisWeek: number;
    newAnnouncementsCount: number;
  };
  myEkskul: Array<{
    id: string;
    enrollmentId: string;
    name: string;
    category: string;
    status: string;
  }>;
  upcomingSchedules: Array<{
    scheduleId: string;
    ekskulId: string;
    ekskulName: string;
    day: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    location: string;
  }>;
  recentAnnouncements: Array<{
    id: string;
    title: string;
    ekskulName: string;
    createdAt: string;
    relativeTime: string;
  }>;
}

// ============================================
// Loading Skeleton Component
// ============================================

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-slate-100 dark:bg-slate-800 border-0">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Main Dashboard Component
// ============================================

export default function StudentDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch("/api/student/dashboard");
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || "Failed to fetch dashboard data");
        }
        
        setData(result.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Show loading skeleton
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Show error state
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Gagal Memuat Dashboard
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          {error || "Terjadi kesalahan yang tidak diketahui"}
        </p>
        <Button onClick={() => window.location.reload()}>
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Selamat Datang, {data.user.fullName}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Lihat aktivitas dan perkembangan ekstrakurikuler kamu.
          </p>
        </div>
        <Button className="w-fit" asChild>
          <Link href="/student/ekskul">
            <BookOpen className="mr-2 h-4 w-4" />
            Jelajahi Ekskul
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ekskul Diikuti */}
        <Link href="/student/enrollments">
          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all">
            <CardHeader className="pb-2">
              <CardDescription className="text-blue-100">
                Ekskul Diikuti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold">{data.stats.activeEnrollmentsCount}</span>
                  <p className="text-sm text-blue-100 mt-1">sedang aktif</p>
                </div>
                <Trophy className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Kehadiran */}
        <Link href="/student/attendance">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all">
            <CardHeader className="pb-2">
              <CardDescription className="text-emerald-100">
                Kehadiran
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold">{data.stats.attendancePercentage}%</span>
                  <p className="text-sm text-emerald-100 mt-1">semester ini</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Jadwal Minggu Ini */}
        <Link href="/student/schedule">
          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all">
            <CardHeader className="pb-2">
              <CardDescription className="text-amber-100">
                Jadwal Minggu Ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold">{data.stats.schedulesThisWeek}</span>
                  <p className="text-sm text-amber-100 mt-1">pertemuan</p>
                </div>
                <Calendar className="h-8 w-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Pengumuman Baru */}
        <Link href="/student/announcements">
          <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white border-0 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all">
            <CardHeader className="pb-2">
              <CardDescription className="text-purple-100">
                Pengumuman Baru
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold">{data.stats.newAnnouncementsCount}</span>
                  <p className="text-sm text-purple-100 mt-1">perlu dibaca</p>
                </div>
                <Megaphone className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Ekskul Saya & Jadwal Mendatang */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ekskul Saya */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-blue-500" />
              Ekskul Saya
            </CardTitle>
            <CardDescription>
              Ekstrakurikuler yang sedang kamu ikuti
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.myEkskul.length === 0 ? (
              <div className="text-center py-6">
                <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 dark:text-slate-400">
                  Kamu belum mengikuti ekstrakurikuler apapun.
                </p>
                <Button variant="link" asChild className="mt-2">
                  <Link href="/student/ekskul">Jelajahi Ekskul →</Link>
                </Button>
              </div>
            ) : (
              data.myEkskul.map((ekskul) => (
                <Link
                  key={ekskul.enrollmentId}
                  href={`/student/enrollments/${ekskul.enrollmentId}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {ekskul.name}
                    </p>
                    <p className="text-sm text-slate-500">{ekskul.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      Aktif
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
          
          {/* Footer Link */}
          <div className="px-6 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Link 
              href="/student/enrollments" 
              className="flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Lihat semua ekskul
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </Card>

        {/* Jadwal Mendatang */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Jadwal Mendatang
            </CardTitle>
            <CardDescription>Kegiatan dalam 7 hari ke depan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.upcomingSchedules.length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 dark:text-slate-400">
                  Tidak ada jadwal dalam 7 hari ke depan.
                </p>
              </div>
            ) : (
              data.upcomingSchedules.slice(0, 5).map((schedule, i) => (
                <Link
                  key={`${schedule.scheduleId}-${schedule.dayOfWeek}-${i}`}
                  href={`/student/schedule/${schedule.scheduleId}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Latihan {schedule.ekskulName}
                    </p>
                    <p className="text-sm text-slate-500">{schedule.day}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {schedule.startTime} - {schedule.endTime}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
          
          {/* Footer Link */}
          <div className="px-6 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Link 
              href="/student/schedule" 
              className="flex items-center justify-center text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            >
              Buka kalender
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Pengumuman-Pengumuman Terbaru */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-purple-500" />
            Pengumuman-Pengumuman Terbaru
          </CardTitle>
          <CardDescription>
            Pengumuman dari ekstrakurikuler yang kamu ikuti
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentAnnouncements.length === 0 ? (
            <div className="text-center py-8">
              <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 dark:text-slate-400">
                Belum ada pengumuman terbaru.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentAnnouncements.map((announcement) => (
                <Link
                  key={announcement.id}
                  href={`/student/announcements/${announcement.id}`}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {announcement.title}
                    </p>
                    <p className="text-sm text-slate-500">
                      {announcement.relativeTime} • {announcement.ekskulName}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </Link>
              ))}
            </div>
          )}
          
          {/* Footer Link */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Link 
              href="/student/announcements" 
              className="flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Lihat semua pengumuman
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
