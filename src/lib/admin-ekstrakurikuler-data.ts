/**
 * Admin Ekstrakurikuler Data Layer
 *
 * Server-side data fetching functions for admin ekstrakurikuler management.
 *
 * @module lib/admin-ekstrakurikuler-data
 */

import prisma from "@/lib/prisma";
import { ExtracurricularStatus } from "@/generated/prisma";

// ============================================
// Type Definitions
// ============================================

export interface EkstrakurikulerListItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  status: ExtracurricularStatus;
  created_at: Date;
  pembina: {
    id: string;
    nip: string;
    user: {
      id: string;
      full_name: string;
      email: string | null;
    };
  };
  _count: {
    enrollments: number;
    schedules: number;
    sessions: number;
  };
}

export interface EkstrakurikulerStats {
  total: number;
  active: number;
  inactive: number;
  byCategory: Record<string, number>;
  totalEnrollments: number;
}

export interface EkstrakurikulerFilters {
  status?: ExtracurricularStatus;
  category?: string;
  search?: string;
}

// ============================================
// Data Fetching Functions
// ============================================

/**
 * Get all ekstrakurikuler with optional filters
 */
export async function getAllEkstrakurikuler(
  filters?: EkstrakurikulerFilters
): Promise<EkstrakurikulerListItem[]> {
  const where: Record<string, unknown> = {};

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.category) {
    where.category = { contains: filters.category, mode: "insensitive" };
  }

  if (filters?.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const ekstrakurikuler = await prisma.extracurricular.findMany({
    where,
    include: {
      pembina: {
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          enrollments: true,
          schedules: true,
          sessions: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return ekstrakurikuler;
}

/**
 * Get ekstrakurikuler by ID with full details
 */
export async function getEkstrakurikulerById(
  id: string
): Promise<EkstrakurikulerListItem | null> {
  const ekskul = await prisma.extracurricular.findUnique({
    where: { id },
    include: {
      pembina: {
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          enrollments: true,
          schedules: true,
          sessions: true,
        },
      },
    },
  });

  return ekskul;
}

/**
 * Get ekstrakurikuler statistics for dashboard
 */
export async function getEkstrakurikulerStats(): Promise<EkstrakurikulerStats> {
  const [total, active, inactive, allEkskul, totalEnrollments] =
    await Promise.all([
      prisma.extracurricular.count(),
      prisma.extracurricular.count({ where: { status: "ACTIVE" } }),
      prisma.extracurricular.count({ where: { status: "INACTIVE" } }),
      prisma.extracurricular.findMany({
        select: { category: true },
      }),
      prisma.enrollment.count(),
    ]);

  // Count by category
  const byCategory: Record<string, number> = {};
  for (const ekskul of allEkskul) {
    byCategory[ekskul.category] = (byCategory[ekskul.category] || 0) + 1;
  }

  return {
    total,
    active,
    inactive,
    byCategory,
    totalEnrollments,
  };
}

/**
 * Get unique categories for filtering
 */
export async function getCategories(): Promise<string[]> {
  const categories = await prisma.extracurricular.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return categories.map((c) => c.category);
}

/**
 * Get top ekstrakurikuler by enrollment count
 */
export async function getTopEkstrakurikuler(limit: number = 5): Promise<
  Array<{
    id: string;
    name: string;
    category: string;
    enrollmentCount: number;
  }>
> {
  const ekskul = await prisma.extracurricular.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      category: true,
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: {
      enrollments: {
        _count: "desc",
      },
    },
    take: limit,
  });

  return ekskul.map((e) => ({
    id: e.id,
    name: e.name,
    category: e.category,
    enrollmentCount: e._count.enrollments,
  }));
}
