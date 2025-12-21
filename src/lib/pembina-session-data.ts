/**
 * PEMBINA Session Data Layer
 *
 * Server-side data fetching and mutations for session management.
 *
 * @module lib/pembina-session-data
 */

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { addDays, format, getDay, startOfDay, endOfDay } from "date-fns";

// ============================================
// Type Definitions
// ============================================

export interface SessionListItem {
  id: string;
  date: Date;
  start_time: string;
  end_time: string;
  location: string;
  notes: string | null;
  is_cancelled: boolean;
  attendanceCount: number;
  scheduleDay: string | null;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Day of week mapping (JS getDay: 0=Sunday, 1=Monday, etc.)
const DAY_MAP: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

// ============================================
// Data Fetching Functions
// ============================================

/**
 * Fetch all sessions for an extracurricular.
 */
/**
 * Fetch all sessions for an extracurricular.
 */
export async function getSessionsByExtracurricular(
  extracurricularId: string
): Promise<SessionListItem[]> {
  const sessions = await prisma.session.findMany({
    where: {
      extracurricular_id: extracurricularId,
      deleted_at: null, // Hardening: Exclude soft-deleted sessions
    },
    include: {
      _count: {
        select: {
          attendances: true,
        },
      },
      schedule: {
        select: {
          day_of_week: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  return sessions.map((session) => ({
    id: session.id,
    date: session.date,
    start_time: session.start_time,
    end_time: session.end_time,
    location: session.location,
    notes: session.notes,
    is_cancelled: session.is_cancelled,
    attendanceCount: session._count.attendances,
    scheduleDay: session.schedule?.day_of_week || null,
  }));
}

/**
 * Get upcoming sessions (for attendance selection).
 */
export async function getUpcomingSessions(
  extracurricularId: string
): Promise<SessionListItem[]> {
  const today = startOfDay(new Date());

  const sessions = await prisma.session.findMany({
    where: {
      extracurricular_id: extracurricularId,
      date: {
        gte: today,
      },
      is_cancelled: false,
      deleted_at: null, // Hardening: Exclude soft-deleted sessions
    },
    include: {
      _count: {
        select: {
          attendances: true,
        },
      },
      schedule: {
        select: {
          day_of_week: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  return sessions.map((session) => ({
    id: session.id,
    date: session.date,
    start_time: session.start_time,
    end_time: session.end_time,
    location: session.location,
    notes: session.notes,
    is_cancelled: session.is_cancelled,
    attendanceCount: session._count.attendances,
    scheduleDay: session.schedule?.day_of_week || null,
  }));
}

/**
 * Check if a session can be deleted (no attendance exists).
 */
export async function canDeleteSession(sessionId: string): Promise<boolean> {
  const attendanceCount = await prisma.attendance.count({
    where: {
      session_id: sessionId,
    },
  });

  return attendanceCount === 0;
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Generate sessions from schedule templates for a date range.
 */
export async function generateSessionsFromSchedules(
  extracurricularId: string,
  startDate: Date,
  endDate: Date
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    // Get all schedules for this extracurricular
    const schedules = await prisma.schedule.findMany({
      where: {
        extracurricular_id: extracurricularId,
      },
    });

    if (schedules.length === 0) {
      return {
        success: false,
        count: 0,
        error: "Tidak ada jadwal rutin. Buat jadwal terlebih dahulu.",
      };
    }

    // Get existing sessions in the date range to avoid duplicates
    // Hardening: Only check non-deleted sessions.
    // Use Case: If user listed sessions, deleted one, and regenerates -> we should recreate it.
    const existingSessions = await prisma.session.findMany({
      where: {
        extracurricular_id: extracurricularId,
        deleted_at: null,
        date: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate),
        },
      },
      select: {
        date: true,
        schedule_id: true,
      },
    });

    // Create a set of existing session keys for quick lookup
    const existingKeys = new Set(
      existingSessions.map(
        (s) => `${format(s.date, "yyyy-MM-dd")}_${s.schedule_id}`
      )
    );

    // Generate sessions for each day in the range
    const sessionsToCreate: {
      extracurricular_id: string;
      schedule_id: string;
      date: Date;
      start_time: string;
      end_time: string;
      location: string;
    }[] = [];

    let currentDate = startOfDay(startDate);
    const end = endOfDay(endDate);

    while (currentDate <= end) {
      const dayOfWeek = getDay(currentDate);

      // Find schedules that match this day
      for (const schedule of schedules) {
        const scheduleDayNum = DAY_MAP[schedule.day_of_week];

        if (scheduleDayNum === dayOfWeek) {
          const key = `${format(currentDate, "yyyy-MM-dd")}_${schedule.id}`;

          // Skip if session already exists
          if (!existingKeys.has(key)) {
            sessionsToCreate.push({
              extracurricular_id: extracurricularId,
              schedule_id: schedule.id,
              date: currentDate,
              start_time: schedule.start_time,
              end_time: schedule.end_time,
              location: schedule.location,
            });
          }
        }
      }

      currentDate = addDays(currentDate, 1);
    }

    if (sessionsToCreate.length === 0) {
      return {
        success: true,
        count: 0,
        error: "Semua pertemuan dalam rentang tanggal sudah ada.",
      };
    }

    // Bulk create sessions
    await prisma.session.createMany({
      data: sessionsToCreate,
    });

    revalidatePath(`/pembina/ekstrakurikuler/${extracurricularId}/sessions`);
    revalidatePath(`/pembina/ekstrakurikuler/${extracurricularId}`);

    return { success: true, count: sessionsToCreate.length };
  } catch (error) {
    console.error("Failed to generate sessions:", error);
    return { success: false, count: 0, error: "Gagal generate pertemuan" };
  }
}

/**
 * Delete a session (only if no attendance exists).
 */
export async function deleteSession(
  sessionId: string,
  extracurricularId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const canDelete = await canDeleteSession(sessionId);
    if (!canDelete) {
      return {
        success: false,
        error: "Tidak dapat menghapus pertemuan yang sudah memiliki absensi",
      };
    }

    // Hardening: Use Soft Delete
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        deleted_at: new Date(),
      },
    });

    revalidatePath(`/pembina/ekstrakurikuler/${extracurricularId}/sessions`);
    revalidatePath(`/pembina/ekstrakurikuler/${extracurricularId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to delete session:", error);
    return { success: false, error: "Gagal menghapus pertemuan" };
  }
}
