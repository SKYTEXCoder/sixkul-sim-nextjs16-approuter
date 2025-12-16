/**
 * Server-side data layer for PEMBINA Profile
 *
 * Uses Prisma directly to fetch and update profile data.
 * Includes Server Actions for profile updates.
 *
 * @module lib/pembina-profile-data
 */

"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ============================================
// Types
// ============================================

export interface PembinaProfileViewModel {
  // Identity (Clerk + User)
  fullName: string;
  email: string;
  avatarUrl: string | null;

  // Professional (PembinaProfile)
  nip: string;
  expertise: string | null;
  phoneNumber: string | null;

  // Statistics
  extracurricularCount: number;
  activeExtracurricularCount: number;

  // Account
  role: string;
  joinedAt: Date;
}

export interface ProfileResult {
  success: boolean;
  data?: PembinaProfileViewModel;
  hasPembinaProfile: boolean;
  error?: string;
  errorCode?: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "SERVER_ERROR";
}

export interface UpdateProfileInput {
  expertise?: string;
  phoneNumber?: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

// ============================================
// Validation Schema
// ============================================

const updateProfileSchema = z.object({
  expertise: z.string().max(200, "Maksimal 200 karakter").optional(),
  phoneNumber: z
    .string()
    .regex(
      /^(\+62|62|08)[0-9]{8,12}$/,
      "Format nomor telepon tidak valid (contoh: 08123456789)"
    )
    .optional()
    .or(z.literal("")),
});

// ============================================
// Data Fetching Functions
// ============================================

/**
 * Fetch profile data for the currently authenticated PEMBINA
 *
 * Data Sources:
 * - Identity: Clerk user (fullName, email, avatarUrl, joinedAt)
 * - Professional: Prisma PembinaProfile (nip, expertise, phone_number)
 * - Stats: Prisma Extracurricular aggregates
 */
export async function getPembinaProfile(): Promise<ProfileResult> {
  try {
    // Step 1: Authenticate using Clerk
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return {
        success: false,
        hasPembinaProfile: false,
        error: "Autentikasi diperlukan. Silakan login.",
        errorCode: "UNAUTHORIZED",
      };
    }

    // Step 2: Verify role is PEMBINA
    const userRole = (sessionClaims?.public_metadata as { role?: string })
      ?.role;

    if (userRole !== "PEMBINA") {
      return {
        success: false,
        hasPembinaProfile: false,
        error: "Akses ditolak. Halaman ini hanya untuk pembina.",
        errorCode: "FORBIDDEN",
      };
    }

    // Step 3: Get Clerk user details for identity data
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return {
        success: false,
        hasPembinaProfile: false,
        error: "Tidak dapat mengambil data pengguna.",
        errorCode: "SERVER_ERROR",
      };
    }

    // Step 4: Find the user in our database
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      include: {
        pembinaProfile: {
          include: {
            extracurriculars: {
              select: { status: true },
            },
          },
        },
      },
    });

    // Step 5: Handle case where user doesn't exist
    if (!user) {
      return {
        success: false,
        hasPembinaProfile: false,
        error: "Pengguna tidak ditemukan di database.",
        errorCode: "NOT_FOUND",
      };
    }

    // Step 6: Handle case where pembina profile doesn't exist
    if (!user.pembinaProfile) {
      const viewModel: PembinaProfileViewModel = {
        // Identity from Clerk
        fullName: clerkUser.fullName || clerkUser.username || "Pembina",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        avatarUrl: clerkUser.imageUrl || null,

        // Professional - all empty (no pembina profile)
        nip: "",
        expertise: null,
        phoneNumber: null,

        // Statistics - all zero
        extracurricularCount: 0,
        activeExtracurricularCount: 0,

        // Account
        role: "PEMBINA",
        joinedAt: clerkUser.createdAt
          ? new Date(clerkUser.createdAt)
          : new Date(),
      };

      return {
        success: true,
        data: viewModel,
        hasPembinaProfile: false,
      };
    }

    // Step 7: Compute extracurricular aggregates
    const extracurriculars = user.pembinaProfile.extracurriculars;
    const extracurricularCount = extracurriculars.length;
    const activeExtracurricularCount = extracurriculars.filter(
      (e) => e.status === "ACTIVE"
    ).length;

    // Step 8: Build view model with full data
    const viewModel: PembinaProfileViewModel = {
      // Identity from Clerk
      fullName: clerkUser.fullName || clerkUser.username || user.full_name,
      email: clerkUser.primaryEmailAddress?.emailAddress || user.email || "",
      avatarUrl: clerkUser.imageUrl || user.avatar_url || null,

      // Professional from PembinaProfile
      nip: user.pembinaProfile.nip,
      expertise: user.pembinaProfile.expertise,
      phoneNumber: user.pembinaProfile.phone_number,

      // Statistics
      extracurricularCount,
      activeExtracurricularCount,

      // Account
      role: "PEMBINA",
      joinedAt: clerkUser.createdAt
        ? new Date(clerkUser.createdAt)
        : user.created_at,
    };

    return {
      success: true,
      data: viewModel,
      hasPembinaProfile: true,
    };
  } catch (error) {
    console.error("[PEMBINA PROFILE DATA ERROR]", error);
    return {
      success: false,
      hasPembinaProfile: false,
      error: "Terjadi kesalahan. Silakan coba lagi.",
      errorCode: "SERVER_ERROR",
    };
  }
}

// ============================================
// Server Actions
// ============================================

/**
 * Update editable profile fields for the current PEMBINA.
 *
 * Editable fields:
 * - expertise
 * - phone_number
 *
 * Read-only fields (NOT updated):
 * - nip
 * - email
 * - full_name
 */
export async function updatePembinaProfile(
  input: UpdateProfileInput
): Promise<ActionResult> {
  try {
    // Step 1: Authenticate
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return { success: false, error: "Autentikasi diperlukan." };
    }

    // Step 2: Verify role
    const userRole = (sessionClaims?.public_metadata as { role?: string })
      ?.role;

    if (userRole !== "PEMBINA") {
      return { success: false, error: "Akses ditolak." };
    }

    // Step 3: Validate input
    const validation = updateProfileSchema.safeParse(input);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Data tidak valid.",
      };
    }

    const { expertise, phoneNumber } = validation.data;

    // Step 4: Find user and profile
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      include: { pembinaProfile: true },
    });

    if (!user) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    if (!user.pembinaProfile) {
      return { success: false, error: "Profil pembina tidak ditemukan." };
    }

    // Step 5: Update profile (only editable fields)
    await prisma.pembinaProfile.update({
      where: { id: user.pembinaProfile.id },
      data: {
        expertise: expertise ?? user.pembinaProfile.expertise,
        phone_number: phoneNumber || null,
      },
    });

    // Step 6: Revalidate paths
    revalidatePath("/pembina/profile");
    revalidatePath("/pembina");

    return { success: true };
  } catch (error) {
    console.error("[UPDATE PEMBINA PROFILE ERROR]", error);
    return { success: false, error: "Gagal memperbarui profil." };
  }
}
