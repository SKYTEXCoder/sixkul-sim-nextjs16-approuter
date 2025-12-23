import { BarChart3, Users, GraduationCap, LayoutDashboard } from "lucide-react";
import { ReportCard } from "@/components/admin/reporting/ReportCard";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ReportingHubPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Pusat Laporan"
        description="Pusat analitik dan metrik kinerja kegiatan ekstrakurikuler."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard
          title="Kinerja Ekstrakurikuler"
          description="Analisis tren pendaftaran, tingkat kehadiran, dan konsistensi sesi."
          href="/admin/reports/extracurricular"
          icon={BarChart3}
        />
        <ReportCard
          title="Kinerja Pembina"
          description="Evaluasi aktivitas pembina, konsistensi sesi, dan beban kerja."
          href="/admin/reports/pembina"
          icon={Users}
        />
        <ReportCard
          title="Partisipasi Siswa"
          description="Pantau keterlibatan siswa, pola kehadiran, dan siswa berisiko."
          href="/admin/reports/students"
          icon={GraduationCap}
        />
      </div>
    </div>
  );
}
