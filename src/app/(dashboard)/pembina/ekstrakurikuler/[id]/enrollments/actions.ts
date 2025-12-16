"use server";

/**
 * PEMBINA Enrollment Server Actions
 *
 * Server actions for enrollment approval/rejection.
 * CONSTRAINTS: No bulk actions, one-by-one only.
 *
 * @module app/(dashboard)/pembina/ekstrakurikuler/[id]/enrollments/actions
 */

import { auth } from "@clerk/nextjs/server";
import {
  approveEnrollment,
  rejectEnrollment,
} from "@/lib/pembina-enrollment-data";
import { validatePembinaOwnership } from "@/lib/pembina-ekstrakurikuler-data";

// ============================================
// Server Actions
// ============================================

export async function approveEnrollmentAction(
  enrollmentId: string,
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

  return approveEnrollment(enrollmentId, extracurricularId);
}

export async function rejectEnrollmentAction(
  enrollmentId: string,
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

  return rejectEnrollment(enrollmentId, extracurricularId);
}
