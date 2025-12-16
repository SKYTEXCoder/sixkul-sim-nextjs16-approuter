/**
 * PEMBINA Attendance Data Layer
 *
 * Server-side data fetching and mutations for SESSION-BASED attendance.
 *
 * CRITICAL: This is the ONLY valid attendance implementation.
 * - Attendance MUST be tied to a session_id
 * - No schedule-based attendance selection
 * - No hybrid logic
 *
 * @module lib/pembina-attendance-data
 */

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ============================================
// Type Definitions
// ============================================

export interface EnrollmentWithStudent {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentNis: string;
}

export interface AttendanceRecord {
  enrollmentId: string;
  status: "PRESENT" | "SICK" | "PERMISSION" | "ALPHA" | "LATE";
  notes: string | null;
}

export interface SessionForAttendance {
  id: string;
  date: Date;
  start_time: string;
  end_time: string;
  location: string;
  hasAttendance: boolean;
}

export interface AttendanceInput {
  enrollmentId: string;
  status: "PRESENT" | "SICK" | "PERMISSION" | "ALPHA" | "LATE";
  notes?: string;
}

// ============================================
// Data Fetching Functions
// ============================================

/**
 * Get sessions available for attendance input.
 */
export async function getSessionsForAttendance(
  extracurricularId: string,
): Promise<SessionForAttendance[]> {
  const sessions = await prisma.session.findMany({
    where: {
      extracurricular_id: extracurricularId,
      is_cancelled: false,
    },
    include: {
      _count: {
        select: {
          attendances: true,
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
    hasAttendance: session._count.attendances > 0,
  }));
}

/**
 * Get ACTIVE enrollments for an extracurricular.
 */
export async function getActiveEnrollments(
  extracurricularId: string,
): Promise<EnrollmentWithStudent[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      extracurricular_id: extracurricularId,
      status: "ACTIVE",
    },
    include: {
      student: {
        include: {
          user: {
            select: {
              full_name: true,
            },
          },
        },
      },
    },
    orderBy: {
      student: {
        class_name: "asc",
      },
    },
  });

  return enrollments.map((enrollment) => ({
    enrollmentId: enrollment.id,
    studentId: enrollment.student.id,
    studentName: enrollment.student.user.full_name,
    studentClass: enrollment.student.class_name,
    studentNis: enrollment.student.nis,
  }));
}

/**
 * Get existing attendance records for a session.
 */
export async function getAttendanceBySession(
  sessionId: string,
): Promise<AttendanceRecord[]> {
  const attendances = await prisma.attendance.findMany({
    where: {
      session_id: sessionId,
    },
  });

  return attendances.map((att) => ({
    enrollmentId: att.enrollment_id,
    status: att.status,
    notes: att.notes,
  }));
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Save attendance for a session.
 * CRITICAL: session_id is REQUIRED, not optional.
 */
export async function saveSessionAttendance(
  sessionId: string,
  extracurricularId: string,
  records: AttendanceInput[],
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { id: true, date: true },
    });

    if (!session) {
      return { success: false, error: "Pertemuan tidak ditemukan" };
    }

    // Use transaction for atomic updates
    await prisma.$transaction(async (tx) => {
      for (const record of records) {
        // Upsert attendance - use enrollment_id + date as unique constraint
        await tx.attendance.upsert({
          where: {
            enrollment_id_date: {
              enrollment_id: record.enrollmentId,
              date: session.date,
            },
          },
          create: {
            enrollment_id: record.enrollmentId,
            session_id: sessionId, // REQUIRED - session-based
            date: session.date,
            status: record.status,
            notes: record.notes || null,
          },
          update: {
            session_id: sessionId, // Always update to session-based
            status: record.status,
            notes: record.notes || null,
          },
        });
      }
    });

    revalidatePath(`/pembina/ekstrakurikuler/${extracurricularId}/attendance`);
    revalidatePath(`/pembina/ekstrakurikuler/${extracurricularId}/sessions`);

    return { success: true };
  } catch (error) {
    console.error("Failed to save attendance:", error);
    return { success: false, error: "Gagal menyimpan absensi" };
  }
}
