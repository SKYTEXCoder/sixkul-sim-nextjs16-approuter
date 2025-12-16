/**
 * PEMBINA Enrollment Data Layer
 *
 * Server-side data fetching and mutations for enrollment approval.
 *
 * CONSTRAINTS:
 * - No bulk approval
 * - No auto-approval
 * - One-by-one approval/rejection only
 *
 * @module lib/pembina-enrollment-data
 */

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ============================================
// Type Definitions
// ============================================

export interface PendingEnrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentNis: string;
  requestedAt: Date;
}

// ============================================
// Data Fetching Functions
// ============================================

/**
 * Get all PENDING enrollments for an extracurricular.
 */
export async function getPendingEnrollments(
  extracurricularId: string,
): Promise<PendingEnrollment[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      extracurricular_id: extracurricularId,
      status: "PENDING",
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
      joined_at: "asc",
    },
  });

  return enrollments.map((e) => ({
    id: e.id,
    studentId: e.student.id,
    studentName: e.student.user.full_name,
    studentClass: e.student.class_name,
    studentNis: e.student.nis,
    requestedAt: e.joined_at,
  }));
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Approve a single enrollment (PENDING -> ACTIVE).
 * No bulk approval allowed.
 */
export async function approveEnrollment(
  enrollmentId: string,
  extracurricularId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify enrollment exists and is PENDING
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        extracurricular: true,
      },
    });

    if (!enrollment) {
      return { success: false, error: "Pendaftaran tidak ditemukan" };
    }

    if (enrollment.status !== "PENDING") {
      return { success: false, error: "Pendaftaran bukan status PENDING" };
    }

    // Update enrollment status
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: "ACTIVE" },
    });

    // Create notification for the student
    await prisma.notification.create({
      data: {
        user_id: enrollment.student.user_id,
        enrollment_id: enrollmentId,
        type: "ENROLLMENT",
        title: "Pendaftaran Disetujui",
        message: `Selamat! Pendaftaran Anda ke ${enrollment.extracurricular.name} telah disetujui. Anda sekarang menjadi anggota aktif.`,
      },
    });

    revalidatePath(`/pembina/ekstrakurikuler/${extracurricularId}`);
    revalidatePath(`/pembina/ekstrakurikuler/${extracurricularId}/enrollments`);

    return { success: true };
  } catch (error) {
    console.error("Failed to approve enrollment:", error);
    return { success: false, error: "Gagal menyetujui pendaftaran" };
  }
}

/**
 * Reject a single enrollment (PENDING -> REJECTED).
 * No bulk rejection allowed.
 */
export async function rejectEnrollment(
  enrollmentId: string,
  extracurricularId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify enrollment exists and is PENDING
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        extracurricular: true,
      },
    });

    if (!enrollment) {
      return { success: false, error: "Pendaftaran tidak ditemukan" };
    }

    if (enrollment.status !== "PENDING") {
      return { success: false, error: "Pendaftaran bukan status PENDING" };
    }

    // Update enrollment status
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: "REJECTED" },
    });

    // Create notification for the student
    await prisma.notification.create({
      data: {
        user_id: enrollment.student.user_id,
        enrollment_id: enrollmentId,
        type: "ENROLLMENT",
        title: "Pendaftaran Ditolak",
        message: `Maaf, pendaftaran Anda ke ${enrollment.extracurricular.name} tidak dapat disetujui. Silakan hubungi pembina untuk informasi lebih lanjut.`,
      },
    });

    revalidatePath(`/pembina/ekstrakurikuler/${extracurricularId}`);
    revalidatePath(`/pembina/ekstrakurikuler/${extracurricularId}/enrollments`);

    return { success: true };
  } catch (error) {
    console.error("Failed to reject enrollment:", error);
    return { success: false, error: "Gagal menolak pendaftaran" };
  }
}
