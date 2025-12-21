/**
 * PEMBINA Extracurricular Data Layer
 *
 * Server-side data fetching for PEMBINA-owned extracurriculars.
 * All functions require authentication and enforce ownership validation.
 *
 * @module lib/pembina-ekstrakurikuler-data
 */

import { prisma } from "@/lib/prisma";

// ============================================
// Type Definitions
// ============================================

export interface ExtracurricularSummary {
  id: string;
  name: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  status: "ACTIVE" | "INACTIVE";
  memberCount: number;
  pendingCount: number;
  scheduleCount: number;
  sessionCount: number;
}

export interface ExtracurricularDetail extends ExtracurricularSummary {
  upcomingSessionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Data Fetching Functions
// ============================================

/**
 * Fetch all extracurriculars owned by the authenticated PEMBINA.
 * Returns summary data for list display.
 */
export async function getPembinaExtracurriculars(
  clerkUserId: string
): Promise<ExtracurricularSummary[]> {
  // First, get the PEMBINA profile from the User
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

  // Fetch extracurriculars with counts
  const extracurriculars = await prisma.extracurricular.findMany({
    where: {
      pembina_id: pembinaProfileId,
      deleted_at: null, // Hardening: Exclude soft-deleted
    },
    include: {
      _count: {
        select: {
          schedules: true,
          sessions: true,
        },
      },
      enrollments: {
        select: {
          status: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return extracurriculars.map((ekskul) => ({
    id: ekskul.id,
    name: ekskul.name,
    category: ekskul.category,
    description: ekskul.description,
    logo_url: ekskul.logo_url,
    status: ekskul.status,
    memberCount: ekskul.enrollments.filter((e) => e.status === "ACTIVE").length,
    pendingCount: ekskul.enrollments.filter((e) => e.status === "PENDING")
      .length,
    scheduleCount: ekskul._count.schedules,
    sessionCount: ekskul._count.sessions,
  }));
}

/**
 * Fetch single extracurricular with ownership validation.
 * Returns null if not found or not owned by the PEMBINA.
 */
export async function getExtracurricularById(
  id: string,
  clerkUserId: string
): Promise<ExtracurricularDetail | null> {
  // First, get the PEMBINA profile from the User
  const user = await prisma.user.findUnique({
    where: { clerk_id: clerkUserId },
    include: {
      pembinaProfile: true,
    },
  });

  if (!user || !user.pembinaProfile) {
    return null;
  }

  const pembinaProfileId = user.pembinaProfile.id;

  // Fetch extracurricular with ownership check
  const ekskul = await prisma.extracurricular.findFirst({
    where: {
      id,
      pembina_id: pembinaProfileId, // Ownership validation
      deleted_at: null, // Hardening: Exclude soft-deleted
    },
    include: {
      _count: {
        select: {
          schedules: true,
          sessions: true,
        },
      },
      enrollments: {
        select: {
          status: true,
        },
      },
      sessions: {
        where: {
          date: {
            gte: new Date(),
          },
          is_cancelled: false,
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (!ekskul) {
    return null;
  }

  return {
    id: ekskul.id,
    name: ekskul.name,
    category: ekskul.category,
    description: ekskul.description,
    logo_url: ekskul.logo_url,
    status: ekskul.status,
    memberCount: ekskul.enrollments.filter((e) => e.status === "ACTIVE").length,
    pendingCount: ekskul.enrollments.filter((e) => e.status === "PENDING")
      .length,
    scheduleCount: ekskul._count.schedules,
    sessionCount: ekskul._count.sessions,
    upcomingSessionCount: ekskul.sessions.length,
    createdAt: ekskul.created_at,
    updatedAt: ekskul.updated_at,
  };
}

/**
 * Validate PEMBINA ownership of an extracurricular.
 * Returns true if the extracurricular is owned by the PEMBINA.
 */
export async function validatePembinaOwnership(
  extracurricularId: string,
  clerkUserId: string
): Promise<boolean> {
  // First, get the PEMBINA profile from the User
  const user = await prisma.user.findUnique({
    where: { clerk_id: clerkUserId },
    include: {
      pembinaProfile: true,
    },
  });

  if (!user || !user.pembinaProfile) {
    return false;
  }

  const pembinaProfileId = user.pembinaProfile.id;

  // Check ownership
  const ekskul = await prisma.extracurricular.findFirst({
    where: {
      id: extracurricularId,
      pembina_id: pembinaProfileId,
      deleted_at: null, // Hardening: Exclude soft-deleted
    },
    select: {
      id: true,
    },
  });

  return ekskul !== null;
}
