import { startOfMonth, endOfMonth } from "date-fns";
import { getStudentReportData, ReportPeriod } from "@/lib/admin/reporting-data";
import { PageHeader } from "@/components/layout/PageHeader";
import { PeriodSelector } from "@/components/admin/reporting/PeriodSelector";
import { ExportToolbar } from "@/components/admin/reporting/ExportToolbar";
import { StatSummary } from "@/components/admin/reporting/StatSummary";
import { ReportTable } from "@/components/admin/reporting/ReportTable";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function StudentReportPage(props: {
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

  const data = await getStudentReportData(period);

  const totalEnrollments = data.reduce(
    (acc, curr) => acc + curr.enrollmentsCount,
    0
  );
  const zeroAttendanceCases = data.reduce(
    (acc, curr) => acc + curr.zeroAttendanceCount,
    0
  );
  const avgAttendance =
    data.length > 0
      ? (
          data.reduce((acc, curr) => acc + curr.averageAttendance, 0) /
          data.length
        ).toFixed(1)
      : "0";

  const stats = [
    { label: "Total Siswa Dianalisis", value: data.length },
    { label: "Total Pendaftaran", value: totalEnrollments },
    { label: "Rata-rata Partisipasi", value: `${avgAttendance}%` },
    {
      label: "Peringatan Nol Kehadiran",
      value: zeroAttendanceCases,
      subValue: "Perlu Perhatian",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Partisipasi Siswa"
          description="Metrik keterlibatan terperinci dan identifikasi siswa berisiko."
        />
        <div className="flex items-center gap-2">
          <PeriodSelector />
          <ExportToolbar
            type="STUDENT"
            period={period}
            title="Laporan Partisipasi Siswa"
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
            header: "NIS",
            accessor: (item) => (
              <span className="text-zinc-500 font-mono text-xs">
                {item.nis}
              </span>
            ),
          },
          { header: "Kelas", accessor: (item) => item.class },
          { header: "Pendaftaran", accessor: (item) => item.enrollmentsCount },
          {
            header: "Rata-rata Kehadiran",
            accessor: (item) => (
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.averageAttendance < 50 ? "bg-red-500" : "bg-emerald-500"} w-[${item.averageAttendance}%]`}
                  />
                </div>
                <span className="text-xs">
                  {item.averageAttendance.toFixed(0)}%
                </span>
              </div>
            ),
          },
          {
            header: "Status",
            accessor: (item) =>
              item.zeroAttendanceCount > 0 ? (
                <Badge variant="destructive">
                  Berisiko ({item.zeroAttendanceCount})
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-emerald-600 border-emerald-200 bg-emerald-50"
                >
                  Aktif
                </Badge>
              ),
          },
        ]}
      />
    </div>
  );
}
