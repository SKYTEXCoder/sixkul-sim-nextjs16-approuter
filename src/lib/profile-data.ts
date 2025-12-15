/**
 * Server-side data fetching for Student Profile
 *
 * Uses Prisma directly to fetch profile data for Server Components.
 * No API routes - data is fetched server-side.
 *
 * @module lib/profile-data
 */

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

// ============================================
// Types
// ============================================

export interface StudentProfileViewModel {
  // Identity (from Clerk/User)
  fullName: string;
  email: string;
  avatarUrl: string | null;

  // Academic (from StudentProfile)
  nis: string | null;
  className: string | null;
  major: string | null;
  phoneNumber: string | null;
  academicYear: string | null;

  // Enrollment Stats
  totalEnrollments: number;
  activeEnrollments: number;
  pendingEnrollments: number;

  // Account Status
  role: string;
  accountStatus: string;
  joinedAt: Date;
}

export interface ProfileResult {
  success: boolean;
  data?: StudentProfileViewModel;
  hasStudentProfile: boolean;
  error?: string;
  errorCode?: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "SERVER_ERROR";
}

// ============================================
// Data Fetching
// ============================================

/**
 * Fetch profile data for the currently authenticated student
 *
 * This function is designed to be called from Server Components.
 * It handles authentication, authorization, and data fetching.
 *
 * Data Sources:
 * - Identity: Clerk user (fullName, email, avatarUrl, joinedAt)
 * - Academic: Prisma StudentProfile (nis, className, major, academicYear)
 * - Stats: Prisma Enrollment aggregates
 */
export async function getStudentProfile(): Promise<ProfileResult> {
  try {
    // Step 1: Authenticate using Clerk
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return {
        success: false,
        hasStudentProfile: false,
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
        hasStudentProfile: false,
        error: "Access denied. This page is only available for students.",
        errorCode: "FORBIDDEN",
      };
    }

    // Step 3: Get Clerk user details for identity data
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return {
        success: false,
        hasStudentProfile: false,
        error: "Unable to retrieve user data.",
        errorCode: "SERVER_ERROR",
      };
    }

    // Step 4: Find the user in our database
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      include: {
        studentProfile: {
          include: {
            enrollments: {
              select: {
                status: true,
              },
            },
          },
        },
      },
    });

    // Step 5: Handle case where user or student profile doesn't exist
    if (!user) {
      return {
        success: false,
        hasStudentProfile: false,
        error: "User not found in database. Please contact administrator.",
        errorCode: "NOT_FOUND",
      };
    }

    // If no student profile, still return identity data with warning
    if (!user.studentProfile) {
      const viewModel: StudentProfileViewModel = {
        // Identity from Clerk
        fullName: clerkUser.fullName || clerkUser.username || "Siswa",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        avatarUrl: clerkUser.imageUrl || null,

        // Academic - all null (no student profile)
        nis: null,
        className: null,
        major: null,
        phoneNumber: null,
        academicYear: null,

        // Enrollment Stats - all zero
        totalEnrollments: 0,
        activeEnrollments: 0,
        pendingEnrollments: 0,

        // Account Status
        role: "SISWA",
        accountStatus: "Aktif",
        joinedAt: clerkUser.createdAt
          ? new Date(clerkUser.createdAt)
          : new Date(),
      };

      return {
        success: true,
        data: viewModel,
        hasStudentProfile: false,
      };
    }

    // Step 6: Compute enrollment aggregates
    const enrollments = user.studentProfile.enrollments;
    const totalEnrollments = enrollments.length;
    const activeEnrollments = enrollments.filter(
      (e) => e.status === "ACTIVE"
    ).length;
    const pendingEnrollments = enrollments.filter(
      (e) => e.status === "PENDING"
    ).length;

    // Step 7: Build view model with full data
    const viewModel: StudentProfileViewModel = {
      // Identity from Clerk
      fullName: clerkUser.fullName || clerkUser.username || user.full_name,
      email: clerkUser.primaryEmailAddress?.emailAddress || user.email || "",
      avatarUrl: clerkUser.imageUrl || user.avatar_url || null,

      // Academic from StudentProfile (EXCLUSIVE source for Tahun Akademik)
      nis: user.studentProfile.nis,
      className: user.studentProfile.class_name,
      major: user.studentProfile.major,
      phoneNumber: user.studentProfile.phone_number,
      academicYear: user.studentProfile.academic_year ?? null,

      // Enrollment Stats
      totalEnrollments,
      activeEnrollments,
      pendingEnrollments,

      // Account Status
      role: "SISWA",
      accountStatus: "Aktif",
      joinedAt: clerkUser.createdAt
        ? new Date(clerkUser.createdAt)
        : user.created_at,
    };

    return {
      success: true,
      data: viewModel,
      hasStudentProfile: true,
    };
  } catch (error) {
    console.error("[PROFILE DATA ERROR]", error);
    return {
      success: false,
      hasStudentProfile: false,
      error: "An unexpected error occurred. Please try again later.",
      errorCode: "SERVER_ERROR",
    };
  }
}
