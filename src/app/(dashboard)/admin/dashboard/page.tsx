/**
 * Admin Dashboard Page
 *
 * Main dashboard view for Admin Phase 2 (Monitoring & Evaluation).
 * Strictly read-only views with aggregated system metrics.
 *
 * @module app/(dashboard)/admin/dashboard/page
 */

import { Users, BookOpen, Activity, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MetricCard } from "@/components/admin/MetricCard";
import {
  getSystemOverviewMetrics,
  getExtracurricularHealthList,
  getPembinaActivityMetrics,
} from "@/lib/admin/admin-data-aggregation";
import {
  getRecentActivity,
  getTopEkstrakurikuler,
} from "@/lib/admin-dashboard-data";
import Link from "next/link";
import { AlertTriangle, UserX } from "lucide-react";

import { currentUser } from "@clerk/nextjs/server";

export default async function AdminDashboardPage() {
  const user = await currentUser();
  const userName = user?.fullName || "Administrator SIXKUL";

  // Fetch Phase 2 Aggregated Metrics
  const [metrics, recentActivity, topEkskul, healthList, pembinaMetrics] =
    await Promise.all([
      getSystemOverviewMetrics(),
      getRecentActivity(5),
      getTopEkstrakurikuler(5),
      getExtracurricularHealthList(),
      getPembinaActivityMetrics(),
    ]);

  const criticalEkskuls = healthList.filter(
    (e) => e.healthStatus === "CRITICAL" || e.healthStatus === "WARNING"
  );
  const inactivePembinas = pembinaMetrics.filter(
    (p) => p.sessionsCreated30Days === 0
  );

  // Format relative time helper
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${diffDays} hari lalu`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            Selamat Datang, {userName}.
          </h1>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-700 dark:text-slate-200">
            Dashboard Monitoring 📊
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Evaluasi kesehatan dan aktivitas ekstrakurikuler.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Phase 2: Action buttons are minimized or focused on navigation, not creation */}
          <Link href="/admin/ekstrakurikuler">
            <Button variant="outline">
              <Activity className="mr-2 h-4 w-4" />
              Monitoring Kesehatan
            </Button>
          </Link>
        </div>
      </div>

      {/* System Overview Metrics (Phase 2 Priority) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Siswa"
          value={metrics.totalStudents}
          description="Siswa terdaftar dalam sistem"
          icon={Users}
          iconColorClass="text-blue-500"
          trend={{
            value: Math.abs(metrics.trends.usersGrowth),
            label: "vs 30 hari lalu",
            positive: metrics.trends.usersGrowth >= 0,
          }}
        />
        <MetricCard
          title="Ekstrakurikuler Aktif"
          value={`${metrics.activeExtracurriculars} / ${metrics.totalExtracurriculars}`}
          description="Status Aktif vs Total"
          icon={BookOpen}
          iconColorClass="text-emerald-500"
        />
        <MetricCard
          title="Total Pembina"
          value={metrics.totalPembina}
          description="Pembina aktif bertugas"
          icon={Shield}
          iconColorClass="text-amber-500"
        />
        <MetricCard
          title="Pendaftaran Aktif"
          value={metrics.activeEnrollments}
          description="Total partisipasi siswa"
          icon={TrendingUp}
          iconColorClass="text-purple-500"
          trend={{
            value: Math.abs(metrics.trends.enrollmentGrowth),
            label: "vs 30 hari lalu",
            positive: metrics.trends.enrollmentGrowth >= 0,
          }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Distribution (Visual) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              Distribusi Pengguna
            </CardTitle>
            <CardDescription>
              Proporsi pengguna berdasarkan peran sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {metrics.totalStudents}
                </span>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
                  Siswa
                </span>
              </div>
              <div className="flex flex-col items-center p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {metrics.totalPembina}
                </span>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
                  Pembina
                </span>
              </div>
              <div className="flex flex-col items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <span className="text-3xl font-bold text-slate-600 dark:text-slate-400">
                  {metrics.totalUsers}
                </span>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
                  Total Akun
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Anomaly Signals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              Sinyal & Anomali
            </CardTitle>
            <CardDescription>
              Indikator perhatian yang perlu ditindaklanjuti
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/admin/ekstrakurikuler">
              <div className="flex items-center justify-between p-3 rounded-lg border border-rose-100 bg-rose-50 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  <div>
                    <p className="font-medium text-rose-900 dark:text-rose-200">
                      Kesehatan Ekskul
                    </p>
                    <p className="text-xs text-rose-700 dark:text-rose-400">
                      {criticalEkskuls.length} Butuh Perhatian
                    </p>
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-rose-200 dark:bg-rose-900 flex items-center justify-center text-rose-700 dark:text-rose-300 font-bold group-hover:scale-110 transition-transform">
                  {criticalEkskuls.length}
                </div>
              </div>
            </Link>

            <Link href="/admin/users">
              <div className="flex items-center justify-between p-3 rounded-lg border border-amber-100 bg-amber-50 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/20 dark:hover:bg-amber-950/30 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <UserX className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="font-medium text-amber-900 dark:text-amber-200">
                      Pembina Tidak Aktif
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      {inactivePembinas.length} Pembina Sedang Tidak Aktif{" "}
                      <br /> (dalam rentang waktu 30 hari)
                    </p>
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-amber-200 dark:bg-amber-900 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold group-hover:scale-110 transition-transform">
                  {inactivePembinas.length}
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics: Recent Activity & Top Ekskul */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent System Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aktivitas Terkini</CardTitle>
            <CardDescription>Log kejadian sistem terakhir</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 text-sm pb-3 border-b last:border-0 border-slate-100 dark:border-slate-800"
                >
                  <div
                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                      activity.type === "enrollment"
                        ? "bg-green-500"
                        : activity.type === "attendance"
                          ? "bg-blue-500"
                          : "bg-orange-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-200">
                      {activity.action}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                      {activity.user}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {formatRelativeTime(activity.time)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500">
                Tidak ada aktivitas tercatat.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Extracurriculars */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ekstrakurikuler Populer</CardTitle>
            <CardDescription>Berdasarkan jumlah pendaftar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topEkskul.length > 0 ? (
              topEkskul.map((ekskul, i) => (
                <div
                  key={ekskul.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-200">
                        {ekskul.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {ekskul.category}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-slate-50 dark:bg-slate-900"
                  >
                    {ekskul.enrollmentCount}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500">
                Data tidak tersedia.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
