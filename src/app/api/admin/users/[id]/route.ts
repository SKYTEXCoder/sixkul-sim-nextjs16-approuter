/**
 * SIXKUL Admin User Detail API Routes
 *
 * Single user operations (Admin only)
 *
 * GET    /api/admin/users/[id]  - Get user by ID
 * PUT    /api/admin/users/[id]  - Update user (name, role, status)
 * DELETE /api/admin/users/[id]  - Soft-deactivate user
 *
 * @module api/admin/users/[id]
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { UserRole } from "@/generated/prisma";

// ============================================
// Type Definitions
// ============================================

interface UserDetailResponse {
  success: true;
  message: string;
  data: {
    id: string;
    clerk_id: string;
    username: string;
    email: string | null;
    full_name: string;
    role: string;
    avatar_url: string | null;
    created_at: Date;
    updated_at: Date;
    studentProfile?: {
      id: string;
      nis: string;
      class_name: string;
      major: string;
      phone_number: string | null;
      academic_year: string | null;
    } | null;
    pembinaProfile?: {
      id: string;
      nip: string;
      expertise: string | null;
      phone_number: string | null;
    } | null;
  };
}

interface UserErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

interface UpdateUserRequestBody {
  full_name?: string;
  role?: UserRole;
  is_active?: boolean;
}

// ============================================
// Helper Functions
// ============================================

async function authenticateAdmin(): Promise<{
  success: boolean;
  userId?: string;
  error?: string;
  statusCode?: number;
}> {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Authentication required. Please login.",
        statusCode: 401,
      };
    }

    const userRole = (sessionClaims?.public_metadata as { role?: string })
      ?.role;

    if (userRole !== "ADMIN") {
      return {
        success: false,
        error: "Admin access required.",
        statusCode: 403,
      };
    }

    return { success: true, userId };
  } catch (error) {
    console.error("[ADMIN AUTH ERROR]", error);
    return {
      success: false,
      error: "Authentication failed. Please login again.",
      statusCode: 401,
    };
  }
}

// ============================================
// GET Handler - Get User by ID
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<UserDetailResponse | UserErrorResponse>> {
  try {
    const authResult = await authenticateAdmin();
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error! },
        { status: authResult.statusCode }
      );
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        pembinaProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User retrieved successfully",
      data: {
        id: user.id,
        clerk_id: user.clerk_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        updated_at: user.updated_at,
        studentProfile: user.studentProfile,
        pembinaProfile: user.pembinaProfile,
      },
    });
  } catch (error) {
    console.error("[ADMIN USER GET BY ID ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// ============================================
// PUT Handler - Update User
// ============================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<UserDetailResponse | UserErrorResponse>> {
  try {
    const authResult = await authenticateAdmin();
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error! },
        { status: authResult.statusCode }
      );
    }

    const { id } = await params;

    // Check user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan." },
        { status: 404 }
      );
    }

    // Parse request body
    let body: UpdateUserRequestBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: {
      full_name?: string;
      role?: UserRole;
      clerk_id?: string;
    } = {};

    if (body.full_name && typeof body.full_name === "string") {
      updateData.full_name = body.full_name.trim();
    }

    if (body.role && ["ADMIN", "PEMBINA", "SISWA"].includes(body.role)) {
      updateData.role = body.role;
    }

    // Handle is_active field for activation/deactivation
    if (typeof body.is_active === "boolean") {
      const isCurrentlyActive =
        !existingUser.clerk_id.startsWith("DEACTIVATED_");

      if (body.is_active && !isCurrentlyActive) {
        // Reactivate: remove DEACTIVATED_ prefix
        updateData.clerk_id = existingUser.clerk_id.replace("DEACTIVATED_", "");
      } else if (!body.is_active && isCurrentlyActive) {
        // Deactivate: add DEACTIVATED_ prefix
        updateData.clerk_id = `DEACTIVATED_${existingUser.clerk_id}`;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update." },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        studentProfile: true,
        pembinaProfile: true,
      },
    });

    console.log(`[ADMIN] User updated: ${updatedUser.id}`);

    return NextResponse.json({
      success: true,
      message: "User berhasil diperbarui!",
      data: {
        id: updatedUser.id,
        clerk_id: updatedUser.clerk_id,
        username: updatedUser.username,
        email: updatedUser.email,
        full_name: updatedUser.full_name,
        role: updatedUser.role,
        avatar_url: updatedUser.avatar_url,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
        studentProfile: updatedUser.studentProfile,
        pembinaProfile: updatedUser.pembinaProfile,
      },
    });
  } catch (error) {
    console.error("[ADMIN USER UPDATE ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE Handler - Soft Deactivate User
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<{ success: boolean; message: string }>> {
  try {
    const authResult = await authenticateAdmin();
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error! },
        { status: authResult.statusCode }
      );
    }

    const { id } = await params;

    // Check user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan." },
        { status: 404 }
      );
    }

    // Note: Since User model doesn't have is_active field,
    // we'll mark by prefixing clerk_id with "DEACTIVATED_"
    // This is a soft-deactivate that preserves data.
    // In production, consider adding an is_active field to schema.

    const deactivatedClerkId = existingUser.clerk_id.startsWith("DEACTIVATED_")
      ? existingUser.clerk_id
      : `DEACTIVATED_${existingUser.clerk_id}`;

    await prisma.user.update({
      where: { id },
      data: {
        clerk_id: deactivatedClerkId,
      },
    });

    console.log(`[ADMIN] User deactivated: ${id}`);

    return NextResponse.json({
      success: true,
      message: "User berhasil dinonaktifkan.",
    });
  } catch (error) {
    console.error("[ADMIN USER DELETE ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
