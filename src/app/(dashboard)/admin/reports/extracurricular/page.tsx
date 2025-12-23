import { startOfMonth, endOfMonth } from "date-fns";
import {
  getExtracurricularReportData,
  ReportPeriod,
} from "@/lib/admin/reporting-data";
import { PageHeader } from "@/components/layout/PageHeader";
import { PeriodSelector } from "@/components/admin/reporting/PeriodSelector";
import { ExportToolbar } from "@/components/admin/reporting/ExportToolbar";
import { StatSummary } from "@/components/admin/reporting/StatSummary";
import { ReportTable } from "@/components/admin/reporting/ReportTable";
import { TrendChart } from "@/components/admin/reporting/TrendChart";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ExtracurricularReportPage(props: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}) {
  const searchParams = await props.searchParams;
  const startDate = searchParams.startDate
    ? new Date(searchParams.startDate)
    : startOfMonth(new Date());
  const endDate = searchParams.endDate
    ? new Date(searchParams.endDate)
    : endOfMonth(new Date());
  const period: ReportPeriod = { startDate, endDate };

  const data = await getExtracurricularReportData(period);

  // Calculate Summary Stats
  const totalEnrollments = data.reduce(
    (acc, curr) => acc + curr.totalEnrollments,
    0
  );
  const totalSessions = data.reduce((acc, curr) => acc + curr.sessionsHeld, 0);
  const avgAttendance =
    data.length > 0
      ? (
          data.reduce((acc, curr) => acc + curr.averageAttendanceRate, 0) /
          data.length
        ).toFixed(1)
      : "0";

  const stats = [
    { label: "Total Pendaftaran Aktif", value: totalEnrollments },
    { label: "Total Sesi Terlaksana", value: totalSessions },
    { label: "Rata-rata Tingkat Kehadiran", value: `${avgAttendance}%` },
    {
      label: "Periode Pelaporan",
      value: data.length > 0 ? "Aktif" : "Tidak Ada Data",
    }, // Improving label logic?
  ];

  // Chart Data: Top 5 by Enrollment
  const chartData = [...data]
    .sort((a, b) => b.totalEnrollments - a.totalEnrollments)
    .slice(0, 5)
    .map((item) => ({
      name: item.name,
      enrollments: item.totalEnrollments,
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Kinerja Ekstrakurikuler"
          description="Metrik rinci tentang pendaftaran, kehadiran, dan konsistensi sesi."
        />
        <div className="flex items-center gap-2">
          <PeriodSelector />
          <ExportToolbar
            type="EXTRACURRICULAR"
            period={period}
            title="Laporan Kinerja Ekstrakurikuler"
          />
        </div>
      </div>

      <StatSummary stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart
          title="5 Kegiatan Ekstrakurikuler Paling Terbaik"
          data={chartData}
          dataKey="enrollments"
          tooltipLabel="pendaftaran (enrollments)"
          type="bar"
        />
        {/* Placeholder for second chart or just span full width? Let's use 1 chart for now to keep it clean */}
      </div>

      <ReportTable
        data={data}
        columns={[
          {
            header: "Nama Kegiatan",
            accessor: (item) => (
              <span className="font-medium">{item.name}</span>
            ),
          },
          { header: "Pembina", accessor: (item) => item.pembinaName },
          {
            header: "Kategori",
            accessor: (item) => (
              <Badge variant="outline">{item.category}</Badge>
            ),
          },
          {
            header: "Total Terdaftar",
            accessor: (item) => item.totalEnrollments,
          },
          { header: "Sesi Aktif", accessor: (item) => item.sessionsHeld },
          {
            header: "Rata-rata Kehadiran",
            accessor: (item) => (
              <span
                className={
                  item.averageAttendanceRate < 50
                    ? "text-red-600 font-bold"
                    : "text-green-600"
                }
              >
                {item.averageAttendanceRate.toFixed(1)}%
              </span>
            ),
          },
          {
            header: "Status",
            accessor: (item) => (
              <Badge
                variant={item.status === "ACTIVE" ? "default" : "secondary"}
              >
                {item.status}
              </Badge>
            ),
          },
        ]}
      />
    </div>
  );
}
