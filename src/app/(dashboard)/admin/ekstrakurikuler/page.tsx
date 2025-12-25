/**
 * Admin Ekstrakurikuler monitoring Page (Phase 2)
 *
 * Displays list of extracurriculars with their health status.
 *
 * @module app/(dashboard)/admin/ekstrakurikuler/page
 */

import {
  getExtracurricularHealthList,
  HealthStatus,
} from "@/lib/admin/admin-data-aggregation";
import { ExtrasHealthList } from "@/components/admin/ExtrasHealthList";
import { MetricCard } from "@/components/admin/MetricCard";
import { CreateEkskulDialog } from "@/components/admin/CreateEkskulDialog";
import { getAvailablePembina } from "@/lib/admin-user-data";
import { Activity, CheckCircle, AlertTriangle, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminEkstrakurikulerPage() {
  const [healthList, availablePembinas] = await Promise.all([
    getExtracurricularHealthList(),
    getAvailablePembina(),
  ]);

  // Compute stats on the fly
  const countByStatus = (status: HealthStatus) =>
    healthList.filter((e) => e.healthStatus === status).length;

  const stats = {
    total: healthList.length,
    healthy: countByStatus("HEALTHY"),
    warning: countByStatus("WARNING"),
    critical: countByStatus("CRITICAL"),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Monitoring Ekstrakurikuler 🏥
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Pantau status kesehatan dan aktivitas masing-masing ekstrakurikuler.
          </p>
        </div>
        <CreateEkskulDialog pembinas={availablePembinas} />
      </div>

      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Ekstrakurikuler"
          value={stats.total}
          description="Terdaftar dalam sistem"
          icon={BookOpen}
          iconColorClass="text-blue-500"
        />
        <MetricCard
          title="Sehat (Healthy)"
          value={stats.healthy}
          description="Aktivitas rutin < 14 hari"
          icon={CheckCircle}
          iconColorClass="text-emerald-500"
        />
        <MetricCard
          title="Perhatian (Warning)"
          value={stats.warning}
          description="Tidak aktif > 14 hari"
          icon={Activity}
          iconColorClass="text-amber-500"
        />
        <MetricCard
          title="Kritis (Critical)"
          value={stats.critical}
          description="Tidak aktif > 30 hari"
          icon={AlertTriangle}
          iconColorClass="text-rose-500"
        />
      </div>

      {/* Detailed List */}
      <ExtrasHealthList data={healthList} />
    </div>
  );
}
