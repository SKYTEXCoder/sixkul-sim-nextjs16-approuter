/**
 * Student Attendance Page
 * 
 * Displays attendance history and statistics for the current student.
 * 
 * @module app/(dashboard)/student/attendance/page
 */

"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Calendar,
  TrendingUp,
} from "lucide-react";

// ============================================
// Types
// ============================================

interface AttendanceRecord {
  id: string;
  date: string;
  formattedDate: string;
  ekskulName: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
}

interface AttendanceStats {
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
}

interface AttendanceData {
  stats: AttendanceStats;
  recentRecords: AttendanceRecord[];
}

// ============================================
// Status Badge Component
// ============================================

function getStatusBadge(status: AttendanceRecord["status"]) {
  switch (status) {
    case "PRESENT":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Hadir
        </Badge>
      );
    case "ABSENT":
      return (
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
          <XCircle className="h-3 w-3 mr-1" />
          Tidak Hadir
        </Badge>
      );
    case "LATE":
      return (
        <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          <Clock className="h-3 w-3 mr-1" />
          Terlambat
        </Badge>
      );
    case "EXCUSED":
      return (
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <AlertCircle className="h-3 w-3 mr-1" />
          Izin
        </Badge>
      );
    default:
      return null;
  }
}

// ============================================
// Loading Skeleton Component
// ============================================

function AttendanceSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
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

      {/* Records Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function StudentAttendancePage() {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch attendance data
  useEffect(() => {
    async function fetchAttendanceData() {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with actual API endpoint
        // const response = await fetch("/api/student/attendance");
        // const result = await response.json();
        
        // Mock data for initial development
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockData: AttendanceData = {
          stats: {
            totalSessions: 24,
            presentCount: 20,
            absentCount: 2,
            lateCount: 1,
            excusedCount: 1,
            attendancePercentage: 83,
          },
          recentRecords: [
            { id: "1", date: "2025-12-13", formattedDate: "Jumat, 13 Desember 2025", ekskulName: "Basket", status: "PRESENT" },
            { id: "2", date: "2025-12-11", formattedDate: "Rabu, 11 Desember 2025", ekskulName: "Paduan Suara", status: "PRESENT" },
            { id: "3", date: "2025-12-09", formattedDate: "Senin, 9 Desember 2025", ekskulName: "Basket", status: "LATE" },
            { id: "4", date: "2025-12-06", formattedDate: "Jumat, 6 Desember 2025", ekskulName: "Basket", status: "PRESENT" },
            { id: "5", date: "2025-12-04", formattedDate: "Rabu, 4 Desember 2025", ekskulName: "Paduan Suara", status: "EXCUSED" },
          ],
        };
        
        setData(mockData);
      } catch (err) {
        console.error("Attendance fetch error:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAttendanceData();
  }, []);

  // Show loading skeleton
  if (isLoading) {
    return <AttendanceSkeleton />;
  }

  // Show error state
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Gagal Memuat Data Kehadiran
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
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Absensi Saya
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Riwayat kehadiran di semua ekstrakurikuler yang kamu ikuti.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Percentage */}
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-emerald-100">
              Persentase Kehadiran
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold">{data.stats.attendancePercentage}%</span>
                <p className="text-sm text-emerald-100 mt-1">semester ini</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        {/* Total Sessions */}
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-100">
              Total Pertemuan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold">{data.stats.totalSessions}</span>
                <p className="text-sm text-blue-100 mt-1">sesi</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        {/* Present Count */}
        <Card className="bg-slate-100 dark:bg-slate-800 border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Hadir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {data.stats.presentCount}
              </span>
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        {/* Absent/Late Count */}
        <Card className="bg-slate-100 dark:bg-slate-800 border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Tidak Hadir / Terlambat
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">
                {data.stats.absentCount + data.stats.lateCount}
              </span>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-blue-500" />
            Riwayat Kehadiran
          </CardTitle>
          <CardDescription>
            Catatan kehadiran terbaru di semua ekstrakurikuler
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentRecords.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardCheck className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 dark:text-slate-400">
                Belum ada catatan kehadiran.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {record.ekskulName}
                    </p>
                    <p className="text-sm text-slate-500">{record.formattedDate}</p>
                  </div>
                  {getStatusBadge(record.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
