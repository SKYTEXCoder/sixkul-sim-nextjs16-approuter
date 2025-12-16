"use server";

/**
 * PEMBINA Session Server Actions
 *
 * Server actions for session management.
 *
 * @module app/(dashboard)/pembina/ekstrakurikuler/[id]/sessions/actions
 */

import { auth } from "@clerk/nextjs/server";
import {
  generateSessionsFromSchedules,
  deleteSession,
} from "@/lib/pembina-session-data";
import { validatePembinaOwnership } from "@/lib/pembina-ekstrakurikuler-data";

// ============================================
// Server Actions
// ============================================

export async function generateSessionsAction(
  extracurricularId: string,
  startDate: string,
  endDate: string
): Promise<{ success: boolean; count: number; error?: string }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, count: 0, error: "Tidak terautentikasi" };
  }

  // Validate ownership
  const isOwner = await validatePembinaOwnership(extracurricularId, userId);
  if (!isOwner) {
    return { success: false, count: 0, error: "Tidak memiliki akses" };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { success: false, count: 0, error: "Tanggal tidak valid" };
  }

  if (start > end) {
    return {
      success: false,
      count: 0,
      error: "Tanggal mulai harus sebelum tanggal selesai",
    };
  }

  return generateSessionsFromSchedules(extracurricularId, start, end);
}

export async function deleteSessionAction(
  sessionId: string,
  extracurricularId: string
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: "Tidak terautentikasi" };
  }

  // Validate ownership
  const isOwner = await validatePembinaOwnership(extracurricularId, userId);
  if (!isOwner) {
    return { success: false, error: "Tidak memiliki akses" };
  }

  return deleteSession(sessionId, extracurricularId);
}
