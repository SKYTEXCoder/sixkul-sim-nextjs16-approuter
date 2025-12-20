/**
 * Admin Dashboard Data Layer
 *
 * Server-side data fetching functions for admin dashboard.
 *
 * @module lib/admin-dashboard-data
 */

import prisma from "@/lib/prisma";
import { getUserStats } from "./admin-user-data";
import {
  getEkstrakurikulerStats,
  getTopEkstrakurikuler,
} from "./admin-ekstrakurikuler-data";

// ============================================
// Type Definitions
// ============================================

export interface DashboardStats {
  users: {
    total: number;
    byRole: {
      ADMIN: number;
      PEMBINA: number;
      SISWA: number;
    };
    active: number;
  };
  ekstrakurikuler: {
    total: number;
    active: number;
    categories: number;
  };
  enrollments: {
    total: number;
    active: number;
    pending: number;
  };
  activity: number; // Activity percentage (placeholder)
}

export interface RecentActivity {
  id: string;
  action: string;
  user: string;
  time: Date;
  type: "user" | "enrollment" | "attendance" | "ekskul";
}

// ============================================
// Data Fetching Functions
// ============================================

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [userStats, ekskulStats, enrollmentCounts] = await Promise.all([
    getUserStats(),
    getEkstrakurikulerStats(),
    prisma.enrollment.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  // Calculate enrollment counts
  let totalEnrollments = 0;
  let activeEnrollments = 0;
  let pendingEnrollments = 0;

  for (const group of enrollmentCounts) {
    totalEnrollments += group._count;
    if (group.status === "ACTIVE") {
      activeEnrollments = group._count;
    } else if (group.status === "PENDING") {
      pendingEnrollments = group._count;
    }
  }

  // Calculate activity percentage (active enrollments / total enrollments)
  const activityPercent =
    totalEnrollments > 0
      ? Math.round((activeEnrollments / totalEnrollments) * 100)
      : 0;

  return {
    users: {
      total: userStats.total,
      byRole: userStats.byRole,
      active: userStats.active,
    },
    ekstrakurikuler: {
      total: ekskulStats.total,
      active: ekskulStats.active,
      categories: Object.keys(ekskulStats.byCategory).length,
    },
    enrollments: {
      total: totalEnrollments,
      active: activeEnrollments,
      pending: pendingEnrollments,
    },
    activity: activityPercent,
  };
}

/**
 * Get recent activity log
 * Note: This is a simplified version - in production, consider using an audit log table
 */
export async function getRecentActivity(
  limit: number = 5
): Promise<RecentActivity[]> {
  const [recentUsers, recentEnrollments] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        full_name: true,
        role: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
      take: limit,
    }),
    prisma.enrollment.findMany({
      select: {
        id: true,
        status: true,
        joined_at: true,
        student: {
          select: {
            user: {
              select: { full_name: true },
            },
          },
        },
        extracurricular: {
          select: { name: true },
        },
      },
      orderBy: { joined_at: "desc" },
      take: limit,
    }),
  ]);

  // Combine and sort activities
  const activities: RecentActivity[] = [];

  for (const user of recentUsers) {
    activities.push({
      id: `user-${user.id}`,
      action: "User baru terdaftar",
      user: user.full_name,
      time: user.created_at,
      type: "user",
    });
  }

  for (const enrollment of recentEnrollments) {
    activities.push({
      id: `enrollment-${enrollment.id}`,
      action: `Pendaftaran ekskul ${enrollment.status === "PENDING" ? "(Pending)" : ""}`,
      user: `${enrollment.student.user.full_name} → ${enrollment.extracurricular.name}`,
      time: enrollment.joined_at,
      type: "enrollment",
    });
  }

  // Sort by time descending and take limit
  return activities
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, limit);
}

/**
 * Re-export top ekstrakurikuler from ekstrakurikuler data layer
 */
export { getTopEkstrakurikuler } from "./admin-ekstrakurikuler-data";
