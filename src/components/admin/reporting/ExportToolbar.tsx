"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchExportData } from "@/app/actions/reporting";
import { ExportType, ReportPeriod } from "@/lib/admin/reporting-data";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

interface ExportToolbarProps {
  type: ExportType;
  period: ReportPeriod;
  title: string;
}

export function ExportToolbar({ type, period, title }: ExportToolbarProps) {
  const [isExporting, setIsExporting] = useState(false);

  const COLUMN_MAPPINGS: Record<ExportType, { key: string; header: string }[]> =
    {
      EXTRACURRICULAR: [
        { key: "name", header: "Nama Kegiatan" },
        { key: "category", header: "Kategori" },
        { key: "pembinaName", header: "Pembina" },
        { key: "totalEnrollments", header: "Total Pendaftar" },
        { key: "activeEnrollments", header: "Pendaftar Aktif" },
        { key: "sessionsHeld", header: "Sesi" },
        { key: "averageAttendanceRate", header: "Kehadiran (%)" },
        { key: "status", header: "Status" },
      ],
      PEMBINA: [
        { key: "name", header: "Nama Pembina" },
        { key: "nip", header: "NIP" },
        { key: "assignedExtracurriculars", header: "Kegiatan Diampu" },
        { key: "totalSessionsHeld", header: "Sesi Diadakan" },
        {
          key: "averageAttendanceInClasses",
          header: "Rata-rata Kehadiran Siswa (%)",
        },
      ],
      STUDENT: [
        { key: "name", header: "Nama Siswa" },
        { key: "nis", header: "NIS" },
        { key: "class", header: "Kelas" },
        { key: "enrollmentsCount", header: "Jml Ekstra" },
        { key: "averageAttendance", header: "Kehadiran Total (%)" },
        { key: "zeroAttendanceCount", header: "Ekstra Tanpa Kehadiran" },
      ],
    };

  const handleExport = async (formatType: "csv" | "pdf") => {
    setIsExporting(true);
    try {
      const response = await fetchExportData(type, period);

      if (!response.success) {
        throw new Error(response.error);
      }

      const data = response.data;
      const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm");
      const filename = `SIXKUL_${type}_REPORT_${timestamp}`;
      const columns = COLUMN_MAPPINGS[type];

      if (formatType === "csv") {
        generateCSV(data, filename, columns);
      } else {
        generatePDF(data, filename, title, period, columns);
      }

      toast.success(`Ekspor ${formatType.toUpperCase()} berhasil dibuat`);
    } catch (error) {
      console.error(error);
      toast.error("Gagal membuat ekspor");
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSV = (
    data: Record<string, any>[],
    filename: string,
    columns: { key: string; header: string }[]
  ) => {
    if (data.length === 0) return;

    // Use mapped headers
    const headers = columns.map((c) => c.header);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        columns
          .map((col) => {
            let value = row[col.key];
            if (Array.isArray(value)) value = value.join("; ");
            return JSON.stringify(value);
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = (
    data: Record<string, any>[],
    filename: string,
    reportTitle: string,
    period: ReportPeriod,
    columns: { key: string; header: string }[]
  ) => {
    // Landscape for better width
    const doc = new jsPDF({ orientation: "landscape" });

    // Header styling
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("SIXKUL - Laporan Resmi", 14, 20);

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(reportTitle, 14, 30);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);

    // Format dates with Indonesian locale if possible, or just standard format
    // Since we aren't importing locale into this specific file yet solely for this function,
    // let's stick to simple formatting but make it clean
    const startStr = format(new Date(period.startDate), "dd MMM yyyy");
    const endStr = format(new Date(period.endDate), "dd MMM yyyy");
    const generatedStr = format(new Date(), "dd MMM yyyy, HH:mm");

    doc.text(`Periode: ${startStr} - ${endStr}`, 14, 38);
    doc.text(`Dibuat: ${generatedStr}`, 14, 44);

    if (data.length > 0) {
      const headers = columns.map((c) => c.header);
      const body = data.map((row) =>
        columns.map((col) => {
          const val = row[col.key];
          return Array.isArray(val) ? val.join(", ") : val;
        })
      );

      autoTable(doc, {
        startY: 50,
        head: [headers],
        body: body,
        theme: "striped",
        headStyles: {
          fillColor: [37, 99, 235], // Blue-600
          textColor: 255,
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: "linebreak", // Text wrap is okay if column is wide enough
        },
        columnStyles: {
          // Attempt to give 'name' columns more width to prevent narrow wrapping
          0: { cellWidth: 50 }, // Usually the Name column
        },
        // Auto-width for others
      });
    } else {
      doc.text("Tidak ada data untuk periode ini.", 14, 60);
    }

    doc.save(`${filename}.pdf`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("csv")}
        disabled={isExporting}
        className="cursor-pointer"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        CSV
      </Button>
      <Button
        variant="default" // Primary action
        size="sm"
        onClick={() => handleExport("pdf")}
        disabled={isExporting}
        className="cursor-pointer"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        PDF
      </Button>
    </div>
  );
}
