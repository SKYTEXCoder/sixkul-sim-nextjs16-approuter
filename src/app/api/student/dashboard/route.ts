/**
 * SIXKUL Student Dashboard API Route
 *
 * GET /api/student/dashboard - Fetch all dashboard data for the current student
 *
 * Returns:
 * - user: { fullName }
 * - stats: { activeEnrollmentsCount, attendancePercentage, schedulesThisWeek, newAnnouncementsCount }
 * - myEkskul: Array of active extracurriculars
 * - upcomingSchedules: Next 10 upcoming sessions
 * - recentAnnouncements: Recent announcements from enrolled extracurriculars
 *
 * @module api/student/dashboard
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateStudentProfile } from "@/lib/sync-user";

// ============================================
// Type Definitions
// ============================================

interface DashboardSuccessResponse {
  success: true;
  data: {
    user: {
      fullName: string;
    };
    stats: {
      activeEnrollmentsCount: number;
      attendancePercentage: number;
      schedulesThisWeek: number;
      newAnnouncementsCount: number;
    };
    myEkskul: Array<{
      enrollmentId: string;
      id: string;
      name: string;
      category: string;
      status: string;
    }>;
    upcomingSchedules: Array<{
      sessionId: string;
      enrollmentId: string;
      ekskulId: string;
      ekskulName: string;
      day: string;
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      location: string;
    }>;
    recentAnnouncements: Array<{
      id: string;
      title: string;
      ekskulName: string;
      createdAt: Date;
      relativeTime: string;
    }>;
  };
}

interface DashboardErrorResponse {
  success: false;
  message: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Map day of week string to Indonesian name
 */
function getDayNameIndonesian(dayOfWeek: string): string {
  const dayMap: Record<string, string> = {
    SENIN: "Senin",
    SELASA: "Selasa",
    RABU: "Rabu",
    KAMIS: "Kamis",
    JUMAT: "Jumat",
    SABTU: "Sabtu",
    MINGGU: "Minggu",
    // Also handle English day names just in case
    MONDAY: "Senin",
    TUESDAY: "Selasa",
    WEDNESDAY: "Rabu",
    THURSDAY: "Kamis",
    FRIDAY: "Jumat",
    SATURDAY: "Sabtu",
    SUNDAY: "Minggu",
  };
  return dayMap[dayOfWeek.toUpperCase()] || dayOfWeek;
}

/**
 * Get relative time string in Indonesian
 */
function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "Baru saja";
  if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
  if (diffInHours < 24) return `${diffInHours} jam lalu`;
  if (diffInDays === 0) return "Hari ini";
  if (diffInDays === 1) return "Kemarin";
  if (diffInDays < 7) return `${diffInDays} hari lalu`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} minggu lalu`;
  return `${Math.floor(diffInDays / 30)} bulan lalu`;
}

/**
 * Format session date to Indonesian day name
 */
function formatSessionDay(date: Date): string {
  const dayNames = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  return dayNames[date.getDay()];
}

/**
 * Get day of week string from date
 */
function getDayOfWeekFromDate(date: Date): string {
  const dayNames = [
    "MINGGU",
    "SENIN",
    "SELASA",
    "RABU",
    "KAMIS",
    "JUMAT",
    "SABTU",
  ];
  return dayNames[date.getDay()];
}

// ============================================
// GET Handler
// ============================================

export async function GET(): Promise<
  NextResponse<DashboardSuccessResponse | DashboardErrorResponse>
> {
  try {
    // ----------------------------------------
    // Step 1: Authenticate user
    // ----------------------------------------
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required. Please login." },
        { status: 401 },
      );
    }

    const userRole = (sessionClaims?.public_metadata as { role?: string })
      ?.role;

    if (userRole !== "SISWA") {
      return NextResponse.json(
        { success: false, message: "Only students can access this resource." },
        { status: 403 },
      );
    }

    // ----------------------------------------
    // Step 2: Get or create student profile (JIT sync)
    // ----------------------------------------
    const result = await getOrCreateStudentProfile(userId, sessionClaims);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          message: "Student profile not found or could not be created.",
        },
        { status: 404 },
      );
    }

    const { studentProfile, userId: prismaUserId } = result;

    // ----------------------------------------
    // Step 3: Get user's full name
    // ----------------------------------------
    const user = await prisma.user.findUnique({
      where: { id: prismaUserId },
      select: { full_name: true },
    });

    const fullName = user?.full_name || "Siswa";

    // ----------------------------------------
    // Step 4: Get active enrollments with extracurricular data
    // ----------------------------------------
    const activeEnrollments = await prisma.enrollment.findMany({
      where: {
        student_id: studentProfile.id,
        status: "ACTIVE",
      },
      include: {
        extracurricular: {
          select: {
            id: true,
            name: true,
            category: true,
            status: true,
            schedules: {
              select: {
                id: true,
                day_of_week: true,
                start_time: true,
                end_time: true,
                location: true,
              },
            },
          },
        },
      },
    });

    const activeEnrollmentsCount = activeEnrollments.length;

    // ----------------------------------------
    // Step 5: Calculate attendance percentage
    // ----------------------------------------
    const allEnrollmentIds = activeEnrollments.map((e) => e.id);

    let attendancePercentage = 0;

    if (allEnrollmentIds.length > 0) {
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          enrollment_id: { in: allEnrollmentIds },
        },
        select: { status: true },
      });

      const totalRecords = attendanceRecords.length;
      if (totalRecords > 0) {
        // PRESENT, SICK, PERMISSION = attended; ALPHA = absent
        const attendedCount = attendanceRecords.filter(
          (r) =>
            r.status === "PRESENT" ||
            r.status === "SICK" ||
            r.status === "PERMISSION",
        ).length;
        attendancePercentage = Math.round((attendedCount / totalRecords) * 100);
      }
    }

    // ----------------------------------------
    // Step 6: Count sessions this week and fetch upcoming sessions
    // ----------------------------------------
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // End of this week (Sunday)
    const endOfWeek = new Date(startOfToday);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    // Create enrollment map for navigation
    const enrollmentMap = new Map(
      activeEnrollments.map((e) => [e.extracurricular_id, e.id]),
    );

    const extracurricularIds = activeEnrollments.map(
      (e) => e.extracurricular.id,
    );

    // Fetch sessions from database (not computing virtual occurrences)
    const upcomingSessions = await prisma.session.findMany({
      where: {
        is_cancelled: false,
        date: { gte: startOfToday },
        extracurricular_id: { in: extracurricularIds },
      },
      include: {
        extracurricular: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ date: "asc" }, { start_time: "asc" }],
      take: 10,
    });

    // Count sessions this week
    const sessionsThisWeek = await prisma.session.count({
      where: {
        is_cancelled: false,
        date: {
          gte: startOfToday,
          lte: endOfWeek,
        },
        extracurricular_id: { in: extracurricularIds },
      },
    });

    // ----------------------------------------
    // Step 7: Get new announcements count (last 7 days)
    // ----------------------------------------
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let newAnnouncementsCount = 0;

    if (extracurricularIds.length > 0) {
      newAnnouncementsCount = await prisma.announcement.count({
        where: {
          extracurricular_id: { in: extracurricularIds },
          created_at: { gte: sevenDaysAgo },
        },
      });
    }

    // ----------------------------------------
    // Step 8: Get my ekskul list
    // ----------------------------------------
    const myEkskul = activeEnrollments.map((e) => ({
      enrollmentId: e.id,
      id: e.extracurricular.id,
      name: e.extracurricular.name,
      category: e.extracurricular.category,
      status: e.status,
    }));

    // ----------------------------------------
    // Step 9: Format upcoming sessions for response
    // ----------------------------------------
    const upcomingSchedules = upcomingSessions.map((session) => ({
      sessionId: session.id,
      enrollmentId: enrollmentMap.get(session.extracurricular_id) || "",
      ekskulId: session.extracurricular.id,
      ekskulName: session.extracurricular.name,
      day: formatSessionDay(session.date),
      dayOfWeek: getDayOfWeekFromDate(session.date),
      startTime: session.start_time,
      endTime: session.end_time,
      location: session.location,
    }));

    // ----------------------------------------
    // Step 10: Get recent announcements
    // ----------------------------------------
    let recentAnnouncements: DashboardSuccessResponse["data"]["recentAnnouncements"] =
      [];

    if (extracurricularIds.length > 0) {
      const announcements = await prisma.announcement.findMany({
        where: {
          extracurricular_id: { in: extracurricularIds },
        },
        include: {
          extracurricular: {
            select: { name: true },
          },
        },
        orderBy: { created_at: "desc" },
        take: 5,
      });

      recentAnnouncements = announcements.map((a) => ({
        id: a.id,
        title: a.title,
        ekskulName: a.extracurricular.name,
        createdAt: a.created_at,
        relativeTime: getRelativeTimeString(a.created_at),
      }));
    }

    // ----------------------------------------
    // Step 11: Return dashboard data
    // ----------------------------------------
    return NextResponse.json({
      success: true,
      data: {
        user: { fullName },
        stats: {
          activeEnrollmentsCount,
          attendancePercentage,
          schedulesThisWeek: sessionsThisWeek,
          newAnnouncementsCount,
        },
        myEkskul,
        upcomingSchedules,
        recentAnnouncements,
      },
    });
  } catch (error) {
    console.error("[STUDENT DASHBOARD ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server. Silakan coba lagi.",
      },
      { status: 500 },
    );
  }
}
