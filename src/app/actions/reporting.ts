"use server";

import {
  getExportData,
  ReportPeriod,
  ExportType,
  ExtracurricularReportItem,
  PembinaReportItem,
  StudentReportItem,
} from "@/lib/admin/reporting-data";

// Response wrapper
export type ExportDataResponse =
  | {
      success: true;
      type: "EXTRACURRICULAR";
      data: ExtracurricularReportItem[];
    }
  | { success: true; type: "PEMBINA"; data: PembinaReportItem[] }
  | { success: true; type: "STUDENT"; data: StudentReportItem[] }
  | { success: false; error: string };

export async function fetchExportData(
  type: ExportType,
  period: ReportPeriod
): Promise<ExportDataResponse> {
  try {
    const data = await getExportData(type, period);

    // Type narrowing based on input type is tricky in TS return without casting,
    // but at runtime `getExportData` returns the correct array structure.

    if (type === "EXTRACURRICULAR") {
      return { success: true, type, data: data as ExtracurricularReportItem[] };
    }
    if (type === "PEMBINA") {
      return { success: true, type, data: data as PembinaReportItem[] };
    }
    if (type === "STUDENT") {
      return { success: true, type, data: data as StudentReportItem[] };
    }

    return { success: false, error: "Invalid Type" };
  } catch (error) {
    console.error("Export Fetch Error:", error);
    return { success: false, error: "Failed to fetch data" };
  }
}
