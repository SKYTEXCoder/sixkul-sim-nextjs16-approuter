/**
 * PEMBINA Announcement Data Layer
 *
 * Server-side data fetching and mutations for announcements.
 *
 * CONSTRAINTS:
 * - Announcements scoped to extracurricular
 * - Author-only edit/delete
 * - Visible only to enrolled students
 *
 * @module lib/pembina-announcement-data
 */

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ============================================
// Type Definitions
// ============================================

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  authorId: string;
  authorName: string;
}

export interface CreateAnnouncementInput {
  title: string;
  content: string;
}

export interface UpdateAnnouncementInput {
  title?: string;
  content?: string;
}

// ============================================
// Data Fetching Functions
// ============================================

/**
 * Get all announcements for an extracurricular.
 */
export async function getAnnouncementsByExtracurricular(
  extracurricularId: string
): Promise<Announcement[]> {
  const announcements = await prisma.announcement.findMany({
    where: {
      extracurricular_id: extracurricularId,
      scope: "EXTRACURRICULAR",
    },
    include: {
      author: {
        select: {
          id: true,
          full_name: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return announcements.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    createdAt: a.created_at,
    authorId: a.author_id,
    authorName: a.author.full_name,
  }));
}

// ============================================
// Mutation Functions
// ============================================

/**
 * Create a new announcement.
 */
export async function createAnnouncement(
  extracurricularId: string,
  authorUserId: string,
  data: CreateAnnouncementInput
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the User record from clerk_id
    const user = await prisma.user.findUnique({
      where: { clerk_id: authorUserId },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: "User tidak ditemukan" };
    }

    await prisma.announcement.create({
      data: {
        extracurricular_id: extracurricularId,
        author_id: user.id,
        title: data.title,
        content: data.content,
      },
    });

    revalidatePath(
      `/pembina/ekstrakurikuler/${extracurricularId}/announcements`
    );
    revalidatePath(`/pembina/ekstrakurikuler/${extracurricularId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to create announcement:", error);
    return { success: false, error: "Gagal membuat pengumuman" };
  }
}

/**
 * Update an announcement.
 * Only the author can update.
 */
export async function updateAnnouncement(
  announcementId: string,
  authorUserId: string,
  extracurricularId: string,
  data: UpdateAnnouncementInput
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the User record from clerk_id
    const user = await prisma.user.findUnique({
      where: { clerk_id: authorUserId },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: "User tidak ditemukan" };
    }

    // Verify ownership
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!announcement) {
      return { success: false, error: "Pengumuman tidak ditemukan" };
    }

    if (announcement.author_id !== user.id) {
      return {
        success: false,
        error: "Anda tidak memiliki akses untuk mengedit",
      };
    }

    await prisma.announcement.update({
      where: { id: announcementId },
      data: {
        title: data.title,
        content: data.content,
      },
    });

    revalidatePath(
      `/pembina/ekstrakurikuler/${extracurricularId}/announcements`
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to update announcement:", error);
    return { success: false, error: "Gagal mengupdate pengumuman" };
  }
}

/**
 * Delete an announcement.
 * Only the author can delete.
 */
export async function deleteAnnouncement(
  announcementId: string,
  authorUserId: string,
  extracurricularId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the User record from clerk_id
    const user = await prisma.user.findUnique({
      where: { clerk_id: authorUserId },
      select: { id: true },
    });

    if (!user) {
      return { success: false, error: "User tidak ditemukan" };
    }

    // Verify ownership
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!announcement) {
      return { success: false, error: "Pengumuman tidak ditemukan" };
    }

    if (announcement.author_id !== user.id) {
      return {
        success: false,
        error: "Anda tidak memiliki akses untuk menghapus",
      };
    }

    await prisma.announcement.delete({
      where: { id: announcementId },
    });

    revalidatePath(
      `/pembina/ekstrakurikuler/${extracurricularId}/announcements`
    );
    revalidatePath(`/pembina/ekstrakurikuler/${extracurricularId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to delete announcement:", error);
    return { success: false, error: "Gagal menghapus pengumuman" };
  }
}
