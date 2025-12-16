"use server";

/**
 * PEMBINA Schedule Server Actions
 *
 * Server actions for schedule CRUD operations.
 *
 * @module app/(dashboard)/pembina/ekstrakurikuler/[id]/schedules/actions
 */

import { auth } from "@clerk/nextjs/server";
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from "@/lib/pembina-schedule-data";
import { validatePembinaOwnership } from "@/lib/pembina-ekstrakurikuler-data";

// ============================================
// Server Actions
// ============================================

export async function createScheduleAction(
  extracurricularId: string,
  formData: FormData,
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

  const day_of_week = formData.get("day_of_week") as string;
  const start_time = formData.get("start_time") as string;
  const end_time = formData.get("end_time") as string;
  const location = formData.get("location") as string;

  if (!day_of_week || !start_time || !end_time || !location) {
    return { success: false, error: "Semua field harus diisi" };
  }

  return createSchedule(
    {
      extracurricular_id: extracurricularId,
      day_of_week,
      start_time,
      end_time,
      location,
    },
    extracurricularId,
  );
}

export async function updateScheduleAction(
  scheduleId: string,
  extracurricularId: string,
  formData: FormData,
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

  const day_of_week = formData.get("day_of_week") as string;
  const start_time = formData.get("start_time") as string;
  const end_time = formData.get("end_time") as string;
  const location = formData.get("location") as string;

  return updateSchedule(
    scheduleId,
    {
      day_of_week,
      start_time,
      end_time,
      location,
    },
    extracurricularId,
  );
}

export async function deleteScheduleAction(
  scheduleId: string,
  extracurricularId: string,
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

  return deleteSchedule(scheduleId, extracurricularId);
}
