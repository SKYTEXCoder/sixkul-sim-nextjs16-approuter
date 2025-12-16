"use server";

/**
 * PEMBINA Announcement Server Actions
 *
 * Server actions for announcement CRUD.
 *
 * @module app/(dashboard)/pembina/ekstrakurikuler/[id]/announcements/actions
 */

import { auth } from "@clerk/nextjs/server";
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "@/lib/pembina-announcement-data";
import { validatePembinaOwnership } from "@/lib/pembina-ekstrakurikuler-data";

// ============================================
// Server Actions
// ============================================

export async function createAnnouncementAction(
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

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  if (!title || !content) {
    return { success: false, error: "Judul dan konten harus diisi" };
  }

  return createAnnouncement(extracurricularId, userId, { title, content });
}

export async function updateAnnouncementAction(
  announcementId: string,
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

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  return updateAnnouncement(announcementId, userId, extracurricularId, {
    title,
    content,
  });
}

export async function deleteAnnouncementAction(
  announcementId: string,
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

  return deleteAnnouncement(announcementId, userId, extracurricularId);
}
