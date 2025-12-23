import { prisma } from "@/lib/prisma";
import {
  ExtracurricularStatus,
  EnrollmentStatus,
  AttendanceStatus,
} from "@/generated/prisma";
import { startOfDay, endOfDay } from "date-fns";

export interface ReportPeriod {
  startDate: Date;
  endDate: Date;
}

export type ExportType = "EXTRACURRICULAR" | "PEMBINA" | "STUDENT";

// ============================================
// EXTRACURRICULAR REPORT DATA (Merged)
// ============================================

export interface ExtracurricularReportItem {
  id: string;
  name: string;
  category: string;
  status: ExtracurricularStatus;
  pembinaName: string;
  totalEnrollments: number;
  activeEnrollments: number;
  sessionsHeld: number;
  averageAttendanceRate: number; // 0-100
}

export async function getExtracurricularReportData(
  period: ReportPeriod
): Promise<ExtracurricularReportItem[]> {
  const extracurriculars = await prisma.extracurricular.findMany({
    include: {
      pembina: {
        include: {
          user: true,
        },
      },
      enrollments: true,
      sessions: {
        where: {
          date: {
            gte: startOfDay(period.startDate),
            lte: endOfDay(period.endDate),
          },
          is_cancelled: false,
        },
        include: {
          attendances: true,
        },
      },
    },
  });

  return extracurriculars.map((ekskul) => {
    const totalEnrollments = ekskul.enrollments.length;
    const activeEnrollments = ekskul.enrollments.filter(
      (e) => e.status === EnrollmentStatus.ACTIVE
    ).length;
    const sessionsHeld = ekskul.sessions.length;

    let totalAttendancePercentage = 0;
    if (sessionsHeld > 0) {
      const sessionMultipliers = ekskul.sessions.map((session) => {
        // Simple logic for Phase 3
        if (session.attendances.length === 0) return 0;

        const presentCount = session.attendances.filter(
          (a) =>
            a.status === AttendanceStatus.PRESENT ||
            a.status === AttendanceStatus.LATE
        ).length;

        return (presentCount / session.attendances.length) * 100;
      });

      const sumRates = sessionMultipliers.reduce((a, b) => a + b, 0);
      totalAttendancePercentage = sumRates / sessionsHeld;
    }

    return {
      id: ekskul.id,
      name: ekskul.name,
      category: ekskul.category,
      status: ekskul.status,
      pembinaName: ekskul.pembina.user.full_name,
      totalEnrollments,
      activeEnrollments,
      sessionsHeld,
      averageAttendanceRate: parseFloat(totalAttendancePercentage.toFixed(2)),
    };
  });
}

// ============================================
// PEMBINA REPORT DATA
// ============================================

export interface PembinaReportItem {
  id: string;
  name: string;
  nip: string;
  assignedExtracurriculars: string[]; // List of names
  totalSessionsHeld: number; // In period
  averageAttendanceInClasses: number; // 0-100
}

export async function getPembinaReportData(
  period: ReportPeriod
): Promise<PembinaReportItem[]> {
  const pembinas = await prisma.pembinaProfile.findMany({
    include: {
      user: true,
      extracurriculars: {
        include: {
          sessions: {
            where: {
              date: {
                gte: startOfDay(period.startDate),
                lte: endOfDay(period.endDate),
              },
              is_cancelled: false,
            },
            include: {
              attendances: true,
            },
          },
        },
      },
    },
  });

  return pembinas.map((p) => {
    const assignedExtracurriculars = p.extracurriculars.map((e) => e.name);

    // Aggregation across all assigned extracurriculars
    let totalSessions = 0;
    let totalAttendanceSum = 0; // Sum of percentages

    p.extracurriculars.forEach((ekskul) => {
      totalSessions += ekskul.sessions.length;
      ekskul.sessions.forEach((session) => {
        if (session.attendances.length > 0) {
          const presentCount = session.attendances.filter(
            (a) =>
              a.status === AttendanceStatus.PRESENT ||
              a.status === AttendanceStatus.LATE
          ).length;
          totalAttendanceSum +=
            (presentCount / session.attendances.length) * 100;
        }
      });
    });

    const averageAttendance =
      totalSessions > 0 ? totalAttendanceSum / totalSessions : 0;

    return {
      id: p.id,
      name: p.user.full_name,
      nip: p.nip,
      assignedExtracurriculars,
      totalSessionsHeld: totalSessions,
      averageAttendanceInClasses: parseFloat(averageAttendance.toFixed(2)),
    };
  });
}

// ============================================
// STUDENT REPORT DATA
// ============================================

export interface StudentReportItem {
  id: string;
  name: string;
  nis: string;
  class: string;
  enrollmentsCount: number;
  averageAttendance: number; // 0-100
  zeroAttendanceCount: number; // How many ekskuls they have 0% attendance in
}

export async function getStudentReportData(
  period: ReportPeriod
): Promise<StudentReportItem[]> {
  // Fetch only students
  const students = await prisma.studentProfile.findMany({
    include: {
      user: true,
      enrollments: {
        where: {
          status: EnrollmentStatus.ACTIVE, // Only care about active enrollments for "Participation"
        },
        include: {
          extracurricular: true,
          attendances: {
            where: {
              date: {
                gte: startOfDay(period.startDate),
                lte: endOfDay(period.endDate),
              },
            },
          },
        },
      },
    },
  });

  return students.map((s) => {
    const enrollmentsCount = s.enrollments.length;
    let zeroAttendanceCount = 0;
    let activeAttendanceSum = 0;

    let enrollmentsWithActivity = 0;

    s.enrollments.forEach((enrollment) => {
      const totalRecords = enrollment.attendances.length;
      if (totalRecords === 0) {
        return;
      }

      enrollmentsWithActivity++;

      const presentCount = enrollment.attendances.filter(
        (a) =>
          a.status === AttendanceStatus.PRESENT ||
          a.status === AttendanceStatus.LATE
      ).length;

      const rate = (presentCount / totalRecords) * 100;
      if (rate === 0) zeroAttendanceCount++;
      activeAttendanceSum += rate;
    });

    const averageAttendance =
      enrollmentsWithActivity > 0
        ? activeAttendanceSum / enrollmentsWithActivity
        : 0;

    return {
      id: s.id,
      name: s.user.full_name,
      nis: s.nis,
      class: s.class_name,
      enrollmentsCount,
      averageAttendance: parseFloat(averageAttendance.toFixed(2)),
      zeroAttendanceCount,
    };
  });
}

// ============================================
// EXPORT DATA FETCHING (Unified)
// ============================================

export async function getExportData(type: ExportType, period: ReportPeriod) {
  switch (type) {
    case "EXTRACURRICULAR":
      return getExtracurricularReportData(period);
    case "PEMBINA":
      return getPembinaReportData(period);
    case "STUDENT":
      return getStudentReportData(period);
    default:
      throw new Error("Invalid Export Type");
  }
}
