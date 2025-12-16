/**
 * SIXKUL Just-in-Time User Sync Utility
 *
 * Automatically creates Prisma database records for Clerk users
 * on their first access to the application.
 *
 * @module lib/sync-user
 */

import prisma from "@/lib/prisma";
import {
  User,
  UserRole,
  StudentProfile,
  PembinaProfile,
} from "@/generated/prisma";

// ============================================
// Types
// ============================================

interface ClerkSessionClaims {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  image_url?: string;
  public_metadata?: {
    role?: string;
  };
}

interface SyncResult {
  user: User;
  profile: StudentProfile | PembinaProfile | null;
  isNewUser: boolean;
}

interface SyncError {
  success: false;
  error: string;
  statusCode: number;
}

type SyncResponse = { success: true; data: SyncResult } | SyncError;

// ============================================
// Helper Functions
// ============================================

/**
 * Generate a unique username from Clerk data
 */
function generateUsername(
  clerkUserId: string,
  sessionClaims: ClerkSessionClaims,
): string {
  // Priority: Clerk username > email prefix > clerk_id short
  if (sessionClaims.username) {
    return sessionClaims.username;
  }

  if (sessionClaims.email) {
    const emailPrefix = sessionClaims.email.split("@")[0];
    return emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, "_");
  }

  // Fallback: use last 8 chars of Clerk user ID
  return `user_${clerkUserId.slice(-8)}`;
}

/**
 * Generate full name from Clerk data
 */
function generateFullName(sessionClaims: ClerkSessionClaims): string {
  if (sessionClaims.full_name) {
    return sessionClaims.full_name;
  }

  if (sessionClaims.first_name || sessionClaims.last_name) {
    return [sessionClaims.first_name, sessionClaims.last_name]
      .filter(Boolean)
      .join(" ");
  }

  if (sessionClaims.username) {
    return sessionClaims.username;
  }

  if (sessionClaims.email) {
    return sessionClaims.email.split("@")[0];
  }

  return "User";
}

/**
 * Map Clerk role string to Prisma UserRole enum
 */
function mapRole(roleString?: string): UserRole {
  const normalizedRole = roleString?.toUpperCase();

  switch (normalizedRole) {
    case "ADMIN":
      return "ADMIN";
    case "PEMBINA":
      return "PEMBINA";
    case "SISWA":
    default:
      return "SISWA"; // Default to SISWA if no role specified
  }
}

// ============================================
// Main Sync Function
// ============================================

/**
 * Get existing user or create new one from Clerk data
 *
 * This is the main JIT sync function. Call this whenever you need
 * a local database user from a Clerk session.
 *
 * @param clerkUserId - The Clerk user ID (from auth().userId)
 * @param sessionClaims - The session claims (from auth().sessionClaims)
 * @returns SyncResponse with user, profile, and isNewUser flag
 *
 * @example
 * const { userId, sessionClaims } = await auth();
 * const result = await getOrCreateUser(userId, sessionClaims);
 * if (!result.success) {
 *   return NextResponse.json({ error: result.error }, { status: result.statusCode });
 * }
 * const { user, profile, isNewUser } = result.data;
 */
export async function getOrCreateUser(
  clerkUserId: string,
  sessionClaims: ClerkSessionClaims | null | undefined,
): Promise<SyncResponse> {
  try {
    // ----------------------------------------
    // Step 1: Check if user already exists
    // ----------------------------------------
    const existingUser = await prisma.user.findUnique({
      where: { clerk_id: clerkUserId },
      include: {
        studentProfile: true,
        pembinaProfile: true,
      },
    });

    if (existingUser) {
      // User exists - return with existing profile
      const profile =
        existingUser.studentProfile || existingUser.pembinaProfile;
      return {
        success: true,
        data: {
          user: existingUser,
          profile,
          isNewUser: false,
        },
      };
    }

    // ----------------------------------------
    // Step 2: User doesn't exist - create new one
    // ----------------------------------------
    const claims = sessionClaims || {};
    const role = mapRole(claims.public_metadata?.role);
    const username = generateUsername(clerkUserId, claims);
    const fullName = generateFullName(claims);

    console.log(
      `[JIT SYNC] Creating new user: ${username} (${role}) - Clerk ID: ${clerkUserId}`,
    );

    // Create user with role-specific profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the base user record
      const newUser = await tx.user.create({
        data: {
          clerk_id: clerkUserId,
          username,
          email: claims.email || null,
          full_name: fullName,
          role,
          avatar_url: claims.image_url || null,
        },
      });

      let profile: StudentProfile | PembinaProfile | null = null;

      // Create role-specific profile
      if (role === "SISWA") {
        profile = await tx.studentProfile.create({
          data: {
            user_id: newUser.id,
            nis: `PLACEHOLDER_${clerkUserId.slice(-6)}`,
            class_name: "Belum diatur",
            major: "Belum diatur",
            phone_number: null,
          },
        });
        console.log(`[JIT SYNC] Created StudentProfile for ${username}`);
      } else if (role === "PEMBINA") {
        profile = await tx.pembinaProfile.create({
          data: {
            user_id: newUser.id,
            nip: `PLACEHOLDER_${clerkUserId.slice(-6)}`,
            expertise: null,
            phone_number: null,
          },
        });
        console.log(`[JIT SYNC] Created PembinaProfile for ${username}`);
      }
      // ADMIN doesn't need a profile

      return { user: newUser, profile };
    });

    console.log(`[JIT SYNC] Successfully created user: ${result.user.id}`);

    return {
      success: true,
      data: {
        user: result.user,
        profile: result.profile,
        isNewUser: true,
      },
    };
  } catch (error) {
    console.error("[JIT SYNC ERROR]", error);

    // Handle unique constraint violations (race condition)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      // Another request already created the user - try to fetch them
      const existingUser = await prisma.user.findUnique({
        where: { clerk_id: clerkUserId },
        include: {
          studentProfile: true,
          pembinaProfile: true,
        },
      });

      if (existingUser) {
        return {
          success: true,
          data: {
            user: existingUser,
            profile: existingUser.studentProfile || existingUser.pembinaProfile,
            isNewUser: false,
          },
        };
      }
    }

    return {
      success: false,
      error: "Failed to sync user. Please try again.",
      statusCode: 500,
    };
  }
}

// ============================================
// Convenience Functions
// ============================================

/**
 * Get or create user and return only the user ID
 * Useful when you only need the local database user ID
 */
export async function getOrCreateUserId(
  clerkUserId: string,
  sessionClaims: ClerkSessionClaims | null | undefined,
): Promise<string | null> {
  const result = await getOrCreateUser(clerkUserId, sessionClaims);
  if (!result.success) {
    return null;
  }
  return result.data.user.id;
}

/**
 * Get or create user and return only the profile
 * Useful for role-specific operations
 */
export async function getOrCreateProfile(
  clerkUserId: string,
  sessionClaims: ClerkSessionClaims | null | undefined,
): Promise<{
  profile: StudentProfile | PembinaProfile | null;
  userId: string;
} | null> {
  const result = await getOrCreateUser(clerkUserId, sessionClaims);
  if (!result.success) {
    return null;
  }
  return {
    profile: result.data.profile,
    userId: result.data.user.id,
  };
}

/**
 * Get or create student profile specifically
 * Returns null if user is not a SISWA
 */
export async function getOrCreateStudentProfile(
  clerkUserId: string,
  sessionClaims: ClerkSessionClaims | null | undefined,
): Promise<{ studentProfile: StudentProfile; userId: string } | null> {
  const result = await getOrCreateUser(clerkUserId, sessionClaims);
  if (!result.success) {
    return null;
  }

  if (result.data.user.role !== "SISWA" || !result.data.profile) {
    return null;
  }

  return {
    studentProfile: result.data.profile as StudentProfile,
    userId: result.data.user.id,
  };
}

/**
 * Get or create pembina profile specifically
 * Returns null if user is not a PEMBINA
 */
export async function getOrCreatePembinaProfile(
  clerkUserId: string,
  sessionClaims: ClerkSessionClaims | null | undefined,
): Promise<{ pembinaProfile: PembinaProfile; userId: string } | null> {
  const result = await getOrCreateUser(clerkUserId, sessionClaims);
  if (!result.success) {
    return null;
  }

  if (result.data.user.role !== "PEMBINA" || !result.data.profile) {
    return null;
  }

  return {
    pembinaProfile: result.data.profile as PembinaProfile,
    userId: result.data.user.id,
  };
}
