"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import {
  adminAnnouncementSchema,
  AdminAnnouncementInput,
  AnnouncementScope,
} from "@/lib/schemas/admin-announcement-schema";

export type ActionState = {
  success: boolean;
  error?: string;
};

// Helper: Validate Admin Role
// Private function to ensure only admins can perform mutations
async function validateAdminRole(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { clerk_id: userId },
    select: { role: true },
  });

  return user?.role === "ADMIN";
}

/**
 * Get all SYSTEM announcements sorted by created_at DESC
 */
export async function getSystemAnnouncements() {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        scope: AnnouncementScope.SYSTEM, // Use strict scope from schema/prisma
      },
      include: {
        author: {
          select: {
            full_name: true,
            username: true,
          },
        },
      },
      orderBy: {
        created_at: "desc", // STRICT sorting requirement
      },
    });

    return announcements;
  } catch (error) {
    console.error("[GET_SYSTEM_ANNOUNCEMENTS_ERROR]", error);
    return [];
  }
}

/**
 * Get a single SYSTEM announcement by ID
 */
export async function getSystemAnnouncementById(id: string) {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        author: {
          select: { full_name: true, username: true },
        },
      },
    });

    // Ensure it is actually a SYSTEM announcement
    if (announcement && announcement.scope !== AnnouncementScope.SYSTEM) {
      return null;
    }

    return announcement;
  } catch (error) {
    console.error("[GET_SYSTEM_ANNOUNCEMENT_BY_ID_ERROR]", error);
    return null;
  }
}

/**
 * Create a new SYSTEM announcement
 */
export async function createSystemAnnouncement(
  data: AdminAnnouncementInput
): Promise<ActionState> {
  const isAdmin = await validateAdminRole();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized: Admin role required" };
  }

  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not authenticated" };

  const parsed = adminAnnouncementSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed: " + parsed.error.issues[0].message,
    };
  }

  try {
    // Need internal user ID for author_id
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      select: { id: true },
    });

    if (!user) return { success: false, error: "User profile not found" };

    await prisma.announcement.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        scope: AnnouncementScope.SYSTEM,
        author_id: user.id,
        // extracurricular_id is null
      },
    });

    // Revalidate all consumer paths
    revalidatePath("/admin/announcements");
    revalidatePath("/pembina/announcements");
    revalidatePath("/student/announcements");
    revalidatePath("/admin/dashboard"); // In case it's shown on dashboard
    revalidatePath("/pembina/dashboard");
    revalidatePath("/student/dashboard");

    return { success: true };
  } catch (error) {
    console.error("[CREATE_ANNOUNCEMENT_ERROR]", error);
    return { success: false, error: "Failed to create announcement" };
  }
}

/**
 * Update an existing SYSTEM announcement
 */
export async function updateSystemAnnouncement(
  id: string,
  data: AdminAnnouncementInput
): Promise<ActionState> {
  const isAdmin = await validateAdminRole();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized: Admin role required" };
  }

  const parsed = adminAnnouncementSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed: " + parsed.error.issues[0].message,
    };
  }

  try {
    // Verify existing announcement
    const existing = await prisma.announcement.findUnique({
      where: { id },
      select: { scope: true },
    });

    if (!existing) return { success: false, error: "Announcement not found" };
    if (existing.scope !== AnnouncementScope.SYSTEM) {
      return {
        success: false,
        error: "Cannot edit non-system announcements here",
      };
    }

    await prisma.announcement.update({
      where: { id },
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        // Scope remains SYSTEM
      },
    });

    // Revalidate
    revalidatePath("/admin/announcements");
    revalidatePath("/pembina/announcements");
    revalidatePath("/student/announcements");
    revalidatePath(`/admin/announcements/${id}`);
    revalidatePath(`/pembina/announcements/${id}`);
    revalidatePath(`/student/announcements/${id}`);

    return { success: true };
  } catch (error) {
    console.error("[UPDATE_ANNOUNCEMENT_ERROR]", error);
    return { success: false, error: "Failed to update announcement" };
  }
}

/**
 * Delete a SYSTEM announcement
 */
export async function deleteSystemAnnouncement(
  id: string
): Promise<ActionState> {
  const isAdmin = await validateAdminRole();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized: Admin role required" };
  }

  try {
    const existing = await prisma.announcement.findUnique({
      where: { id },
      select: { scope: true },
    });

    if (!existing) return { success: false, error: "Announcement not found" };
    if (existing.scope !== AnnouncementScope.SYSTEM) {
      return {
        success: false,
        error: "Cannot delete non-system announcements here",
      };
    }

    await prisma.announcement.delete({
      where: { id },
    });

    // Revalidate
    revalidatePath("/admin/announcements");
    revalidatePath("/pembina/announcements");
    revalidatePath("/student/announcements");
    revalidatePath("/admin/dashboard");
    revalidatePath("/pembina/dashboard");
    revalidatePath("/student/dashboard");

    return { success: true };
  } catch (error) {
    console.error("[DELETE_ANNOUNCEMENT_ERROR]", error);
    return { success: false, error: "Failed to delete announcement" };
  }
}
