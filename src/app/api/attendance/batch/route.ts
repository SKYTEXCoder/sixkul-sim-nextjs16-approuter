/**
 * SIXKUL Batch Attendance API Route
 *
 * POST /api/attendance/batch - Save attendance records for multiple students
 *
 * This route allows Pembina to submit attendance for an entire class
 * in a single transaction (all or nothing).
 *
 * @module api/attendance/batch
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { AttendanceStatus } from "@/generated/prisma";
import { getOrCreateUser } from "@/lib/sync-user";
import { createAttendanceNotification } from "@/lib/notification-triggers";

// ============================================
// Type Definitions
// ============================================

interface AttendanceRecord {
  enrollmentId: string;
  status: AttendanceStatus;
  notes?: string;
}

interface BatchAttendanceRequestBody {
  date: string; // ISO date string (e.g., "2024-12-08")
  sessionId: string; // REQUIRED: Link to specific Session
  records: AttendanceRecord[];
}

interface BatchAttendanceSuccessResponse {
  success: true;
  message: string;
  data: {
    date: string;
    totalRecords: number;
    created: number;
    updated: number;
  };
}

interface BatchAttendanceErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

// ============================================
// Valid Attendance Status Values
// ============================================

const VALID_STATUS_VALUES: AttendanceStatus[] = [
  "PRESENT",
  "SICK",
  "PERMISSION",
  "ALPHA",
];

// ============================================
// Helper Functions
// ============================================

/**
 * Authenticate user and verify PEMBINA or ADMIN role using Clerk with JIT sync
 */
async function authenticatePembina(): Promise<{
  success: boolean;
  userId?: string;
  pembinaProfileId?: string;
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

    // Check if user has PEMBINA or ADMIN role
    if (userRole !== "PEMBINA" && userRole !== "ADMIN") {
      return {
        success: false,
        error: "Only Pembina or Admin can manage attendance.",
        statusCode: 403,
      };
    }

    // Use JIT sync to get or create user
    const syncResult = await getOrCreateUser(userId, sessionClaims);

    if (!syncResult.success) {
      return {
        success: false,
        error: syncResult.error,
        statusCode: syncResult.statusCode,
      };
    }

    const { user, profile } = syncResult.data;

    // For PEMBINA, verify profile exists
    if (userRole === "PEMBINA") {
      if (!profile) {
        return {
          success: false,
          error: "Pembina profile not found.",
          statusCode: 404,
        };
      }

      return {
        success: true,
        userId: user.id,
        pembinaProfileId: profile.id,
      };
    }

    // Admin doesn't need pembina profile
    return {
      success: true,
      userId: user.id,
    };
  } catch (error) {
    console.error("[ATTENDANCE AUTH ERROR]", error);
    return {
      success: false,
      error: "Authentication failed. Please login again.",
      statusCode: 401,
    };
  }
}

/**
 * Validate the batch attendance request body
 */
function validateBatchAttendanceInput(body: unknown): {
  valid: boolean;
  data?: BatchAttendanceRequestBody;
  errors?: string[];
} {
  const errors: string[] = [];

  if (!body || typeof body !== "object") {
    return { valid: false, errors: ["Request body is required"] };
  }

  const { date, sessionId, records } =
    body as Partial<BatchAttendanceRequestBody>;

  // Validate date
  if (!date) {
    errors.push("date is required");
  } else if (typeof date !== "string") {
    errors.push("date must be a string");
  } else {
    // Validate date format and value
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      errors.push('date must be a valid date string (e.g., "2024-12-08")');
    } else if (parsedDate > new Date()) {
      errors.push("date cannot be in the future");
    }
  }

  // Validate sessionId
  if (!sessionId) {
    errors.push("sessionId is required");
  } else if (typeof sessionId !== "string") {
    errors.push("sessionId must be a string");
  }

  // Validate records array
  if (!records) {
    errors.push("records array is required");
  } else if (!Array.isArray(records)) {
    errors.push("records must be an array");
  } else if (records.length === 0) {
    errors.push("records array cannot be empty");
  } else {
    // Validate each record
    records.forEach((record, index) => {
      if (!record.enrollmentId) {
        errors.push(`records[${index}].enrollmentId is required`);
      }
      if (!record.status) {
        errors.push(`records[${index}].status is required`);
      } else if (
        !VALID_STATUS_VALUES.includes(record.status as AttendanceStatus)
      ) {
        errors.push(
          `records[${index}].status must be one of: ${VALID_STATUS_VALUES.join(
            ", "
          )}`
        );
      }
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      date: date!,
      sessionId: sessionId!.trim(),
      records: records!.map((r) => ({
        enrollmentId: r.enrollmentId.trim(),
        status: r.status as AttendanceStatus,
        notes: r.notes?.trim(),
      })),
    },
  };
}

// ============================================
// POST Handler - Batch Save Attendance
// ============================================

/**
 * Handle POST request to save batch attendance records
 *
 * Flow (per sequence diagram):
 * 1. Authenticate user and verify PEMBINA role
 * 2. Validate request body (date, records[])
 * 3. Use prisma.$transaction for atomic operation
 * 4. Loop through records and upsert each one
 * 5. Return 200 OK with count of processed records
 */
export async function POST(
  request: NextRequest
): Promise<
  NextResponse<BatchAttendanceSuccessResponse | BatchAttendanceErrorResponse>
> {
  try {
    // ----------------------------------------
    // Step 1: Authenticate user and verify PEMBINA role
    // ----------------------------------------
    const authResult = await authenticatePembina();

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error! },
        { status: authResult.statusCode }
      );
    }

    // ----------------------------------------
    // Step 2: Parse and validate request body
    // ----------------------------------------
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const validation = validateBatchAttendanceInput(body);

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const { date, sessionId, records } = validation.data;
    const attendanceDate = new Date(date);

    // Normalize to start of day for consistent comparison
    attendanceDate.setHours(0, 0, 0, 0);

    // ----------------------------------------
    // Step 3: Verify all enrollmentIds exist
    // ----------------------------------------
    const enrollmentIds = records.map((r) => r.enrollmentId);
    const existingEnrollments = await prisma.enrollment.findMany({
      where: { id: { in: enrollmentIds } },
      select: {
        id: true,
        extracurricular: {
          select: { name: true },
        },
      },
    });

    // Build map for quick lookup of extracurricular names
    const enrollmentExtracurricularMap = new Map(
      existingEnrollments.map((e) => [e.id, e.extracurricular.name])
    );

    const existingIds = new Set(existingEnrollments.map((e) => e.id));
    const missingIds = enrollmentIds.filter((id) => !existingIds.has(id));

    if (missingIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Some enrollment IDs do not exist",
          errors: missingIds.map((id) => `Enrollment not found: ${id}`),
        },
        { status: 400 }
      );
    }

    // ----------------------------------------
    // Step 4: Use transaction to process records
    // Enforce IMMUTABILITY (Blocker B) and INTEGRITY (Blocker A)
    // ----------------------------------------
    let createdCount = 0;
    let skippedCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const record of records) {
        // Blocker B: Check execution path - Create Only
        const existingAttendance = await tx.attendance.findUnique({
          where: {
            enrollment_id_date: {
              enrollment_id: record.enrollmentId,
              date: attendanceDate,
            },
          },
        });

        if (existingAttendance) {
          // GUARDRAIL 1: STRICT BATCH FAILURE
          // If we encounter ANY existing record that is locked, we must abort the ENTIRE transaction.
          // This prevents partial application where some students get marked and others don't,
          // hiding the fact that there was a conflict.
          if (existingAttendance.is_locked) {
            throw new Error(
              `Batch failed: Attendance for student ${record.enrollmentId} on ${date} is LOCKED and cannot be modified.`
            );
          } else {
            // Even for unlocked records, our Hardening Policy is "Create Only".
            // Silent skipping is risky if the user thinks they updated it.
            // Throwing ensures the user knows they are trying to write over existing data.
            throw new Error(
              `Batch failed: Attendance for student ${record.enrollmentId} on ${date} already exists.`
            );
          }
        }

        // Create new attendance record
        // Blocker A: session_id is MANDATORY
        await tx.attendance.create({
          data: {
            enrollment_id: record.enrollmentId,
            session_id: sessionId, // Strictly usage of sessionId
            date: attendanceDate,
            status: record.status,
            notes: record.notes,
            is_locked: true, // Lock immediately upon creation
          },
        });
        createdCount++;
      }
    });

    console.log(
      `[ATTENDANCE BATCH] Processed ${records.length} records for ${date} - Created: ${createdCount}, Skipped: ${skippedCount}`
    );

    // ----------------------------------------
    // Step 6: Create notifications for each attendance record
    // Non-blocking - notifications are created after transaction completes
    // ----------------------------------------
    if (createdCount > 0) {
      for (const record of records) {
        // Only notify for actual processing? Or all?
        // Usually only for new records, but simplistic approach notifies matching status.
        // Let's notify for all attempting to be consistent with UI feedback,
        // OR better: ensure we don't spam.
        // Given skippedCount, we might skip notifications for those.
        // BUT, calculating which were new is hard outside loop.
        // We will skip notification optimization for now as it's not a Blocker.
        const extracurricularName =
          enrollmentExtracurricularMap.get(record.enrollmentId) ||
          "Ekstrakurikuler";

        createAttendanceNotification(
          record.enrollmentId,
          record.status,
          attendanceDate,
          extracurricularName
        ).catch((err) => {
          console.error(
            `[NOTIFICATION] Failed to create attendance notification: ${err}`
          );
        });
      }
    }

    // ----------------------------------------
    // Step 5: Return 200 OK
    // ----------------------------------------
    return NextResponse.json({
      success: true,
      message: "Absensi berhasil disimpan!",
      data: {
        date: date,
        totalRecords: records.length,
        created: createdCount,
        updated: 0, // No updates allowed
        skipped: skippedCount,
      },
    });
  } catch (error) {
    // ----------------------------------------
    // Error Handling
    // ----------------------------------------
    console.error("[ATTENDANCE BATCH ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server. Silakan coba lagi.",
      },
      { status: 500 }
    );
  }
}

// ============================================
// Other HTTP Methods - Not Allowed
// ============================================

export async function GET(): Promise<
  NextResponse<BatchAttendanceErrorResponse>
> {
  return NextResponse.json(
    {
      success: false,
      message:
        "Method GET not allowed. Use /api/attendance with query params instead.",
    },
    { status: 405 }
  );
}

export async function PUT(): Promise<
  NextResponse<BatchAttendanceErrorResponse>
> {
  return NextResponse.json(
    {
      success: false,
      message: "Method PUT not allowed. Use POST for batch operations.",
    },
    { status: 405 }
  );
}

export async function DELETE(): Promise<
  NextResponse<BatchAttendanceErrorResponse>
> {
  return NextResponse.json(
    {
      success: false,
      message: "Method DELETE not allowed on batch endpoint.",
    },
    { status: 405 }
  );
}
