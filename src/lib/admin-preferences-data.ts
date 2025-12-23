/**
 * Server-side data layer for Admin Preferences
 *
 * Uses Prisma directly with atomic upsert.
 */

"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// ============================================
// Types
// ============================================

export interface AdminPreferencesViewModel {
  id: string;
  theme: "light" | "dark" | "system";
}

export interface PreferencesResult {
  success: boolean;
  data?: AdminPreferencesViewModel;
  error?: string;
  errorCode?: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "SERVER_ERROR";
}

// ============================================
// Default Values
// ============================================

const DEFAULT_PREFERENCES = {
  theme: "system",
};

// ============================================
// Data Fetching
// ============================================

/**
 * Get Admin preferences - ALWAYS returns valid preferences.
 * Creates defaults atomically if none exist (upsert pattern).
 * STRICT: Only ADMIN role.
 */
export async function getAdminPreferences(): Promise<PreferencesResult> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Authentication required.",
        errorCode: "UNAUTHORIZED",
      };
    }

    // Verify ADMIN claims
    const userRole = (sessionClaims?.public_metadata as { role?: string })
      ?.role;

    if (userRole !== "ADMIN") {
      return {
        success: false,
        error: "Access denied. Admin only.",
        errorCode: "FORBIDDEN",
      };
    }

    // Get internal user ID
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      select: { id: true },
    });

    if (!user) {
      return {
        success: false,
        error: "User profile not found.",
        errorCode: "NOT_FOUND",
      };
    }

    // Atomic Upsert
    const preferences = await prisma.adminPreferences.upsert({
      where: { user_id: user.id },
      update: {}, // No-op if exists
      create: {
        user_id: user.id,
        ...DEFAULT_PREFERENCES,
      },
    });

    return {
      success: true,
      data: {
        id: preferences.id,
        theme: preferences.theme as "light" | "dark" | "system",
      },
    };
  } catch (error) {
    console.error("[GET ADMIN PREFERENCES ERROR]", error);
    return {
      success: false,
      error: "Failed to fetch preferences.",
      errorCode: "SERVER_ERROR",
    };
  }
}

/**
 * Update Admin preferences.
 */
export async function updateAdminPreferences(
  field: "theme",
  value: string
): Promise<PreferencesResult> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId)
      return {
        success: false,
        error: "Authentication required.",
        errorCode: "UNAUTHORIZED",
      };

    const userRole = (sessionClaims?.public_metadata as { role?: string })
      ?.role;
    if (userRole !== "ADMIN")
      return {
        success: false,
        error: "Access denied.",
        errorCode: "FORBIDDEN",
      };

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      select: { id: true },
    });

    if (!user)
      return {
        success: false,
        error: "User not found.",
        errorCode: "NOT_FOUND",
      };

    if (field !== "theme") {
      return {
        success: false,
        error: "Invalid field",
        errorCode: "SERVER_ERROR",
      };
    }

    const preferences = await prisma.adminPreferences.upsert({
      where: { user_id: user.id },
      update: { theme: value },
      create: {
        user_id: user.id,
        theme: value,
      },
    });

    return {
      success: true,
      data: {
        id: preferences.id,
        theme: preferences.theme as "light" | "dark" | "system",
      },
    };
  } catch (error) {
    console.error("[UPDATE ADMIN PREFERENCES ERROR]", error);
    return {
      success: false,
      error: "Failed to update preferences.",
      errorCode: "SERVER_ERROR",
    };
  }
}
