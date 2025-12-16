/**
 * Server-side data layer for PEMBINA Notifications
 *
 * Uses Prisma directly to fetch notifications for the current PEMBINA user.
 * Includes Server Actions for marking notifications as read.
 * Route derivation via enrollment → extracurricular (Option A).
 *
 * @module lib/pembina-notification-data
 */

"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NotificationType } from "@/generated/prisma";

// ============================================
// Types
// ============================================

export interface PembinaNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  // Routing context (derived via Option A)
  extracurricularId: string | null;
  extracurricularName: string | null;
  enrollmentId: string | null;
}

export interface NotificationsResult {
  success: boolean;
  data?: {
    notifications: PembinaNotification[];
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
 * Fetch all notifications for the current PEMBINA user.
 *
 * - Authenticates via Clerk
 * - Enforces PEMBINA role
 * - Queries only notifications owned by the user
 * - Derives extracurricular context via enrollment relation
 * - Orders by created_at DESC (newest first)
 */
export async function getPembinaNotifications(): Promise<NotificationsResult> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Autentikasi diperlukan. Silakan login.",
        errorCode: "UNAUTHORIZED",
      };
    }

    // Verify PEMBINA role
    const userRole = (sessionClaims?.public_metadata as { role?: string })
      ?.role;

    if (userRole !== "PEMBINA") {
      return {
        success: false,
        error: "Akses ditolak. Halaman ini hanya untuk pembina.",
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

    // Fetch notifications with enrollment → extracurricular context (Option A)
    const notifications = await prisma.notification.findMany({
      where: { user_id: user.id },
      include: {
        enrollment: {
          include: {
            extracurricular: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Count unread
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    // Map to view model with derived routing context
    const notificationViewModels: PembinaNotification[] = notifications.map(
      (n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.is_read,
        createdAt: n.created_at,
        enrollmentId: n.enrollment_id,
        // Derive extracurricular context via enrollment (Option A)
        extracurricularId: n.enrollment?.extracurricular?.id ?? null,
        extracurricularName: n.enrollment?.extracurricular?.name ?? null,
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
    console.error("[PEMBINA NOTIFICATION DATA ERROR]", error);
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
export async function getPembinaUnreadCount(): Promise<number> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return 0;
    }

    // Only for PEMBINA role
    const userRole = (sessionClaims?.public_metadata as { role?: string })
      ?.role;

    if (userRole !== "PEMBINA") {
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
    console.error("[PEMBINA NOTIFICATION COUNT ERROR]", error);
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
export async function markPembinaNotificationAsRead(
  notificationId: string
): Promise<ActionResult> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return { success: false, error: "Autentikasi diperlukan." };
    }

    const userRole = (sessionClaims?.public_metadata as { role?: string })
      ?.role;

    if (userRole !== "PEMBINA") {
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
    revalidatePath("/pembina");

    return { success: true };
  } catch (error) {
    console.error("[MARK PEMBINA NOTIFICATION READ ERROR]", error);
    return { success: false, error: "Gagal menandai notifikasi." };
  }
}

/**
 * Mark all notifications as read for the current PEMBINA user.
 * Server Action with revalidatePath for UI refresh.
 */
export async function markAllPembinaNotificationsAsRead(): Promise<ActionResult> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return { success: false, error: "Autentikasi diperlukan." };
    }

    const userRole = (sessionClaims?.public_metadata as { role?: string })
      ?.role;

    if (userRole !== "PEMBINA") {
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
    revalidatePath("/pembina");

    return { success: true };
  } catch (error) {
    console.error("[MARK ALL PEMBINA NOTIFICATIONS READ ERROR]", error);
    return { success: false, error: "Gagal menandai semua notifikasi." };
  }
}
