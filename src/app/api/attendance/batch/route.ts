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

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, AUTH_CONFIG } from '@/lib/auth';
import { AttendanceStatus } from '@/generated/prisma';

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
  scheduleId?: string; // Optional link to specific schedule
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
  'PRESENT',
  'SICK',
  'PERMISSION',
  'ALPHA',
];

// ============================================
// Helper Functions
// ============================================

/**
 * Authenticate user from request and verify PEMBINA role
 */
async function authenticatePembina(request: NextRequest): Promise<{
  success: boolean;
  userId?: string;
  pembinaProfileId?: string;
  error?: string;
  statusCode?: number;
}> {
  // Get token from cookie
  const token = request.cookies.get(AUTH_CONFIG.COOKIE_NAME)?.value;
  
  if (!token) {
    return {
      success: false,
      error: 'Authentication required. Please login.',
      statusCode: 401,
    };
  }

  try {
    // Verify token
    const payload = verifyToken(token);
    
    // Check if user has PEMBINA or ADMIN role
    if (payload.role !== 'PEMBINA' && payload.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Only Pembina or Admin can manage attendance.',
        statusCode: 403,
      };
    }

    // Get pembina profile if role is PEMBINA
    if (payload.role === 'PEMBINA') {
      const pembinaProfile = await prisma.pembinaProfile.findUnique({
        where: { user_id: payload.userId },
        select: { id: true },
      });

      if (!pembinaProfile) {
        return {
          success: false,
          error: 'Pembina profile not found.',
          statusCode: 404,
        };
      }

      return {
        success: true,
        userId: payload.userId,
        pembinaProfileId: pembinaProfile.id,
      };
    }

    // Admin doesn't need pembina profile
    return {
      success: true,
      userId: payload.userId,
    };
  } catch (error) {
    console.error('[ATTENDANCE AUTH ERROR]', error);
    return {
      success: false,
      error: 'Invalid or expired token. Please login again.',
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

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body is required'] };
  }

  const { date, scheduleId, records } = body as Partial<BatchAttendanceRequestBody>;

  // Validate date
  if (!date) {
    errors.push('date is required');
  } else if (typeof date !== 'string') {
    errors.push('date must be a string');
  } else {
    // Validate date format and value
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      errors.push('date must be a valid date string (e.g., "2024-12-08")');
    } else if (parsedDate > new Date()) {
      errors.push('date cannot be in the future');
    }
  }

  // Validate scheduleId if provided
  if (scheduleId !== undefined && typeof scheduleId !== 'string') {
    errors.push('scheduleId must be a string if provided');
  }

  // Validate records array
  if (!records) {
    errors.push('records array is required');
  } else if (!Array.isArray(records)) {
    errors.push('records must be an array');
  } else if (records.length === 0) {
    errors.push('records array cannot be empty');
  } else {
    // Validate each record
    records.forEach((record, index) => {
      if (!record.enrollmentId) {
        errors.push(`records[${index}].enrollmentId is required`);
      }
      if (!record.status) {
        errors.push(`records[${index}].status is required`);
      } else if (!VALID_STATUS_VALUES.includes(record.status as AttendanceStatus)) {
        errors.push(
          `records[${index}].status must be one of: ${VALID_STATUS_VALUES.join(', ')}`
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
      scheduleId: scheduleId?.trim(),
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
): Promise<NextResponse<BatchAttendanceSuccessResponse | BatchAttendanceErrorResponse>> {
  try {
    // ----------------------------------------
    // Step 1: Authenticate user and verify PEMBINA role
    // ----------------------------------------
    const auth = await authenticatePembina(request);
    
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.error! },
        { status: auth.statusCode }
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
        { success: false, message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const validation = validateBatchAttendanceInput(body);
    
    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const { date, scheduleId, records } = validation.data;
    const attendanceDate = new Date(date);
    
    // Normalize to start of day for consistent comparison
    attendanceDate.setHours(0, 0, 0, 0);

    // ----------------------------------------
    // Step 3: Verify all enrollmentIds exist
    // ----------------------------------------
    const enrollmentIds = records.map((r) => r.enrollmentId);
    const existingEnrollments = await prisma.enrollment.findMany({
      where: { id: { in: enrollmentIds } },
      select: { id: true },
    });

    const existingIds = new Set(existingEnrollments.map((e) => e.id));
    const missingIds = enrollmentIds.filter((id) => !existingIds.has(id));

    if (missingIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Some enrollment IDs do not exist',
          errors: missingIds.map((id) => `Enrollment not found: ${id}`),
        },
        { status: 400 }
      );
    }

    // ----------------------------------------
    // Step 4: Use transaction to upsert all attendance records
    // All succeed or all fail (atomic operation)
    // ----------------------------------------
    let createdCount = 0;
    let updatedCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const record of records) {
        // Check if attendance already exists for this enrollment on this date
        const existingAttendance = await tx.attendance.findUnique({
          where: {
            enrollment_id_date: {
              enrollment_id: record.enrollmentId,
              date: attendanceDate,
            },
          },
        });

        if (existingAttendance) {
          // Update existing attendance
          await tx.attendance.update({
            where: {
              enrollment_id_date: {
                enrollment_id: record.enrollmentId,
                date: attendanceDate,
              },
            },
            data: {
              status: record.status,
              notes: record.notes,
              schedule_id: scheduleId || null,
            },
          });
          updatedCount++;
        } else {
          // Create new attendance record
          await tx.attendance.create({
            data: {
              enrollment_id: record.enrollmentId,
              schedule_id: scheduleId || null,
              date: attendanceDate,
              status: record.status,
              notes: record.notes,
            },
          });
          createdCount++;
        }
      }
    });

    console.log(
      `[ATTENDANCE BATCH] Processed ${records.length} records for ${date} - Created: ${createdCount}, Updated: ${updatedCount}`
    );

    // ----------------------------------------
    // Step 5: Return 200 OK with count
    // "Absensi Berhasil Disimpan"
    // ----------------------------------------
    return NextResponse.json({
      success: true,
      message: 'Absensi berhasil disimpan!',
      data: {
        date: date,
        totalRecords: records.length,
        created: createdCount,
        updated: updatedCount,
      },
    });

  } catch (error) {
    // ----------------------------------------
    // Error Handling - Return 500 Internal Server Error
    // ----------------------------------------
    console.error('[ATTENDANCE BATCH ERROR]', error);

    // Check for specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          {
            success: false,
            message: 'One or more enrollment IDs are invalid.',
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      },
      { status: 500 }
    );
  }
}

// ============================================
// Other HTTP Methods - Not Allowed
// ============================================

export async function GET(): Promise<NextResponse<BatchAttendanceErrorResponse>> {
  return NextResponse.json(
    {
      success: false,
      message: 'Method GET not allowed. Use /api/attendance with query params instead.',
    },
    { status: 405 }
  );
}

export async function PUT(): Promise<NextResponse<BatchAttendanceErrorResponse>> {
  return NextResponse.json(
    {
      success: false,
      message: 'Method PUT not allowed. Use POST for batch operations.',
    },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse<BatchAttendanceErrorResponse>> {
  return NextResponse.json(
    {
      success: false,
      message: 'Method DELETE not allowed on batch endpoint.',
    },
    { status: 405 }
  );
}
