/**
 * Server-side data layer for Student Preferences
 *
 * Uses Prisma directly with atomic upsert.
 * Database is the SINGLE SOURCE OF TRUTH - no localStorage/cookies.
 *
 * @module lib/preferences-data
 */

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// ============================================
// Types
// ============================================

export interface StudentPreferencesViewModel {
  id: string;
  theme: "light" | "dark" | "system";
  notifyAnnouncements: boolean;
  notifyScheduleChanges: boolean;
  notifyAttendance: boolean;
  scheduleDefaultView: "date" | "extracurricular";
  scheduleRangeDays: number;
}

export interface PreferencesResult {
  success: boolean;
  data?: StudentPreferencesViewModel;
  error?: string;
  errorCode?: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "SERVER_ERROR";
}

// ============================================
// Default Values
// ============================================

const DEFAULT_PREFERENCES = {
  theme: "system",
  notify_announcements: true,
  notify_schedule_changes: true,
  notify_attendance: true,
  schedule_default_view: "date",
  schedule_range_days: 7,
};

// ============================================
// Data Fetching
// ============================================

/**
 * Get student preferences - ALWAYS returns valid preferences.
 * Creates defaults atomically if none exist (upsert pattern).
 * NEVER returns null or undefined.
 */
export async function getStudentPreferences(): Promise<PreferencesResult> {
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

    // Find student profile
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      include: {
        studentProfile: true,
      },
    });

    if (!user || !user.studentProfile) {
      return {
        success: false,
        error: "Profil siswa tidak ditemukan.",
        errorCode: "NOT_FOUND",
      };
    }

    // Atomic upsert - creates with defaults if not exists
    const preferences = await prisma.studentPreferences.upsert({
      where: { student_id: user.studentProfile.id },
      update: {}, // No update if exists
      create: {
        student_id: user.studentProfile.id,
        ...DEFAULT_PREFERENCES,
      },
    });

    // Map to view model
    const viewModel: StudentPreferencesViewModel = {
      id: preferences.id,
      theme: preferences.theme as "light" | "dark" | "system",
      notifyAnnouncements: preferences.notify_announcements,
      notifyScheduleChanges: preferences.notify_schedule_changes,
      notifyAttendance: preferences.notify_attendance,
      scheduleDefaultView: preferences.schedule_default_view as
        | "date"
        | "extracurricular",
      scheduleRangeDays: preferences.schedule_range_days,
    };

    return {
      success: true,
      data: viewModel,
    };
  } catch (error) {
    console.error("[PREFERENCES DATA ERROR]", error);
    return {
      success: false,
      error: "Terjadi kesalahan. Silakan coba lagi.",
      errorCode: "SERVER_ERROR",
    };
  }
}

// ============================================
// Server Actions
// ============================================

/**
 * Update a single preference field.
 * Returns the updated preferences.
 */
export async function updateStudentPreference(
  field: keyof Omit<StudentPreferencesViewModel, "id">,
  value: string | boolean | number
): Promise<PreferencesResult> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Autentikasi diperlukan.",
        errorCode: "UNAUTHORIZED",
      };
    }

    const userRole = (sessionClaims?.public_metadata as { role?: string })
      ?.role;

    if (userRole !== "SISWA") {
      return {
        success: false,
        error: "Akses ditolak.",
        errorCode: "FORBIDDEN",
      };
    }

    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      include: { studentProfile: true },
    });

    if (!user || !user.studentProfile) {
      return {
        success: false,
        error: "Profil siswa tidak ditemukan.",
        errorCode: "NOT_FOUND",
      };
    }

    // Map view model field to database field
    const fieldMap: Record<string, string> = {
      theme: "theme",
      notifyAnnouncements: "notify_announcements",
      notifyScheduleChanges: "notify_schedule_changes",
      notifyAttendance: "notify_attendance",
      scheduleDefaultView: "schedule_default_view",
      scheduleRangeDays: "schedule_range_days",
    };

    const dbField = fieldMap[field];
    if (!dbField) {
      return {
        success: false,
        error: "Field tidak valid.",
        errorCode: "SERVER_ERROR",
      };
    }

    // Update with upsert to ensure record exists
    const preferences = await prisma.studentPreferences.upsert({
      where: { student_id: user.studentProfile.id },
      update: { [dbField]: value },
      create: {
        student_id: user.studentProfile.id,
        ...DEFAULT_PREFERENCES,
        [dbField]: value,
      },
    });

    const viewModel: StudentPreferencesViewModel = {
      id: preferences.id,
      theme: preferences.theme as "light" | "dark" | "system",
      notifyAnnouncements: preferences.notify_announcements,
      notifyScheduleChanges: preferences.notify_schedule_changes,
      notifyAttendance: preferences.notify_attendance,
      scheduleDefaultView: preferences.schedule_default_view as
        | "date"
        | "extracurricular",
      scheduleRangeDays: preferences.schedule_range_days,
    };

    return {
      success: true,
      data: viewModel,
    };
  } catch (error) {
    console.error("[PREFERENCES UPDATE ERROR]", error);
    return {
      success: false,
      error: "Gagal menyimpan preferensi.",
      errorCode: "SERVER_ERROR",
    };
  }
}
