/**
 * Server-side data fetching for Student History
 *
 * Fetches all extracurricular enrollments (past and present) for the authenticated student.
 * Provides summary statistics.
 * Strictly READ-ONLY. No grades or assessments.
 *
 * @module lib/history-data
 */

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { EnrollmentStatus } from "@/generated/prisma";

// ============================================
// Types
// ============================================

export interface HistoryEnrollment {
  id: string;
  status: EnrollmentStatus;
  joinedAt: Date;
  academicYear: string;
  extracurricular: {
    id: string;
    name: string;
    category: string;
    description: string | null;
    logoUrl: string | null;
  };
  pembina: {
    name: string;
  };
  scheduleCount: number;
}

export interface HistorySummaryStats {
  total: number;
  active: number;
  inactive: number; // ALUMNI, REJECTED, CANCELLED
}

export interface HistoryResult {
  success: boolean;
  data?: {
    records: HistoryEnrollment[];
    summary: HistorySummaryStats;
  };
  error?: string;
  errorCode?: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "SERVER_ERROR";
}

// ============================================
// Data Fetching
// ============================================

/**
 * Fetch student history including all enrollments and summary stats.
 */
export async function getStudentHistory(): Promise<HistoryResult> {
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

    // Step 4: Fetch ALL enrollments (Active, Alumni, Cancelled, Rejected, Pending)
    const enrollments = await prisma.enrollment.findMany({
      where: {
        student_id: user.studentProfile.id,
      },
      include: {
        extracurricular: {
          include: {
            pembina: {
              include: {
                user: {
                  select: {
                    full_name: true,
                  },
                },
              },
            },
            schedules: {
              select: { id: true },
            },
          },
        },
      },
      orderBy: {
        joined_at: "desc", // Most recent first
      },
    });

    // Step 5: Calculate Summary Statistics
    // Active: ACTIVE
    // Inactive: ALUMNI, REJECTED, CANCELLED
    // Note: PENDING is counted in Total but not in Active/Inactive specific buckets per spec logic,
    // or arguably should be excluded from "Inactive".
    // Spec says: "Ekstrakurikuler Tidak Aktif (ALUMNI / CANCELLED)" - user clarification added REJECTED.

    const activeCount = enrollments.filter((e) => e.status === "ACTIVE").length;

    const inactiveCount = enrollments.filter((e) =>
      ["ALUMNI", "REJECTED", "CANCELLED"].includes(e.status)
    ).length;

    const summary: HistorySummaryStats = {
      total: enrollments.length,
      active: activeCount,
      inactive: inactiveCount,
    };

    // Step 6: Transform to view model
    // Note: We reuse the structure compatible with EnrollmentCard
    const records: HistoryEnrollment[] = enrollments.map((enrollment) => ({
      id: enrollment.id,
      status: enrollment.status,
      joinedAt: enrollment.joined_at,
      academicYear: enrollment.academic_year,
      extracurricular: {
        id: enrollment.extracurricular.id,
        name: enrollment.extracurricular.name,
        category: enrollment.extracurricular.category,
        description: enrollment.extracurricular.description,
        logoUrl: enrollment.extracurricular.logo_url,
      },
      pembina: {
        name: enrollment.extracurricular.pembina.user.full_name,
      },
      scheduleCount: enrollment.extracurricular.schedules.length,
    }));

    return {
      success: true,
      data: {
        records,
        summary,
      },
    };
  } catch (error) {
    console.error("[HISTORY DATA ERROR]", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
      errorCode: "SERVER_ERROR",
    };
  }
}
