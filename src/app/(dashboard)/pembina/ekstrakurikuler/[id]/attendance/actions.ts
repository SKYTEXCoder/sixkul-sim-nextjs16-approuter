"use server";

/**
 * PEMBINA Attendance Server Actions
 *
 * Server actions for SESSION-BASED attendance.
 * CRITICAL: session_id is REQUIRED for all attendance operations.
 *
 * @module app/(dashboard)/pembina/ekstrakurikuler/[id]/attendance/actions
 */

import { auth } from "@clerk/nextjs/server";
import {
  saveSessionAttendance,
  getAttendanceBySession,
  AttendanceInput,
  AttendanceRecord,
} from "@/lib/pembina-attendance-data";
import { validatePembinaOwnership } from "@/lib/pembina-ekstrakurikuler-data";

// ============================================
// Server Actions
// ============================================

export async function getAttendanceAction(
  sessionId: string,
): Promise<AttendanceRecord[]> {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  return getAttendanceBySession(sessionId);
}

export async function saveAttendanceAction(
  sessionId: string,
  extracurricularId: string,
  records: AttendanceInput[],
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

  // Validate session_id is provided (REQUIRED)
  if (!sessionId) {
    return {
      success: false,
      error: "Session ID diperlukan untuk menyimpan absensi",
    };
  }

  return saveSessionAttendance(sessionId, extracurricularId, records);
}
