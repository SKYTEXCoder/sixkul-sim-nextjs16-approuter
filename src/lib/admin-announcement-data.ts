/**
 * Server-side data layer for ADMIN System Announcements
 *
 * Handles creation and retrieval of SYSTEM-scoped announcements.
 * Enforces strict ADMIN role validation.
 */

"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// ===================================
// Types
// ===================================

export interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  authorName: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

// ===================================
// Helpers
// ===================================

async function validateAdminRole() {
  const { userId, sessionClaims } = await auth();

  if (!userId) return false;

  const role = (sessionClaims?.public_metadata as { role?: string })?.role;
  return role === "ADMIN";
}

// ===================================
// Data Actions
// ===================================

/**
 * Get all SYSTEM announcements.
 * Accessible by anyone authenticated (or restricted if needed).
 */
export async function getSystemAnnouncements(): Promise<SystemAnnouncement[]> {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        scope: "SYSTEM", // Strict scope check
      },
      include: {
        author: {
          select: { full_name: true, username: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return announcements.map((a: any) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      createdAt: a.created_at,
      authorName: a.author.full_name || a.author.username,
    }));
  } catch (error) {
    console.error("[GET SYSTEM ANNOUNCEMENTS ERROR]", error);
    return [];
  }
}

/**
 * Create a new SYSTEM announcement.
 * STRICT: Only ADMIN can call this.
 */
export async function createSystemAnnouncement(
  title: string,
  content: string
): Promise<ActionResult> {
  const isAdmin = await validateAdminRole();

  if (!isAdmin) {
    return {
      success: false,
      error: "UNAUTHORIZED: Access denied. Admin role required.",
    }; // Explicit failure
  }

  const { userId } = await auth();
  if (!userId) return { success: false, error: "Not authenticated" };

  try {
    // Get internal user ID
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      select: { id: true },
    });

    if (!user) return { success: false, error: "User not found" };

    await prisma.announcement.create({
      data: {
        title,
        content,
        scope: "SYSTEM",
        author_id: user.id,
        // extracurricular_id is implicitly NULL
      },
    });

    revalidatePath("/"); // Global revalidate as system announcements might appear on dashboard
    return { success: true };
  } catch (error) {
    console.error("[CREATE SYSTEM ANNOUNCEMENT ERROR]", error);
    return { success: false, error: "Failed to create announcement" };
  }
}
