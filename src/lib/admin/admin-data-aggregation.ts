import prisma from "@/lib/prisma";
import { ExtracurricularStatus } from "@/generated/prisma";

// ============================================
// Types
// ============================================

export type HealthStatus = "HEALTHY" | "WARNING" | "CRITICAL" | "INACTIVE";

export interface SystemOverviewMetrics {
  totalUsers: number;
  totalPembina: number;
  totalStudents: number;
  totalExtracurriculars: number;
  activeExtracurriculars: number;
  totalEnrollments: number;
  activeEnrollments: number;
  trends: {
    usersGrowth: number;
    enrollmentGrowth: number;
  };
}

export interface ExtracurricularHealth {
  id: string;
  name: string;
  category: string;
  pembinaName: string | null;
  membersCount: number;
  lastSessionDate: Date | null;
  totalSessions30Days: number;
  healthStatus: HealthStatus;
  status: ExtracurricularStatus;
}

export interface PembinaActivityMetrics {
  id: string; // Pembina Profile ID
  userId: string;
  name: string;
  assignedExtracurricularsCount: number;
  sessionsCreated30Days: number;
  lastSessionDate: Date | null;
}

// ============================================
// Aggregation Functions
// ============================================

/**
 * Get high-level system overview metrics.
 * Aggregates counts of users, extracurriculars, and enrollments.
 */
export async function getSystemOverviewMetrics(): Promise<SystemOverviewMetrics> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    totalPembina,
    totalStudents,
    totalExtracurriculars,
    activeExtracurriculars,
    totalEnrollments,
    activeEnrollments,
    users30DaysAgo,
    enrollments30DaysAgo,
  ] = await Promise.all([
    prisma.user.count({ where: { deleted_at: null } }),
    prisma.user.count({ where: { role: "PEMBINA", deleted_at: null } }),
    prisma.user.count({ where: { role: "SISWA", deleted_at: null } }),
    prisma.extracurricular.count({ where: { deleted_at: null } }),
    prisma.extracurricular.count({
      where: { status: "ACTIVE", deleted_at: null },
    }),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({
      where: {
        deleted_at: null,
        created_at: { lt: thirtyDaysAgo },
      },
    }),
    prisma.enrollment.count({
      where: {
        joined_at: { lt: thirtyDaysAgo },
      },
    }),
  ]);

  const calculateGrowth = (current: number, past: number) => {
    if (past === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - past) / past) * 100);
  };

  return {
    totalUsers,
    totalPembina,
    totalStudents,
    totalExtracurriculars,
    activeExtracurriculars,
    totalEnrollments,
    activeEnrollments,
    trends: {
      usersGrowth: calculateGrowth(totalUsers, users30DaysAgo),
      enrollmentGrowth: calculateGrowth(totalEnrollments, enrollments30DaysAgo),
    },
  };
}

/**
 * Get list of all extracurriculars with computed health status.
 * Health Status Logic:
 * - INACTIVE: status is INACTIVE
 * - CRITICAL: No Pembina OR No session in > 30 days
 * - WARNING: No session in > 14 days
 * - HEALTHY: Session in <= 14 days
 */
export async function getExtracurricularHealthList(): Promise<
  ExtracurricularHealth[]
> {
  const extras = await prisma.extracurricular.findMany({
    where: { deleted_at: null },
    select: {
      id: true,
      name: true,
      category: true,
      status: true,
      pembina: {
        select: {
          user: {
            select: { full_name: true },
          },
        },
      },
      _count: {
        select: {
          enrollments: { where: { status: "ACTIVE" } },
        },
      },
      sessions: {
        where: { deleted_at: null },
        orderBy: { date: "desc" },
        take: 1, // Get latest session
      },
    },
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // We need to fetch session counts for last 30 days separately or include efficiently.
  // Given we iterate, let's just fetch counts if performance allows, or derive from "last session" for simplified logic first.
  // To get *count* of sessions in last 30 days efficiently for ALL extras, we might need a separate groupBy query.

  const sessionCounts = await prisma.session.groupBy({
    by: ["extracurricular_id"],
    where: {
      date: { gte: thirtyDaysAgo },
      deleted_at: null,
    },
    _count: true,
  });

  const sessionCountMap = new Map<string, number>();
  sessionCounts.forEach((s) =>
    sessionCountMap.set(s.extracurricular_id, s._count)
  );

  const now = new Date();

  return extras.map((e) => {
    const lastSession = e.sessions[0];
    const lastSessionDate = lastSession ? lastSession.date : null;
    const daysSinceLastSession = lastSessionDate
      ? Math.floor(
          (now.getTime() - lastSessionDate.getTime()) / (1000 * 3600 * 24)
        )
      : 999;

    let healthStatus: HealthStatus = "HEALTHY";

    if (e.status === "INACTIVE") {
      healthStatus = "INACTIVE";
    } else {
      if (!e.pembina || daysSinceLastSession > 30) {
        healthStatus = "CRITICAL";
      } else if (daysSinceLastSession > 14) {
        healthStatus = "WARNING";
      } else {
        healthStatus = "HEALTHY";
      }
    }

    return {
      id: e.id,
      name: e.name,
      category: e.category,
      pembinaName: e.pembina?.user.full_name || null,
      membersCount: e._count.enrollments,
      lastSessionDate,
      totalSessions30Days: sessionCountMap.get(e.id) || 0,
      healthStatus,
      status: e.status,
    };
  });
}

/**
 * Get detailed health metrics for a specific extracurricular.
 */
export async function getExtracurricularHealthDetail(id: string) {
  // Basic info
  const info = await prisma.extracurricular.findUnique({
    where: { id },
    include: {
      pembina: { include: { user: true } },
      _count: { select: { enrollments: { where: { status: "ACTIVE" } } } },
    },
  });

  if (!info) return null;

  // Recent sessions
  const recentSessions = await prisma.session.findMany({
    where: { extracurricular_id: id, deleted_at: null },
    orderBy: { date: "desc" },
    take: 5,
    include: {
      _count: { select: { attendances: { where: { status: "PRESENT" } } } },
    },
  });

  // Attendance Rate (Last 5 sessions)
  // We need total active enrollments at the time? Approximate with current active count.
  const activeMembers = info._count.enrollments;

  const sessionMetrics = recentSessions.map((s) => ({
    date: s.date,
    presentCount: s._count.attendances,
    attendanceRate:
      activeMembers > 0 ? (s._count.attendances / activeMembers) * 100 : 0,
  }));

  // Status logic (reuse similar logic or return raw data)
  // ... logic same as list ...
  const lastSession = recentSessions[0];
  const now = new Date();
  const daysSinceLastSession = lastSession
    ? Math.floor(
        (now.getTime() - lastSession.date.getTime()) / (1000 * 3600 * 24)
      )
    : 999;

  let healthStatus: HealthStatus = "HEALTHY";
  if (info.status === "INACTIVE") {
    healthStatus = "INACTIVE";
  } else if (!info.pembina || daysSinceLastSession > 30) {
    healthStatus = "CRITICAL";
  } else if (daysSinceLastSession > 14) {
    healthStatus = "WARNING";
  }

  return {
    info,
    healthStatus,
    recentSessions: sessionMetrics,
    stats: {
      activeMembers,
      totalSessions: await prisma.session.count({
        where: { extracurricular_id: id, deleted_at: null },
      }),
    },
  };
}

/**
 * Get activity metrics for all Pembinas.
 * Lists pembina with their assigned extracurriculars count and recent session activity.
 */
export async function getPembinaActivityMetrics(): Promise<
  PembinaActivityMetrics[]
> {
  const pembinas = await prisma.pembinaProfile.findMany({
    include: {
      user: {
        select: { id: true, full_name: true },
      },
      extracurriculars: {
        select: {
          id: true,
          sessions: {
            where: { deleted_at: null },
            select: { date: true },
            orderBy: { date: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sessions = await prisma.session.findMany({
    where: {
      date: { gte: thirtyDaysAgo },
      deleted_at: null,
      extracurricular: {
        pembina_id: { in: pembinas.map((p) => p.id) },
      },
    },
    select: {
      extracurricular: { select: { pembina_id: true } },
    },
  });

  const sessionCountMap = new Map<string, number>();
  sessions.forEach((s) => {
    const pid = s.extracurricular?.pembina_id;
    if (pid) {
      sessionCountMap.set(pid, (sessionCountMap.get(pid) || 0) + 1);
    }
  });

  return pembinas.map((p) => {
    let lastSessionDate: Date | null = null;
    p.extracurriculars.forEach((e) => {
      const eDate = e.sessions[0]?.date;
      if (eDate && (!lastSessionDate || eDate > lastSessionDate)) {
        lastSessionDate = eDate;
      }
    });

    return {
      id: p.id,
      userId: p.user.id,
      name: p.user.full_name,
      assignedExtracurricularsCount: p.extracurriculars.length,
      sessionsCreated30Days: sessionCountMap.get(p.id) || 0,
      lastSessionDate,
    };
  });
}
