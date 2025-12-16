/**
 * Server-side data layer for Student Notifications
 *
 * Uses Prisma directly to fetch notifications for the current student.
 * Includes Server Actions for marking notifications as read.
 *
 * @module lib/notification-data
 */

"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NotificationType } from "@/generated/prisma";

// ============================================
// Types
// ============================================

export interface NotificationViewModel {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  enrollmentId: string | null;
  extracurricularName?: string;
}

export interface NotificationsResult {
  success: boolean;
  data?: {
    notifications: NotificationViewModel[];
    unreadCount: number;
  };
  error?: string;
  errorCode?: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "SERVER_ERROR";
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

// ============================================
// Data Fetching Functions
// ============================================

/**
 * Fetch all notifications for the current student.
 *
 * - Authenticates via Clerk
 * - Enforces SISWA role
 * - Queries only notifications owned by the user
 * - Orders by created_at DESC (newest first)
 */
export async function getStudentNotifications(): Promise<NotificationsResult> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Autentikasi diperlukan. Silakan login.",
        errorCode: "UNAUTHORIZED",
      };
    }

    // Verify SISWA role
    const userRole = (sessionClaims?.public_metadata as { role?: string })
      ?.role;

    if (userRole !== "SISWA") {
      return {
        success: false,
        error: "Akses ditolak. Halaman ini hanya untuk siswa.",
        errorCode: "FORBIDDEN",
      };
    }

    // Find the user in our database
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      select: { id: true },
    });

    if (!user) {
      return {
        success: false,
        error: "Profil pengguna tidak ditemukan.",
        errorCode: "NOT_FOUND",
      };
    }

    // Fetch notifications with enrollment context
    const notifications = await prisma.notification.findMany({
      where: { user_id: user.id },
      include: {
        enrollment: {
          include: {
            extracurricular: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Count unread
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    // Map to view model
    const notificationViewModels: NotificationViewModel[] = notifications.map(
      (n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.is_read,
        createdAt: n.created_at,
        enrollmentId: n.enrollment_id,
        extracurricularName: n.enrollment?.extracurricular?.name,
      })
    );

    return {
      success: true,
      data: {
        notifications: notificationViewModels,
        unreadCount,
      },
    };
  } catch (error) {
    console.error("[NOTIFICATION DATA ERROR]", error);
    return {
      success: false,
      error: "Terjadi kesalahan. Silakan coba lagi.",
      errorCode: "SERVER_ERROR",
    };
  }
}

/**
 * Get unread notification count for bell badge.
 * Optimized query that only counts, doesn't fetch all data.
 */
export async function getUnreadNotificationCount(): Promise<number> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return 0;
    }

    // Only for SISWA role
    const userRole = (sessionClaims?.public_metadata as { role?: string })
      ?.role;

    if (userRole !== "SISWA") {
      return 0;
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      select: { id: true },
    });

    if (!user) {
      return 0;
    }

    // Count unread notifications
    const count = await prisma.notification.count({
      where: {
        user_id: user.id,
        is_read: false,
      },
    });

    return count;
  } catch (error) {
    console.error("[NOTIFICATION COUNT ERROR]", error);
    return 0;
  }
}

// ============================================
// Server Actions
// ============================================

/**
 * Mark a single notification as read.
 * Server Action with revalidatePath for UI refresh.
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<ActionResult> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return { success: false, error: "Autentikasi diperlukan." };
    }

    const userRole = (sessionClaims?.public_metadata as { role?: string })
      ?.role;

    if (userRole !== "SISWA") {
      return { success: false, error: "Akses ditolak." };
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    // Update the notification (only if owned by this user)
    const result = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        user_id: user.id, // Security: only update if owned by user
      },
      data: { is_read: true },
    });

    if (result.count === 0) {
      return { success: false, error: "Notifikasi tidak ditemukan." };
    }

    // Revalidate paths for UI refresh
    revalidatePath("/student/notifications");
    revalidatePath("/student"); // For bell badge in layout

    return { success: true };
  } catch (error) {
    console.error("[MARK NOTIFICATION READ ERROR]", error);
    return { success: false, error: "Gagal menandai notifikasi." };
  }
}

/**
 * Mark all notifications as read for the current user.
 * Server Action with revalidatePath for UI refresh.
 */
export async function markAllNotificationsAsRead(): Promise<ActionResult> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return { success: false, error: "Autentikasi diperlukan." };
    }

    const userRole = (sessionClaims?.public_metadata as { role?: string })
      ?.role;

    if (userRole !== "SISWA") {
      return { success: false, error: "Akses ditolak." };
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    // Update all unread notifications for this user
    await prisma.notification.updateMany({
      where: {
        user_id: user.id,
        is_read: false,
      },
      data: { is_read: true },
    });

    // Revalidate paths for UI refresh
    revalidatePath("/student/notifications");
    revalidatePath("/student"); // For bell badge in layout

    return { success: true };
  } catch (error) {
    console.error("[MARK ALL NOTIFICATIONS READ ERROR]", error);
    return { success: false, error: "Gagal menandai semua notifikasi." };
  }
}
