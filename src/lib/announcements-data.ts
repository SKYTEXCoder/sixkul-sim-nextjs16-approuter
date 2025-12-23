/**
 * Server-side data fetching for Student Announcements
 *
 * Uses Prisma directly to fetch a UNIFIED feed of announcements:
 * 1. System-wide announcements (Scope: SYSTEM)
 * 2. Extracurricular announcements from ACTIVE enrollments (Scope: EXTRACURRICULAR)
 *
 * @module lib/announcements-data
 */

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { AnnouncementScope } from "@/generated/prisma";

// ============================================
// Types
// ============================================

export interface AnnouncementViewModel {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  authorName: string;
  scope: "SYSTEM" | "EXTRACURRICULAR";
  extracurricular?: {
    id: string;
    name: string;
    category: string;
  };
  enrollmentId?: string; // Only for extracurricular announcements
}

export interface AnnouncementsResult {
  success: boolean;
  data?: {
    announcements: AnnouncementViewModel[];
  };
  error?: string;
  errorCode?: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "SERVER_ERROR";
}

// ============================================
// Data Fetching
// ============================================

/**
 * Fetch unified announcements feed for a student
 *
 * Combining:
 * - System announcements (visible to everyone)
 * - Announcements from Extracurriculars where the student has ACTIVE enrollment
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

    // Step 3: Find the user and their ACTIVE enrollments
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      include: {
        studentProfile: {
          include: {
            enrollments: {
              where: { status: "ACTIVE" },
              select: {
                id: true, // Enrollment ID
                extracurricular_id: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.studentProfile) {
      return {
        success: false,
        error: "Student profile not found. Please contact administrator.",
        errorCode: "NOT_FOUND",
      };
    }

    // Get list of extracurricular IDs the student is active in
    const activeExtracurricularIds = user.studentProfile.enrollments.map(
      (e) => e.extracurricular_id
    );

    // Step 4: Fetch Unified Announcements
    // We fetch where Scope is SYSTEM OR (Scope is EXTRACURRICULAR AND extracurricular_id is in active list)
    const rawAnnouncements = await prisma.announcement.findMany({
      where: {
        OR: [
          { scope: AnnouncementScope.SYSTEM },
          {
            scope: AnnouncementScope.EXTRACURRICULAR,
            extracurricular_id: { in: activeExtracurricularIds },
          },
        ],
      },
      include: {
        author: {
          select: { full_name: true },
        },
        extracurricular: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Step 5: Transform to ViewModel
    // We need to map back to enrollmentId for extracurricular announcements to allow navigation
    // We can use the user.studentProfile.enrollments array we already fetched.

    const enrollmentMap = new Map<string, string>(); // ExtracurricularID -> EnrollmentID
    user.studentProfile.enrollments.forEach((e) => {
      enrollmentMap.set(e.extracurricular_id, e.id);
    });

    const viewModels: AnnouncementViewModel[] = rawAnnouncements.map((a) => {
      const isSystem = a.scope === AnnouncementScope.SYSTEM;
      const enrollmentId = a.extracurricular_id
        ? enrollmentMap.get(a.extracurricular_id)
        : undefined;

      return {
        id: a.id,
        title: a.title,
        content: a.content,
        createdAt: a.created_at,
        authorName: a.author.full_name,
        scope: isSystem ? "SYSTEM" : "EXTRACURRICULAR",
        extracurricular: a.extracurricular
          ? {
              id: a.extracurricular.id,
              name: a.extracurricular.name,
              category: a.extracurricular.category,
            }
          : undefined,
        enrollmentId: enrollmentId,
      };
    });

    return {
      success: true,
      data: {
        announcements: viewModels,
      },
    };
  } catch (error) {
    console.error("[STUDENT ANNOUNCEMENTS ERROR]", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
      errorCode: "SERVER_ERROR",
    };
  }
}
