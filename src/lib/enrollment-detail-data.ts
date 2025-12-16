/**
 * Server-side data fetching for Student Enrollment Detail
 *
 * Uses Prisma directly to fetch a single enrollment with all related data.
 * No API routes - data is fetched server-side for RSC.
 *
 * @module lib/enrollment-detail-data
 */

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// ============================================
// Types
// ============================================

export interface EnrollmentDetailViewModel {
  id: string;
  status: "PENDING" | "ACTIVE" | "REJECTED" | "ALUMNI" | "CANCELLED";
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
    email: string | null;
  };
  sessions: Array<{
    id: string;
    date: Date;
    startTime: string;
    endTime: string;
    location: string;
  }>;
  attendances: Array<{
    id: string;
    date: Date;
    status: "PRESENT" | "SICK" | "PERMISSION" | "ALPHA" | "LATE";
    notes: string | null;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    authorName: string;
  }>;
}

export interface EnrollmentDetailResult {
  success: boolean;
  data?: EnrollmentDetailViewModel;
  error?: string;
  errorCode?: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "SERVER_ERROR";
}

// ============================================
// Data Fetching
// ============================================

/**
 * Fetch a single enrollment with all related data for the detail page
 *
 * This function is designed to be called from Server Components.
 * It handles authentication, authorization, and data fetching.
 */
export async function getEnrollmentDetail(
  enrollmentId: string,
): Promise<EnrollmentDetailResult> {
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

    // Step 4: Fetch enrollment with all related data
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        extracurricular: {
          include: {
            pembina: {
              include: {
                user: {
                  select: {
                    full_name: true,
                    email: true,
                  },
                },
              },
            },
            sessions: {
              where: {
                is_cancelled: false,
                date: { gte: new Date() },
              },
              orderBy: {
                date: "asc",
              },
              take: 10, // Show next 10 upcoming sessions
            },
            announcements: {
              orderBy: {
                created_at: "desc",
              },
              include: {
                author: {
                  select: {
                    full_name: true,
                  },
                },
              },
            },
          },
        },
        attendances: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    // Step 5: Validate enrollment exists
    if (!enrollment) {
      return {
        success: false,
        error: "Data keikutsertaan tidak ditemukan.",
        errorCode: "NOT_FOUND",
      };
    }

    // Step 6: Validate ownership - enrollment must belong to current student
    if (enrollment.student_id !== user.studentProfile.id) {
      return {
        success: false,
        error: "Kamu tidak memiliki akses ke data ini.",
        errorCode: "FORBIDDEN",
      };
    }

    // Step 7: Transform to view model
    const viewModel: EnrollmentDetailViewModel = {
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
        email: enrollment.extracurricular.pembina.user.email,
      },
      sessions: enrollment.extracurricular.sessions.map((session) => ({
        id: session.id,
        date: session.date,
        startTime: session.start_time,
        endTime: session.end_time,
        location: session.location,
      })),
      attendances: enrollment.attendances.map((attendance) => ({
        id: attendance.id,
        date: attendance.date,
        status: attendance.status,
        notes: attendance.notes,
      })),
      announcements: enrollment.extracurricular.announcements.map(
        (announcement) => ({
          id: announcement.id,
          title: announcement.title,
          content: announcement.content,
          createdAt: announcement.created_at,
          authorName: announcement.author.full_name,
        }),
      ),
    };

    return {
      success: true,
      data: viewModel,
    };
  } catch (error) {
    console.error("[ENROLLMENT DETAIL DATA ERROR]", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
      errorCode: "SERVER_ERROR",
    };
  }
}
