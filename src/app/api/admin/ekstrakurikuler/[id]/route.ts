/**
 * SIXKUL Admin Extracurricular Detail API Routes
 *
 * Single extracurricular operations (Admin only)
 *
 * GET    /api/admin/ekstrakurikuler/[id]  - Get ekstrakurikuler by ID
 * PUT    /api/admin/ekstrakurikuler/[id]  - Update ekstrakurikuler
 * DELETE /api/admin/ekstrakurikuler/[id]  - Soft archive (status=INACTIVE)
 *
 * GUARDRAIL: DELETE is SOFT ARCHIVE ONLY - NO cascade to sessions/enrollments/attendance
 *
 * @module api/admin/ekstrakurikuler/[id]
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { ExtracurricularStatus } from "@/generated/prisma";

// ============================================
// Type Definitions
// ============================================

interface EkskulDetailResponse {
  success: true;
  message: string;
  data: {
    id: string;
    name: string;
    category: string;
    description: string | null;
    logo_url: string | null;
    status: string;
    created_at: Date;
    updated_at: Date;
    pembina: {
      id: string;
      nip: string;
      expertise: string | null;
      user: {
        id: string;
        full_name: string;
        email: string | null;
      };
    };
    _count: {
      enrollments: number;
      schedules: number;
      sessions: number;
    };
  };
}

interface EkskulErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

interface UpdateEkskulRequestBody {
  name?: string;
  category?: string;
  description?: string;
  status?: ExtracurricularStatus;
  pembinaId?: string;
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
// GET Handler - Get Ekstrakurikuler by ID
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<EkskulDetailResponse | EkskulErrorResponse>> {
  try {
    const authResult = await authenticateAdmin();
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error! },
        { status: authResult.statusCode }
      );
    }

    const { id } = await params;

    const ekskul = await prisma.extracurricular.findUnique({
      where: { id },
      include: {
        pembina: {
          include: {
            user: {
              select: {
                id: true,
                full_name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
            schedules: true,
            sessions: true,
          },
        },
      },
    });

    if (!ekskul) {
      return NextResponse.json(
        { success: false, message: "Ekstrakurikuler tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Ekstrakurikuler retrieved successfully",
      data: {
        id: ekskul.id,
        name: ekskul.name,
        category: ekskul.category,
        description: ekskul.description,
        logo_url: ekskul.logo_url,
        status: ekskul.status,
        created_at: ekskul.created_at,
        updated_at: ekskul.updated_at,
        pembina: {
          id: ekskul.pembina.id,
          nip: ekskul.pembina.nip,
          expertise: ekskul.pembina.expertise,
          user: ekskul.pembina.user,
        },
        _count: ekskul._count,
      },
    });
  } catch (error) {
    console.error("[ADMIN EKSTRAKURIKULER GET BY ID ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// ============================================
// PUT Handler - Update Ekstrakurikuler
// ============================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<EkskulDetailResponse | EkskulErrorResponse>> {
  try {
    const authResult = await authenticateAdmin();
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error! },
        { status: authResult.statusCode }
      );
    }

    const { id } = await params;

    // Check ekstrakurikuler exists
    const existingEkskul = await prisma.extracurricular.findUnique({
      where: { id },
    });

    if (!existingEkskul) {
      return NextResponse.json(
        { success: false, message: "Ekstrakurikuler tidak ditemukan." },
        { status: 404 }
      );
    }

    // Parse request body
    let body: UpdateEkskulRequestBody;
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
      name?: string;
      category?: string;
      description?: string;
      status?: ExtracurricularStatus;
      pembina_id?: string;
    } = {};

    if (body.name && typeof body.name === "string") {
      updateData.name = body.name.trim();
    }

    if (body.category && typeof body.category === "string") {
      updateData.category = body.category.trim();
    }

    if (body.description !== undefined) {
      updateData.description =
        typeof body.description === "string" ? body.description.trim() : "";
    }

    if (body.status && ["ACTIVE", "INACTIVE"].includes(body.status)) {
      updateData.status = body.status;
    }

    if (body.pembinaId && typeof body.pembinaId === "string") {
      // Verify pembina exists
      const pembina = await prisma.pembinaProfile.findUnique({
        where: { id: body.pembinaId },
      });
      if (!pembina) {
        return NextResponse.json(
          { success: false, message: "Pembina tidak ditemukan." },
          { status: 404 }
        );
      }
      updateData.pembina_id = body.pembinaId;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields to update." },
        { status: 400 }
      );
    }

    // Update ekstrakurikuler
    const updatedEkskul = await prisma.extracurricular.update({
      where: { id },
      data: updateData,
      include: {
        pembina: {
          include: {
            user: {
              select: {
                id: true,
                full_name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
            schedules: true,
            sessions: true,
          },
        },
      },
    });

    console.log(`[ADMIN] Ekstrakurikuler updated: ${updatedEkskul.id}`);

    return NextResponse.json({
      success: true,
      message: "Ekstrakurikuler berhasil diperbarui!",
      data: {
        id: updatedEkskul.id,
        name: updatedEkskul.name,
        category: updatedEkskul.category,
        description: updatedEkskul.description,
        logo_url: updatedEkskul.logo_url,
        status: updatedEkskul.status,
        created_at: updatedEkskul.created_at,
        updated_at: updatedEkskul.updated_at,
        pembina: {
          id: updatedEkskul.pembina.id,
          nip: updatedEkskul.pembina.nip,
          expertise: updatedEkskul.pembina.expertise,
          user: updatedEkskul.pembina.user,
        },
        _count: updatedEkskul._count,
      },
    });
  } catch (error) {
    console.error("[ADMIN EKSTRAKURIKULER UPDATE ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE Handler - SOFT ARCHIVE ONLY
// ============================================
// GUARDRAIL: This is a SOFT ARCHIVE operation.
// - Sets status to INACTIVE
// - Does NOT delete any data
// - Does NOT cascade to sessions, enrollments, or attendance
// - Historical data is preserved

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

    // Check ekstrakurikuler exists
    const existingEkskul = await prisma.extracurricular.findUnique({
      where: { id },
    });

    if (!existingEkskul) {
      return NextResponse.json(
        { success: false, message: "Ekstrakurikuler tidak ditemukan." },
        { status: 404 }
      );
    }

    // SOFT ARCHIVE: Set status to INACTIVE
    // NO cascade deletes - preserves all sessions, enrollments, attendance
    await prisma.extracurricular.update({
      where: { id },
      data: { status: "INACTIVE" },
    });

    console.log(`[ADMIN] Ekstrakurikuler archived (soft): ${id}`);

    return NextResponse.json({
      success: true,
      message:
        "Ekstrakurikuler berhasil diarsipkan. Data historis tetap tersimpan.",
    });
  } catch (error) {
    console.error("[ADMIN EKSTRAKURIKULER DELETE ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
