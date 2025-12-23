/**
 * Notification Trigger System — Internal Hooks
 *
 * These functions create notifications for students based on system events.
 * Each trigger respects StudentPreferences gating (except enrollment status).
 *
 * INTEGRATION POINTS:
 * - createAttendanceNotification: Integrated into /api/attendance/batch
 * - createAnnouncementNotifications: For future PEMBINA announcement creation
 * - createScheduleNotifications: For future PEMBINA session management
 * - createEnrollmentStatusNotification: For future PEMBINA enrollment approval
 *
 * @module lib/notification-triggers
 */

import prisma from "@/lib/prisma";
import { NotificationType } from "@/generated/prisma";

// ============================================
// Helper Functions
// ============================================

/**
 * Get student preferences for notification gating.
 * Returns default preferences (all enabled) if no preferences exist.
 */
async function getStudentPreferencesForEnrollment(
  enrollmentId: string
): Promise<{
  notifyAnnouncements: boolean;
  notifyScheduleChanges: boolean;
  notifyAttendance: boolean;
} | null> {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: {
          include: {
            preferences: true,
          },
        },
      },
    });

    if (!enrollment) {
      return null;
    }

    // Return preferences or defaults
    const prefs = enrollment.student.preferences;
    return {
      notifyAnnouncements: prefs?.notify_announcements ?? true,
      notifyScheduleChanges: prefs?.notify_schedule_changes ?? true,
      notifyAttendance: prefs?.notify_attendance ?? true,
    };
  } catch (error) {
    console.error("[GET STUDENT PREFERENCES ERROR]", error);
    return null;
  }
}

/**
 * Get user ID from enrollment for notification creation.
 */
async function getUserIdFromEnrollment(
  enrollmentId: string
): Promise<string | null> {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: {
          include: {
            user: { select: { id: true } },
          },
        },
      },
    });

    return enrollment?.student?.user?.id ?? null;
  } catch (error) {
    console.error("[GET USER ID ERROR]", error);
    return null;
  }
}

// ============================================
// Trigger Functions
// ============================================

/**
 * Creates notification for enrollment owner when attendance is recorded.
 *
 * Gated by: StudentPreferences.notify_attendance
 *
 * @param enrollmentId - The enrollment ID
 * @param status - Attendance status (PRESENT, SICK, PERMISSION, ALPHA, LATE)
 * @param sessionDate - Date of the session
 * @param extracurricularName - Name of the extracurricular for message
 *
 * INTEGRATION: Called from /api/attendance/batch after attendance is saved
 */
export async function createAttendanceNotification(
  enrollmentId: string,
  status: string,
  sessionDate: Date,
  extracurricularName: string
): Promise<void> {
  try {
    // Check preferences
    const prefs = await getStudentPreferencesForEnrollment(enrollmentId);
    if (!prefs || !prefs.notifyAttendance) {
      console.log(
        `[NOTIFICATION] Skipped attendance notification - disabled by preferences`
      );
      return;
    }

    // Get user ID
    const userId = await getUserIdFromEnrollment(enrollmentId);
    if (!userId) {
      console.error(
        `[NOTIFICATION] Cannot create attendance notification - user not found`
      );
      return;
    }

    // Format date for message
    const formattedDate = sessionDate.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Map status to Indonesian
    const statusMap: Record<string, string> = {
      PRESENT: "Hadir",
      SICK: "Sakit",
      PERMISSION: "Izin",
      ALPHA: "Tidak Hadir (Alpha)",
      LATE: "Terlambat",
    };
    const statusLabel = statusMap[status] || status;

    // Create notification
    await prisma.notification.create({
      data: {
        user_id: userId,
        enrollment_id: enrollmentId,
        type: NotificationType.ATTENDANCE,
        title: `Absensi Tercatat — ${extracurricularName}`,
        message: `Kehadiran Anda pada ${formattedDate} telah dicatat sebagai: ${statusLabel}`,
      },
    });

    console.log(
      `[NOTIFICATION] Attendance notification created for enrollment ${enrollmentId}`
    );
  } catch (error) {
    console.error("[CREATE ATTENDANCE NOTIFICATION ERROR]", error);
  }
}

/**
 * Creates notifications for all ACTIVE enrollees when announcement is published.
 *
 * Gated by: StudentPreferences.notify_announcements (per student)
 *
 * @param extracurricularId - The extracurricular ID
 * @param announcementTitle - Title of the announcement
 * @param extracurricularName - Name of the extracurricular for message
 *
 * INTEGRATION: Call from PEMBINA announcement creation endpoint (future)
 */
export async function createAnnouncementNotifications(
  extracurricularId: string,
  announcementTitle: string,
  extracurricularName: string
): Promise<void> {
  try {
    // Get all ACTIVE enrollments for this extracurricular
    const enrollments = await prisma.enrollment.findMany({
      where: {
        extracurricular_id: extracurricularId,
        status: "ACTIVE",
      },
      include: {
        student: {
          include: {
            user: { select: { id: true } },
            preferences: true,
          },
        },
      },
    });

    // Filter by preferences and create notifications
    const notificationsToCreate = enrollments
      .filter((e) => {
        const prefs = e.student.preferences;
        return prefs?.notify_announcements ?? true; // Default: enabled
      })
      .map((e) => ({
        user_id: e.student.user.id,
        enrollment_id: e.id,
        type: NotificationType.ANNOUNCEMENT,
        title: `Pengumuman Baru — ${extracurricularName}`,
        message: announcementTitle,
      }));

    if (notificationsToCreate.length > 0) {
      await prisma.notification.createMany({
        data: notificationsToCreate,
      });
      console.log(
        `[NOTIFICATION] Created ${notificationsToCreate.length} announcement notifications`
      );
    }
  } catch (error) {
    console.error("[CREATE ANNOUNCEMENT NOTIFICATIONS ERROR]", error);
  }
}

/**
 * Creates notifications for all ACTIVE enrollees when session changes.
 *
 * Gated by: StudentPreferences.notify_schedule_changes (per student)
 *
 * @param extracurricularId - The extracurricular ID
 * @param changeType - Type of change: 'created' | 'updated' | 'cancelled'
 * @param sessionDate - Date of the session
 * @param extracurricularName - Name of the extracurricular for message
 *
 * INTEGRATION: Call from PEMBINA session management endpoints (future)
 */
export async function createScheduleNotifications(
  extracurricularId: string,
  changeType: "created" | "updated" | "cancelled",
  sessionDate: Date,
  extracurricularName: string
): Promise<void> {
  try {
    // Get all ACTIVE enrollments for this extracurricular
    const enrollments = await prisma.enrollment.findMany({
      where: {
        extracurricular_id: extracurricularId,
        status: "ACTIVE",
      },
      include: {
        student: {
          include: {
            user: { select: { id: true } },
            preferences: true,
          },
        },
      },
    });

    // Format date for message
    const formattedDate = sessionDate.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Build title and message based on change type
    const titleMap: Record<string, string> = {
      created: `Jadwal Baru — ${extracurricularName}`,
      updated: `Perubahan Jadwal — ${extracurricularName}`,
      cancelled: `Jadwal Dibatalkan — ${extracurricularName}`,
    };

    const messageMap: Record<string, string> = {
      created: `Sesi baru telah dijadwalkan untuk ${formattedDate}`,
      updated: `Jadwal sesi pada ${formattedDate} telah diperbarui`,
      cancelled: `Sesi pada ${formattedDate} telah dibatalkan`,
    };

    // Filter by preferences and create notifications
    const notificationsToCreate = enrollments
      .filter((e) => {
        const prefs = e.student.preferences;
        return prefs?.notify_schedule_changes ?? true; // Default: enabled
      })
      .map((e) => ({
        user_id: e.student.user.id,
        enrollment_id: e.id,
        type: NotificationType.SCHEDULE,
        title: titleMap[changeType],
        message: messageMap[changeType],
      }));

    if (notificationsToCreate.length > 0) {
      await prisma.notification.createMany({
        data: notificationsToCreate,
      });
      console.log(
        `[NOTIFICATION] Created ${notificationsToCreate.length} schedule notifications`
      );
    }
  } catch (error) {
    console.error("[CREATE SCHEDULE NOTIFICATIONS ERROR]", error);
  }
}

/**
 * Creates notification when enrollment status changes.
 *
 * NOT gated by preferences — always notifies.
 *
 * @param enrollmentId - The enrollment ID
 * @param oldStatus - Previous enrollment status
 * @param newStatus - New enrollment status
 * @param extracurricularName - Name of the extracurricular for message
 *
 * INTEGRATION: Call from PEMBINA enrollment approval endpoint (future)
 */
export async function createEnrollmentStatusNotification(
  enrollmentId: string,
  oldStatus: string,
  newStatus: string,
  extracurricularName: string
): Promise<void> {
  try {
    // Get user ID (NOT gated by preferences)
    const userId = await getUserIdFromEnrollment(enrollmentId);
    if (!userId) {
      console.error(
        `[NOTIFICATION] Cannot create enrollment notification - user not found`
      );
      return;
    }

    // Build title and message based on status transition
    let title: string;
    let message: string;

    switch (newStatus) {
      case "ACTIVE":
        title = `Pendaftaran Diterima — ${extracurricularName}`;
        message = `Selamat! Pendaftaran Anda di ${extracurricularName} telah disetujui.`;
        break;
      case "REJECTED":
        title = `Pendaftaran Ditolak — ${extracurricularName}`;
        message = `Maaf, pendaftaran Anda di ${extracurricularName} tidak disetujui.`;
        break;
      case "ALUMNI":
        title = `Status Alumni — ${extracurricularName}`;
        message = `Status keanggotaan Anda di ${extracurricularName} telah berubah menjadi Alumni.`;
        break;
      case "CANCELLED":
        title = `Keanggotaan Dibatalkan — ${extracurricularName}`;
        message = `Keanggotaan Anda di ${extracurricularName} telah dibatalkan.`;
        break;
      default:
        title = `Perubahan Status — ${extracurricularName}`;
        message = `Status keanggotaan Anda di ${extracurricularName} telah berubah dari ${oldStatus} menjadi ${newStatus}.`;
    }

    // Create notification
    await prisma.notification.create({
      data: {
        user_id: userId,
        enrollment_id: enrollmentId,
        type: NotificationType.ENROLLMENT,
        title,
        message,
      },
    });

    console.log(
      `[NOTIFICATION] Enrollment status notification created for ${enrollmentId}: ${oldStatus} → ${newStatus}`
    );
  } catch (error) {
    console.error("[CREATE ENROLLMENT STATUS NOTIFICATION ERROR]", error);
  }
}

/**
 * Creates notification for PEMBINA when a new student enrolls.
 *
 * @param enrollmentId - The ID of the new enrollment
 * @param extracurricularId - The extracurricular ID
 * @param studentName - Name of the student
 *
 * INTEGRATION: Call from STUDENT enrollment creation endpoint
 */
export async function createPembinaEnrollmentNotification(
  enrollmentId: string,
  extracurricularId: string,
  studentName: string
): Promise<void> {
  try {
    // 1. Get the Extra and its Pembina
    const extra = await prisma.extracurricular.findUnique({
      where: { id: extracurricularId },
      include: {
        pembina: {
          include: {
            user: { select: { id: true } },
          },
        },
      },
    });

    if (!extra || !extra.pembina?.user?.id) {
      console.error(
        `[NOTIFICATION] Cannot notify Pembina - Extra or Pembina user not found for ${extracurricularId}`
      );
      return;
    }

    // 2. Create Notification for Pembina
    await prisma.notification.create({
      data: {
        user_id: extra.pembina.user.id,
        enrollment_id: enrollmentId, // Link to the enrollment so they can review it
        type: NotificationType.ENROLLMENT,
        title: `Pendaftaran Baru — ${extra.name}`,
        message: `Siswa ${studentName} mengajukan pendaftaran baru untuk ${extra.name}.`,
      },
    });

    console.log(
      `[NOTIFICATION] Pembina notification created for new enrollment in ${extra.name}`
    );
  } catch (error) {
    console.error("[CREATE PEMBINA ENROLLMENT NOTIFICATION ERROR]", error);
  }
}
