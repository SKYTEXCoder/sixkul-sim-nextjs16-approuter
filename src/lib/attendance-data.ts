/**
 * Server-side data fetching for Student Attendance
 *
 * Uses Prisma directly to fetch attendance data for Server Components.
 * No API routes - data is fetched server-side.
 *
 * For client-safe types and helpers, import from './attendance-types'.
 *
 * @module lib/attendance-data
 */

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import type {
  AttendanceViewModel,
  AttendanceSummary,
} from "./attendance-types";

// ============================================
// Re-export client-safe types for server component usage
// ============================================

export type {
  AttendanceViewModel,
  AttendanceSummary,
} from "./attendance-types";

// ============================================
// Result Type (server-only)
// ============================================

export interface AttendanceResult {
  success: boolean;
  data?: {
    records: AttendanceViewModel[];
    summary: AttendanceSummary;
    extracurriculars: Array<{ id: string; name: string }>;
  };
  error?: string;
  errorCode?: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "SERVER_ERROR";
}

// ============================================
// Data Fetching
// ============================================

/**
 * Fetch all attendance records for the currently authenticated student
 *
 * This function is designed to be called from Server Components.
 * It handles authentication, authorization, and data fetching.
 */
export async function getStudentAttendance(): Promise<AttendanceResult> {
  try {
    // Step 1: Authenticate using Clerk
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Authentication required. Please login.",
        errorCode: "UNAUTHORIZED",
      };
    }

    // Step 2: Verify role is SISWA
    const userRole = (sessionClaims?.public_metadata as { role?: string })
      ?.role;

    if (userRole !== "SISWA") {
      return {
        success: false,
        error: "Access denied. This page is only available for students.",
        errorCode: "FORBIDDEN",
      };
    }

    // Step 3: Find the user in our database
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      include: {
        studentProfile: true,
      },
    });

    if (!user || !user.studentProfile) {
      return {
        success: false,
        error: "Student profile not found. Please contact administrator.",
        errorCode: "NOT_FOUND",
      };
    }

    // Step 4: Fetch ACTIVE enrollments with extracurriculars
    const enrollments = await prisma.enrollment.findMany({
      where: {
        student_id: user.studentProfile.id,
        status: "ACTIVE",
      },
      select: {
        id: true,
        extracurricular_id: true,
        extracurricular: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    if (enrollments.length === 0) {
      return {
        success: true,
        data: {
          records: [],
          summary: {
            attendancePercentage: 0,
            totalSessions: 0,
            presentCount: 0,
            absentLateCount: 0,
          },
          extracurriculars: [],
        },
      };
    }

    // Create enrollment ID list
    const enrollmentIds = enrollments.map((e) => e.id);

    // Create maps for enrichment
    const enrollmentMap = new Map(enrollments.map((e) => [e.id, e]));

    // Get unique extracurriculars for potential filtering
    const extracurriculars = enrollments.map((e) => ({
      id: e.extracurricular.id,
      name: e.extracurricular.name,
    }));

    // Step 5: Fetch attendance records
    const attendances = await prisma.attendance.findMany({
      where: {
        enrollment_id: { in: enrollmentIds },
      },
      include: {
        session: {
          select: {
            id: true,
            date: true,
            start_time: true,
            end_time: true,
            is_cancelled: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Filter out cancelled sessions after fetch (to avoid complex nested filter)
    const validAttendances = attendances.filter(
      (a) => !a.session || a.session.is_cancelled === false,
    );

    // Step 6: Transform to view model
    const records: AttendanceViewModel[] = validAttendances.map(
      (attendance) => {
        const enrollment = enrollmentMap.get(attendance.enrollment_id)!;
        return {
          id: attendance.id,
          date: attendance.date,
          status: attendance.status,
          notes: attendance.notes,
          enrollmentId: attendance.enrollment_id,
          session: attendance.session
            ? {
                id: attendance.session.id,
                date: attendance.session.date,
                startTime: attendance.session.start_time,
                endTime: attendance.session.end_time,
              }
            : null,
          extracurricular: {
            id: enrollment.extracurricular.id,
            name: enrollment.extracurricular.name,
            category: enrollment.extracurricular.category,
          },
        };
      },
    );

    // Step 7: Compute summary statistics
    const totalSessions = records.length;
    const presentCount = records.filter((r) => r.status === "PRESENT").length;
    const absentLateCount = records.filter(
      (r) => r.status === "ALPHA" || r.status === "LATE",
    ).length;
    const attendancePercentage =
      totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    return {
      success: true,
      data: {
        records,
        summary: {
          attendancePercentage,
          totalSessions,
          presentCount,
          absentLateCount,
        },
        extracurriculars,
      },
    };
  } catch (error) {
    console.error("[ATTENDANCE DATA ERROR]", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
      errorCode: "SERVER_ERROR",
    };
  }
}
