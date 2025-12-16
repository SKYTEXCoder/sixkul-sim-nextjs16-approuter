/**
 * Server-side data fetching for Student Announcements
 *
 * Uses Prisma directly to fetch announcements from ACTIVE enrollments.
 * No API routes - data is fetched server-side for RSC.
 *
 * @module lib/announcements-data
 */

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// ============================================
// Types
// ============================================

export interface AnnouncementViewModel {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  authorName: string;
  extracurricular: {
    id: string;
    name: string;
    category: string;
  };
  enrollmentId: string; // For navigation to /student/enrollments/[enrollment_id]
}

export interface AnnouncementsResult {
  success: boolean;
  data?: {
    announcements: AnnouncementViewModel[];
    /** Announcements grouped by extracurricular ID */
    groupedByExtracurricular: Map<
      string,
      {
        extracurricular: { id: string; name: string; category: string };
        enrollmentId: string;
        announcements: AnnouncementViewModel[];
      }
    >;
  };
  error?: string;
  errorCode?: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "SERVER_ERROR";
}

// ============================================
// Data Fetching
// ============================================

/**
 * Fetch all announcements for a student's ACTIVE enrollments
 *
 * This function is designed to be called from Server Components.
 * It handles authentication, authorization, and data fetching.
 *
 * Ordering: created_at DESC (newest first)
 */
export async function getStudentAnnouncements(): Promise<AnnouncementsResult> {
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

    // Step 4: Fetch ACTIVE enrollments with extracurricular and announcements
    const enrollments = await prisma.enrollment.findMany({
      where: {
        student_id: user.studentProfile.id,
        status: "ACTIVE", // ONLY active enrollments
      },
      include: {
        extracurricular: {
          include: {
            announcements: {
              orderBy: {
                created_at: "desc", // Newest first
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
      },
    });

    // Step 5: Flatten announcements and attach enrollment context
    const allAnnouncements: AnnouncementViewModel[] = [];
    const groupedByExtracurricular = new Map<
      string,
      {
        extracurricular: { id: string; name: string; category: string };
        enrollmentId: string;
        announcements: AnnouncementViewModel[];
      }
    >();

    for (const enrollment of enrollments) {
      const extracurricular = enrollment.extracurricular;
      const announcements = extracurricular.announcements.map(
        (announcement) => ({
          id: announcement.id,
          title: announcement.title,
          content: announcement.content,
          createdAt: announcement.created_at,
          authorName: announcement.author.full_name,
          extracurricular: {
            id: extracurricular.id,
            name: extracurricular.name,
            category: extracurricular.category,
          },
          enrollmentId: enrollment.id, // Link back to enrollment for navigation
        }),
      );

      allAnnouncements.push(...announcements);

      // Group by extracurricular
      if (announcements.length > 0) {
        groupedByExtracurricular.set(extracurricular.id, {
          extracurricular: {
            id: extracurricular.id,
            name: extracurricular.name,
            category: extracurricular.category,
          },
          enrollmentId: enrollment.id,
          announcements,
        });
      }
    }

    // Step 6: Sort all announcements by created_at DESC (global feed)
    allAnnouncements.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    return {
      success: true,
      data: {
        announcements: allAnnouncements,
        groupedByExtracurricular,
      },
    };
  } catch (error) {
    console.error("[ANNOUNCEMENTS DATA ERROR]", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
      errorCode: "SERVER_ERROR",
    };
  }
}
