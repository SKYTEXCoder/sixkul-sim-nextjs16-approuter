/**
 * PEMBINA Schedule Data Layer
 *
 * Server-side data fetching and mutations for schedule templates.
 *
 * @module lib/pembina-schedule-data
 */

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ============================================
// Type Definitions
// ============================================

export interface ScheduleTemplate {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location: string;
  sessionCount: number;
}

export interface CreateScheduleInput {
  extracurricular_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location: string;
}

export interface UpdateScheduleInput {
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
}

// ============================================
// Day of Week Mapping
// ============================================

export const DAY_OF_WEEK_OPTIONS = [
  { value: "MONDAY", label: "Senin" },
  { value: "TUESDAY", label: "Selasa" },
  { value: "WEDNESDAY", label: "Rabu" },
  { value: "THURSDAY", label: "Kamis" },
  { value: "FRIDAY", label: "Jumat" },
  { value: "SATURDAY", label: "Sabtu" },
  { value: "SUNDAY", label: "Minggu" },
];

export function getDayLabel(day: string): string {
  const option = DAY_OF_WEEK_OPTIONS.find((d) => d.value === day);
  return option?.label || day;
}

// ============================================
// Data Fetching Functions
// ============================================

/**
 * Fetch all schedule templates for an extracurricular.
 */
export async function getSchedulesByExtracurricular(
  extracurricularId: string
): Promise<ScheduleTemplate[]> {
  const schedules = await prisma.schedule.findMany({
    where: {
      extracurricular_id: extracurricularId,
    },
    include: {
      _count: {
        select: {
          sessions: true,
        },
      },
    },
    orderBy: [
      {
        day_of_week: "asc",
      },
      {
        start_time: "asc",
      },
    ],
  });

  return schedules.map((schedule) => ({
    id: schedule.id,
    day_of_week: schedule.day_of_week,
    start_time: schedule.start_time,
    end_time: schedule.end_time,
    location: schedule.location,
    sessionCount: schedule._count.sessions,
  }));
}

/**
 * Check if a schedule can be deleted (no sessions depend on it).
 */
export async function canDeleteSchedule(scheduleId: string): Promise<boolean> {
  const sessionCount = await prisma.session.count({
    where: {
      schedule_id: scheduleId,
    },
  });

  return sessionCount === 0;
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Create a new schedule template.
 */
export async function createSchedule(
  data: CreateScheduleInput,
  extracurricularId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.schedule.create({
      data: {
        extracurricular_id: extracurricularId,
        day_of_week: data.day_of_week,
        start_time: data.start_time,
        end_time: data.end_time,
        location: data.location,
      },
    });

    revalidatePath(`/pembina/ekstrakurikuler/${extracurricularId}/schedules`);
    revalidatePath(`/pembina/ekstrakurikuler/${extracurricularId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to create schedule:", error);
    return { success: false, error: "Gagal membuat jadwal" };
  }
}

/**
 * Update an existing schedule template.
 */
export async function updateSchedule(
  scheduleId: string,
  data: UpdateScheduleInput,
  extracurricularId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.schedule.update({
      where: { id: scheduleId },
      data,
    });

    revalidatePath(`/pembina/ekstrakurikuler/${extracurricularId}/schedules`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update schedule:", error);
    return { success: false, error: "Gagal mengupdate jadwal" };
  }
}

/**
 * Delete a schedule template.
 * Returns error if sessions depend on it.
 */
export async function deleteSchedule(
  scheduleId: string,
  extracurricularId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if can delete
    const canDelete = await canDeleteSchedule(scheduleId);
    if (!canDelete) {
      return {
        success: false,
        error: "Tidak dapat menghapus jadwal yang sudah memiliki pertemuan",
      };
    }

    await prisma.schedule.delete({
      where: { id: scheduleId },
    });

    revalidatePath(`/pembina/ekstrakurikuler/${extracurricularId}/schedules`);
    revalidatePath(`/pembina/ekstrakurikuler/${extracurricularId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to delete schedule:", error);
    return { success: false, error: "Gagal menghapus jadwal" };
  }
}
