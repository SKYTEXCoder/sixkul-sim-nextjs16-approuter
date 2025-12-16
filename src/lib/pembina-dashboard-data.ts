/**
 * PEMBINA Dashboard Data Layer
 *
 * Server-side read-only data fetching for PEMBINA dashboard.
 * All functions require authentication and enforce ownership validation.
 * No writes are performed from this module.
 *
 * @module lib/pembina-dashboard-data
 */

import { prisma } from "@/lib/prisma";
import { getPembinaExtracurriculars } from "@/lib/pembina-ekstrakurikuler-data";

// ============================================
// Type Definitions
// ============================================

export interface DashboardSummary {
  totalExtracurriculars: number;
  totalActiveMembers: number;
  totalPendingEnrollments: number;
  totalUpcomingSessions: number;
}

export interface UpcomingSession {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  notes: string | null;
  extracurricular: {
    id: string;
    name: string;
  };
}

export interface PendingEnrollmentPreview {
  id: string;
  studentName: string;
  extracurricularId: string;
  extracurricularName: string;
  requestedAt: Date;
}

// ============================================
// Constants
// ============================================

/**
 * Maximum items to display in preview lists.
 * Keeps dashboard lightweight and performant.
 */
const PREVIEW_LIST_CAP = 5;

// ============================================
// Data Fetching Functions
// ============================================

/**
 * Get aggregated summary stats for the PEMBINA dashboard.
 * Returns counts for extracurriculars, members, pending, and upcoming sessions.
 */
export async function getPembinaDashboardSummary(
  clerkUserId: string
): Promise<DashboardSummary> {
  // Re-use existing function to get extracurriculars with counts
  const extracurriculars = await getPembinaExtracurriculars(clerkUserId);

  if (extracurriculars.length === 0) {
    return {
      totalExtracurriculars: 0,
      totalActiveMembers: 0,
      totalPendingEnrollments: 0,
      totalUpcomingSessions: 0,
    };
  }

  // Aggregate counts from extracurriculars
  const totalActiveMembers = extracurriculars.reduce(
    (sum, e) => sum + e.memberCount,
    0
  );
  const totalPendingEnrollments = extracurriculars.reduce(
    (sum, e) => sum + e.pendingCount,
    0
  );

  // Get upcoming sessions count (now <= date < now + 7 days, not cancelled)
  const extracurricularIds = extracurriculars.map((e) => e.id);
  const now = new Date();
  const nowPlus7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const upcomingSessionsCount = await prisma.session.count({
    where: {
      extracurricular_id: { in: extracurricularIds },
      date: {
        gte: now, // now <= session.date
        lt: nowPlus7Days, // session.date < now + 7 days
      },
      is_cancelled: false,
    },
  });

  return {
    totalExtracurriculars: extracurriculars.length,
    totalActiveMembers,
    totalPendingEnrollments,
    totalUpcomingSessions: upcomingSessionsCount,
  };
}

/**
 * Re-export getPembinaExtracurriculars for dashboard extracurricular overview.
 * This maintains a single source of truth for extracurricular fetching.
 */
export { getPembinaExtracurriculars as getPembinaExtracurricularOverview } from "@/lib/pembina-ekstrakurikuler-data";

/**
 * Get upcoming sessions for the next 7 days across all owned extracurriculars.
 *
 * Filter: now <= session.date < now + 7 days, is_cancelled === false
 * Cap: Maximum 5 items (PREVIEW_LIST_CAP) for dashboard preview.
 * Order: Ascending by date, then start_time.
 */
export async function getUpcomingSessions(
  clerkUserId: string
): Promise<UpcomingSession[]> {
  // First, get the PEMBINA profile
  const user = await prisma.user.findUnique({
    where: { clerk_id: clerkUserId },
    include: {
      pembinaProfile: true,
    },
  });

  if (!user || !user.pembinaProfile) {
    return [];
  }

  const pembinaProfileId = user.pembinaProfile.id;

  // Get extracurricular IDs owned by this PEMBINA
  const extracurriculars = await prisma.extracurricular.findMany({
    where: { pembina_id: pembinaProfileId },
    select: { id: true },
  });

  if (extracurriculars.length === 0) {
    return [];
  }

  const extracurricularIds = extracurriculars.map((e) => e.id);
  const now = new Date();
  const nowPlus7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Fetch upcoming sessions with extracurricular info
  // Cap at PREVIEW_LIST_CAP (5 items) for dashboard display
  const sessions = await prisma.session.findMany({
    where: {
      extracurricular_id: { in: extracurricularIds },
      date: {
        gte: now, // now <= session.date
        lt: nowPlus7Days, // session.date < now + 7 days
      },
      is_cancelled: false, // exclude cancelled sessions
    },
    include: {
      extracurricular: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [{ date: "asc" }, { start_time: "asc" }],
    take: PREVIEW_LIST_CAP, // Cap at 5 items for preview
  });

  return sessions.map((session) => ({
    id: session.id,
    date: session.date,
    startTime: session.start_time,
    endTime: session.end_time,
    location: session.location,
    notes: session.notes,
    extracurricular: {
      id: session.extracurricular.id,
      name: session.extracurricular.name,
    },
  }));
}

/**
 * Get preview of pending enrollment requests across all owned extracurriculars.
 *
 * Cap: Maximum 5 items (PREVIEW_LIST_CAP) for dashboard preview.
 * Order: Most recent requests first (by joined_at descending).
 */
export async function getPendingEnrollmentsPreview(
  clerkUserId: string
): Promise<PendingEnrollmentPreview[]> {
  // First, get the PEMBINA profile
  const user = await prisma.user.findUnique({
    where: { clerk_id: clerkUserId },
    include: {
      pembinaProfile: true,
    },
  });

  if (!user || !user.pembinaProfile) {
    return [];
  }

  const pembinaProfileId = user.pembinaProfile.id;

  // Get extracurricular IDs owned by this PEMBINA
  const extracurriculars = await prisma.extracurricular.findMany({
    where: { pembina_id: pembinaProfileId },
    select: { id: true },
  });

  if (extracurriculars.length === 0) {
    return [];
  }

  const extracurricularIds = extracurriculars.map((e) => e.id);

  // Fetch pending enrollments with student and extracurricular info
  // Cap at PREVIEW_LIST_CAP (5 items) for dashboard display
  const enrollments = await prisma.enrollment.findMany({
    where: {
      extracurricular_id: { in: extracurricularIds },
      status: "PENDING",
    },
    include: {
      student: {
        include: {
          user: {
            select: {
              full_name: true,
            },
          },
        },
      },
      extracurricular: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { joined_at: "desc" }, // Most recent first
    take: PREVIEW_LIST_CAP, // Cap at 5 items for preview
  });

  return enrollments.map((enrollment) => ({
    id: enrollment.id,
    studentName: enrollment.student.user.full_name,
    extracurricularId: enrollment.extracurricular.id,
    extracurricularName: enrollment.extracurricular.name,
    requestedAt: enrollment.joined_at,
  }));
}
