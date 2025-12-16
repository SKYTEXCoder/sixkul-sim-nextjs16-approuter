/**
 * Server-side data fetching for Student Sessions
 *
 * Uses Prisma directly to fetch session data for Server Components.
 * No API routes - data is fetched server-side.
 *
 * @module lib/session-data
 */

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// ============================================
// Types
// ============================================

export interface SessionViewModel {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  enrollmentId: string;
  extracurricular: {
    id: string;
    name: string;
    category: string;
  };
}

export interface SessionResult {
  success: boolean;
  data?: {
    sessions: SessionViewModel[];
    extracurriculars: Array<{ id: string; name: string }>;
  };
  error?: string;
  errorCode?: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "SERVER_ERROR";
}

export interface SessionFilters {
  extracurricularId?: string;
  startDate?: Date;
  endDate?: Date;
}

// ============================================
// Helper: Get start of today (server timezone)
// ============================================

function getStartOfToday(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

// ============================================
// Data Fetching
// ============================================

/**
 * Fetch all future sessions for the currently authenticated student
 *
 * This function is designed to be called from Server Components.
 * It handles authentication, authorization, and data fetching.
 */
export async function getStudentSessions(
  filters?: SessionFilters,
): Promise<SessionResult> {
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

    // Step 4: Fetch ACTIVE enrollments to get extracurricular IDs
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
          sessions: [],
          extracurriculars: [],
        },
      };
    }

    // Create a map of extracurricular_id -> enrollment_id for navigation
    const enrollmentMap = new Map(
      enrollments.map((e) => [e.extracurricular_id, e.id]),
    );

    // Get unique extracurriculars for filter dropdown
    const extracurriculars = enrollments.map((e) => ({
      id: e.extracurricular.id,
      name: e.extracurricular.name,
    }));

    const extracurricularIds = enrollments.map((e) => e.extracurricular_id);

    // Step 5: Build date filters
    const startOfToday = getStartOfToday();
    const dateFilter: { gte?: Date; lte?: Date } = {
      gte: filters?.startDate || startOfToday,
    };
    if (filters?.endDate) {
      dateFilter.lte = filters.endDate;
    }

    // Step 6: Fetch sessions
    const sessions = await prisma.session.findMany({
      where: {
        is_cancelled: false, // Exclude cancelled sessions
        date: dateFilter,
        extracurricular_id: filters?.extracurricularId
          ? filters.extracurricularId
          : { in: extracurricularIds },
      },
      include: {
        extracurricular: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: [{ date: "asc" }, { start_time: "asc" }],
    });

    // Step 7: Transform to view model with enrollmentId
    const sessionViewModels: SessionViewModel[] = sessions.map((session) => ({
      id: session.id,
      date: session.date,
      startTime: session.start_time,
      endTime: session.end_time,
      location: session.location,
      enrollmentId: enrollmentMap.get(session.extracurricular_id) || "",
      extracurricular: {
        id: session.extracurricular.id,
        name: session.extracurricular.name,
        category: session.extracurricular.category,
      },
    }));

    return {
      success: true,
      data: {
        sessions: sessionViewModels,
        extracurriculars,
      },
    };
  } catch (error) {
    console.error("[SESSION DATA ERROR]", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
      errorCode: "SERVER_ERROR",
    };
  }
}

// ============================================
// Helper: Group sessions by date
// ============================================

export interface SessionDateGroup {
  date: Date;
  dateString: string; // e.g., "Senin, 15 Desember 2025"
  sessions: SessionViewModel[];
}

/**
 * Group sessions by their date for display
 */
export function groupSessionsByDate(
  sessions: SessionViewModel[],
): SessionDateGroup[] {
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

  const groups = new Map<string, SessionDateGroup>();

  for (const session of sessions) {
    const date = new Date(session.date);
    const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

    if (!groups.has(dateKey)) {
      const dayName = dayNames[date.getDay()];
      const day = date.getDate();
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const dateString = `${dayName}, ${day} ${month} ${year}`;

      groups.set(dateKey, {
        date,
        dateString,
        sessions: [],
      });
    }

    groups.get(dateKey)!.sessions.push(session);
  }

  // Convert to array and sort by date
  return Array.from(groups.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );
}
