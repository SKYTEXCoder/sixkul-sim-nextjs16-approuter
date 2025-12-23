import { startOfMonth, endOfMonth } from "date-fns";
import { getPembinaReportData, ReportPeriod } from "@/lib/admin/reporting-data";
import { PageHeader } from "@/components/layout/PageHeader";
import { PeriodSelector } from "@/components/admin/reporting/PeriodSelector";
import { ExportToolbar } from "@/components/admin/reporting/ExportToolbar";
import { StatSummary } from "@/components/admin/reporting/StatSummary";
import { ReportTable } from "@/components/admin/reporting/ReportTable";

export const dynamic = "force-dynamic";

export default async function PembinaReportPage(props: {
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

  const data = await getPembinaReportData(period);

  const totalSessions = data.reduce(
    (acc, curr) => acc + curr.totalSessionsHeld,
    0
  );
  const avgAttendance =
    data.length > 0
      ? (
          data.reduce((acc, curr) => acc + curr.averageAttendanceInClasses, 0) /
          data.length
        ).toFixed(1)
      : "0";

  const stats = [
    { label: "Pembina Aktif", value: data.length },
    { label: "Total Sesi Dilakukan", value: totalSessions },
    { label: "Rata-rata Kehadiran Kelas", value: `${avgAttendance}%` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Kinerja Pembina"
          description="Evaluasi aktivitas pembina, konsistensi sesi, dan beban kerja yang ditugaskan."
        />
        <div className="flex items-center gap-2">
          <PeriodSelector />
          <ExportToolbar
            type="PEMBINA"
            period={period}
            title="Laporan Kinerja Pembina"
          />
        </div>
      </div>

      <StatSummary stats={stats} />

      <ReportTable
        data={data}
        columns={[
          {
            header: "Nama",
            accessor: (item) => (
              <span className="font-medium">{item.name}</span>
            ),
          },
          {
            header: "NIP",
            accessor: (item) => (
              <span className="text-zinc-500 font-mono text-xs">
                {item.nip}
              </span>
            ),
          },
          {
            header: "Kegiatan Ditugaskan",
            accessor: (item) => (
              <div className="flex flex-wrap gap-1">
                {item.assignedExtracurriculars.map((e, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs border border-zinc-200 dark:border-zinc-700"
                  >
                    {e}
                  </span>
                ))}
              </div>
            ),
          },
          {
            header: "Sesi Terlaksana",
            accessor: (item) => item.totalSessionsHeld,
          },
          {
            header: "Rata-rata Kehadiran",
            accessor: (item) => (
              <span
                className={
                  item.averageAttendanceInClasses < 50
                    ? "text-amber-600 font-bold"
                    : "text-zinc-600"
                }
              >
                {item.averageAttendanceInClasses.toFixed(1)}%
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
