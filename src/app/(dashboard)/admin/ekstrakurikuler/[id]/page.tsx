/**
 * Admin Ekstrakurikuler Detail Page
 *
 * View and manage ekstrakurikuler details, including PEMBINA assignment and Health Monitoring.
 *
 * @module app/(dashboard)/admin/ekstrakurikuler/[id]/page
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Activity,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { getExtracurricularHealthDetail } from "@/lib/admin/admin-data-aggregation";
import { getAvailablePembina } from "@/lib/admin-user-data";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  EkskulDetailClient,
  PembinaAssignmentCard,
} from "@/components/admin/EkskulDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEkstrakurikulerDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  const [healthDetail, availablePembina] = await Promise.all([
    getExtracurricularHealthDetail(id),
    getAvailablePembina(),
  ]);

  if (!healthDetail) {
    notFound();
  }

  const { info, healthStatus, recentSessions, stats } = healthDetail;

  const getHealthBadge = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1" /> Sehat
          </Badge>
        );
      case "WARNING":
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <Activity className="w-3 h-3 mr-1" /> Perhatian
          </Badge>
        );
      case "CRITICAL":
        return (
          <Badge className="bg-rose-100 text-rose-700 border-rose-200">
            <AlertTriangle className="w-3 h-3 mr-1" /> Kritis
          </Badge>
        );
      default:
        return <Badge variant="secondary">Tidak Aktif</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/ekstrakurikuler">
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {info.name}
            </h1>
            {getHealthBadge(healthStatus)}
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {info.category}
          </p>
        </div>
        {/* Interactive buttons - Edit and Archive (Phase 1) */}
        <EkskulDetailClient
          ekskulId={info.id}
          name={info.name}
          category={info.category}
          description={info.description}
          status={info.status}
          currentPembina={info.pembina}
          availablePembina={availablePembina}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Health & Activity Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Analisis Kesehatan & Aktivitas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 uppercase font-semibold">
                    Status
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-100 mt-1">
                    {healthStatus === "HEALTHY"
                      ? "Aktivitas Normal"
                      : healthStatus === "WARNING"
                        ? "Perlu Perhatian"
                        : "Tindakan Diperlukan"}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 uppercase font-semibold">
                    Total Sesi
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-100 mt-1">
                    {stats.totalSessions} sesi
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 uppercase font-semibold">
                    Anggota Aktif
                  </p>
                  <p className="font-medium text-slate-900 dark:text-slate-100 mt-1">
                    {stats.activeMembers} siswa
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3 text-slate-700 dark:text-slate-300">
                  5 Sesi Terakhir
                </h4>
                {recentSessions.length > 0 ? (
                  <div className="space-y-2">
                    {recentSessions.map((session, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-md border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                              {session.date.toLocaleDateString("id-ID", {
                                weekday: "long",
                                day: "numeric",
                                month: "short",
                              })}
                            </p>
                            <p className="text-xs text-slate-500">
                              {session.presentCount} hadir
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            session.attendanceRate > 70
                              ? "default"
                              : session.attendanceRate > 40
                                ? "destructive" // Using red for low attendance? Or Warning? Destructive is red.
                                : "secondary"
                          }
                          className={
                            session.attendanceRate > 70
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : session.attendanceRate > 40
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }
                        >
                          {Math.round(session.attendanceRate)}% Kehadiran
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    Belum ada sesi tercatat.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info Card (Simplified) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                Detail Informasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                  <BookOpen className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {info.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{info.category}</Badge>
                    <Badge
                      variant={
                        info.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {info.status === "ACTIVE"
                        ? "Status Akun: Aktif"
                        : "Status Akun: Nonaktif"}
                    </Badge>
                  </div>
                </div>
              </div>

              {info.description && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-500 mb-1">Deskripsi</p>
                  <p className="text-slate-700 dark:text-slate-300">
                    {info.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* PEMBINA Assignment Card - Interactive */}
          <PembinaAssignmentCard
            ekskulId={info.id}
            currentPembina={info.pembina}
            availablePembina={availablePembina}
          />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-500" />
                Info Lainnya
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-500">
              <p>
                Gunakan metrik kehadiran untuk mengevaluasi kinerja kegiatan
                ekstrakurikuler.
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Data kehadiran diambil dari 5 pertemuan terakhir.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
