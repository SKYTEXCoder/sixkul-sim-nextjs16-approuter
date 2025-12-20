/**
 * Admin User Data Layer
 *
 * Server-side data fetching functions for admin user management.
 *
 * @module lib/admin-user-data
 */

import prisma from "@/lib/prisma";
import { UserRole } from "@/generated/prisma";

// ============================================
// Type Definitions
// ============================================

export interface UserListItem {
  id: string;
  clerk_id: string;
  username: string;
  email: string | null;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: Date;
  studentProfile?: {
    id: string;
    nis: string;
    class_name: string;
    major: string;
  } | null;
  pembinaProfile?: {
    id: string;
    nip: string;
    expertise: string | null;
  } | null;
  isActive: boolean;
}

export interface UserStats {
  total: number;
  byRole: {
    ADMIN: number;
    PEMBINA: number;
    SISWA: number;
  };
  active: number;
  inactive: number;
}

export interface UserFilters {
  role?: UserRole;
  search?: string;
  isActive?: boolean;
}

// ============================================
// Data Fetching Functions
// ============================================

/**
 * Get all users with optional filters
 */
export async function getAllUsers(
  filters?: UserFilters
): Promise<UserListItem[]> {
  const where: Record<string, unknown> = {};

  if (filters?.role) {
    where.role = filters.role;
  }

  if (filters?.search) {
    where.OR = [
      { full_name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
      { username: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  // Filter by active status (users without DEACTIVATED_ prefix)
  if (filters?.isActive === true) {
    where.clerk_id = { not: { startsWith: "DEACTIVATED_" } };
  } else if (filters?.isActive === false) {
    where.clerk_id = { startsWith: "DEACTIVATED_" };
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      studentProfile: {
        select: {
          id: true,
          nis: true,
          class_name: true,
          major: true,
        },
      },
      pembinaProfile: {
        select: {
          id: true,
          nip: true,
          expertise: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return users.map((user) => ({
    ...user,
    isActive: !user.clerk_id.startsWith("DEACTIVATED_"),
  }));
}

/**
 * Get user statistics for dashboard
 */
export async function getUserStats(): Promise<UserStats> {
  const [total, admins, pembinas, siswas, inactive] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "PEMBINA" } }),
    prisma.user.count({ where: { role: "SISWA" } }),
    prisma.user.count({
      where: { clerk_id: { startsWith: "DEACTIVATED_" } },
    }),
  ]);

  return {
    total,
    byRole: {
      ADMIN: admins,
      PEMBINA: pembinas,
      SISWA: siswas,
    },
    active: total - inactive,
    inactive,
  };
}

/**
 * Get available pembina users for assignment dropdown
 */
export async function getAvailablePembina(): Promise<
  Array<{
    id: string;
    nip: string;
    user: {
      id: string;
      full_name: string;
      email: string | null;
    };
  }>
> {
  const pembinas = await prisma.pembinaProfile.findMany({
    where: {
      user: {
        clerk_id: { not: { startsWith: "DEACTIVATED_" } },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          full_name: true,
          email: true,
        },
      },
    },
    orderBy: {
      user: {
        full_name: "asc",
      },
    },
  });

  return pembinas;
}
