/**
 * Client-safe Attendance Types and Helpers
 *
 * These types and utility functions can be safely imported by client components.
 * Server-only code (Prisma, Clerk auth) is in attendance-data.ts.
 *
 * @module lib/attendance-types
 */

// ============================================
// Types
// ============================================

export type AttendanceStatus =
  | "PRESENT"
  | "SICK"
  | "PERMISSION"
  | "ALPHA"
  | "LATE";

export interface AttendanceViewModel {
  id: string;
  date: Date;
  status: AttendanceStatus;
  notes: string | null;
  enrollmentId: string;
  session: {
    id: string;
    date: Date;
    startTime: string;
    endTime: string;
  } | null;
  extracurricular: {
    id: string;
    name: string;
    category: string;
  };
}

export interface AttendanceSummary {
  attendancePercentage: number;
  totalSessions: number;
  presentCount: number;
  absentLateCount: number; // ALPHA + LATE
}

// ============================================
// Status Display Labels
// ============================================

export const statusLabels: Record<AttendanceStatus, string> = {
  PRESENT: "Hadir",
  SICK: "Sakit",
  PERMISSION: "Izin",
  ALPHA: "Tidak Hadir",
  LATE: "Terlambat",
};

export const statusColors: Record<
  AttendanceStatus,
  { bg: string; text: string; icon: string }
> = {
  PRESENT: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
    icon: "text-emerald-500",
  },
  SICK: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    icon: "text-blue-500",
  },
  PERMISSION: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    icon: "text-amber-500",
  },
  ALPHA: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    icon: "text-red-500",
  },
  LATE: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-400",
    icon: "text-orange-500",
  },
};

// ============================================
// Grouping Types
// ============================================

export interface AttendanceDateGroup {
  date: Date;
  dateString: string; // e.g., "Senin, 15 Desember 2025"
  records: AttendanceViewModel[];
}

export interface AttendanceEkskulGroup {
  extracurricular: {
    id: string;
    name: string;
    category: string;
  };
  records: AttendanceViewModel[];
}

// ============================================
// Formatting Helpers
// ============================================

const dayNames = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];
const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/**
 * Format a date to Indonesian locale string
 */
export function formatDateIndonesian(date: Date): string {
  const d = new Date(date);
  const dayName = dayNames[d.getDay()];
  const day = d.getDate();
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${dayName}, ${day} ${month} ${year}`;
}

// ============================================
// Grouping Helpers
// ============================================

/**
 * Group attendance records by date (Date-first view)
 */
export function groupByDate(
  records: AttendanceViewModel[],
): AttendanceDateGroup[] {
  const groups = new Map<string, AttendanceDateGroup>();

  for (const record of records) {
    const date = new Date(record.date);
    const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

    if (!groups.has(dateKey)) {
      groups.set(dateKey, {
        date,
        dateString: formatDateIndonesian(date),
        records: [],
      });
    }

    groups.get(dateKey)!.records.push(record);
  }

  // Sort by date descending (most recent first)
  return Array.from(groups.values()).sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
}

/**
 * Group attendance records by extracurricular (Ekskul-first view)
 */
export function groupByExtracurricular(
  records: AttendanceViewModel[],
): AttendanceEkskulGroup[] {
  const groups = new Map<string, AttendanceEkskulGroup>();

  for (const record of records) {
    const ekskulId = record.extracurricular.id;

    if (!groups.has(ekskulId)) {
      groups.set(ekskulId, {
        extracurricular: record.extracurricular,
        records: [],
      });
    }

    groups.get(ekskulId)!.records.push(record);
  }

  // Sort by extracurricular name
  return Array.from(groups.values()).sort((a, b) =>
    a.extracurricular.name.localeCompare(b.extracurricular.name),
  );
}
