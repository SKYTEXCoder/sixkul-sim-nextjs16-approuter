/**
 * SIXKUL Enrollment API Routes
 * 
 * POST /api/enrollment - Create a new enrollment (Student only)
 * GET /api/enrollment - Get all enrollments for current user
 * 
 * This route handles student registration to extracurricular activities
 * following the sequence diagram flow.
 * 
 * @module api/enrollment
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateStudentProfile } from '@/lib/sync-user';

// ============================================
// Type Definitions
// ============================================

interface EnrollmentRequestBody {
  extracurricularId: string;
}

interface EnrollmentSuccessResponse {
  success: true;
  message: string;
  data: {
    id: string;
    student_id: string;
    extracurricular_id: string;
    status: string;
    joined_at: Date;
    academic_year: string;
    extracurricular?: {
      id: string;
      name: string;
      category: string;
    };
  };
}

interface EnrollmentErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

interface EnrollmentListResponse {
  success: true;
  message: string;
  data: Array<{
    id: string;
    status: string;
    joined_at: Date;
    academic_year: string;
    extracurricular: {
      id: string;
      name: string;
      category: string;
      description: string | null;
    };
  }>;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get the current academic year (e.g., "2024/2025")
 */
function getCurrentAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 0-indexed
  
  // Academic year typically starts in July/August
  // If before July, we're in previous year's academic year
  if (month < 7) {
    return `${year - 1}/${year}`;
  }
  return `${year}/${year + 1}`;
}

/**
 * Authenticate user and verify SISWA role using Clerk with JIT sync
 */
async function authenticateStudent(): Promise<{
  success: boolean;
  userId?: string;
  studentProfileId?: string;
  error?: string;
  statusCode?: number;
}> {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return {
        success: false,
        error: 'Authentication required. Please login.',
        statusCode: 401,
      };
    }

    const userRole = (sessionClaims?.public_metadata as { role?: string })?.role;
    
    // Check if user has SISWA role
    if (userRole !== 'SISWA') {
      return {
        success: false,
        error: 'Only students can enroll in extracurriculars.',
        statusCode: 403,
      };
    }

    // Use JIT sync to get or create student profile
    const result = await getOrCreateStudentProfile(userId, sessionClaims);
    
    if (!result) {
      return {
        success: false,
        error: 'Student profile not found or could not be created.',
        statusCode: 404,
      };
    }

    return {
      success: true,
      userId: result.userId,
      studentProfileId: result.studentProfile.id,
    };
  } catch (error) {
    console.error('[ENROLLMENT AUTH ERROR]', error);
    return {
      success: false,
      error: 'Authentication failed. Please login again.',
      statusCode: 401,
    };
  }
}

/**
 * Validate enrollment request body
 */
function validateEnrollmentInput(body: unknown): {
  valid: boolean;
  data?: EnrollmentRequestBody;
  errors?: string[];
} {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body is required'] };
  }

  const { extracurricularId } = body as Partial<EnrollmentRequestBody>;

  if (!extracurricularId) {
    errors.push('extracurricularId is required');
  } else if (typeof extracurricularId !== 'string') {
    errors.push('extracurricularId must be a string');
  } else if (extracurricularId.trim().length === 0) {
    errors.push('extracurricularId cannot be empty');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: { extracurricularId: extracurricularId!.trim() },
  };
}

// ============================================
// POST Handler - Create Enrollment
// ============================================

/**
 * Handle POST request to create a new enrollment
 * 
 * Flow (per sequence diagram):
 * 1. Authenticate user and verify SISWA role
 * 2. Validate request body (extracurricularId)
 * 3. Check if extracurricular exists
 * 4. Check if student is already enrolled (findFirst)
 * 5. If already enrolled → Return 409 Conflict
 * 6. If not enrolled → Create new enrollment with status PENDING
 * 7. Return 201 Created with enrollment data
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<EnrollmentSuccessResponse | EnrollmentErrorResponse>> {
  try {
    // ----------------------------------------
    // Step 1: Authenticate user and verify SISWA role
    // ----------------------------------------
    const authResult = await authenticateStudent();
    
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error! },
        { status: authResult.statusCode }
      );
    }

    const studentProfileId = authResult.studentProfileId!;

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

    const validation = validateEnrollmentInput(body);
    
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

    const { extracurricularId } = validation.data;

    // ----------------------------------------
    // Step 3: Check if extracurricular exists and is active
    // ----------------------------------------
    const extracurricular = await prisma.extracurricular.findUnique({
      where: { id: extracurricularId },
      select: {
        id: true,
        name: true,
        category: true,
        status: true,
      },
    });

    if (!extracurricular) {
      return NextResponse.json(
        {
          success: false,
          message: 'Ekstrakurikuler tidak ditemukan.',
        },
        { status: 404 }
      );
    }

    if (extracurricular.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          message: 'Ekstrakurikuler ini tidak aktif dan tidak menerima pendaftaran.',
        },
        { status: 400 }
      );
    }

    // ----------------------------------------
    // Step 4: Check if student is already enrolled (checkExistingEnrollment)
    // ----------------------------------------
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        student_id: studentProfileId,
        extracurricular_id: extracurricularId,
      },
    });

    // ----------------------------------------
    // Step 5: If already enrolled → Return 409 Conflict
    // "Anda sudah terdaftar di ekskul ini"
    // ----------------------------------------
    if (existingEnrollment) {
      console.log(
        `[ENROLLMENT] Duplicate enrollment attempt - Student: ${studentProfileId}, Ekstrakurikuler: ${extracurricularId}`
      );
      
      return NextResponse.json(
        {
          success: false,
          message: 'Anda sudah terdaftar di ekstrakurikuler ini.',
        },
        { status: 409 }
      );
    }

    // ----------------------------------------
    // Step 6: Create new enrollment with status PENDING
    // createEnrollment(studentId, ekskulId, date)
    // ----------------------------------------
    const academicYear = getCurrentAcademicYear();

    const newEnrollment = await prisma.enrollment.create({
      data: {
        student_id: studentProfileId,
        extracurricular_id: extracurricularId,
        status: 'PENDING', // Requires approval from Pembina
        academic_year: academicYear,
      },
      include: {
        extracurricular: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    console.log(
      `[ENROLLMENT] New enrollment created - ID: ${newEnrollment.id}, Student: ${studentProfileId}, Ekstrakurikuler: ${extracurricular.name}`
    );

    // ----------------------------------------
    // Step 7: Return 201 Created with enrollment data
    // "Pendaftaran Berhasil"
    // ----------------------------------------
    return NextResponse.json(
      {
        success: true,
        message: 'Pendaftaran berhasil! Menunggu persetujuan pembina.',
        data: {
          id: newEnrollment.id,
          student_id: newEnrollment.student_id,
          extracurricular_id: newEnrollment.extracurricular_id,
          status: newEnrollment.status,
          joined_at: newEnrollment.joined_at,
          academic_year: newEnrollment.academic_year,
          extracurricular: newEnrollment.extracurricular,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    // ----------------------------------------
    // Error Handling - Return 500 Internal Server Error
    // ----------------------------------------
    console.error('[ENROLLMENT ERROR]', error);

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
// GET Handler - List Enrollments
// ============================================

/**
 * Handle GET request to list all enrollments for current user
 * 
 * For SISWA: Returns their own enrollments
 * Can be extended for PEMBINA/ADMIN to see all enrollments
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<EnrollmentListResponse | EnrollmentErrorResponse>> {
  try {
    // Authenticate user
    const authResult = await authenticateStudent();
    
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error! },
        { status: authResult.statusCode }
      );
    }

    const studentProfileId = authResult.studentProfileId!;

    // Get all enrollments for this student
    const enrollments = await prisma.enrollment.findMany({
      where: { student_id: studentProfileId },
      include: {
        extracurricular: {
          select: {
            id: true,
            name: true,
            category: true,
            description: true,
          },
        },
      },
      orderBy: { joined_at: 'desc' },
    });

    return NextResponse.json({
      success: true,
      message: 'Enrollments retrieved successfully',
      data: enrollments.map((e) => ({
        id: e.id,
        status: e.status,
        joined_at: e.joined_at,
        academic_year: e.academic_year,
        extracurricular: e.extracurricular,
      })),
    });

  } catch (error) {
    console.error('[ENROLLMENT GET ERROR]', error);

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

export async function PUT(): Promise<NextResponse<EnrollmentErrorResponse>> {
  return NextResponse.json(
    {
      success: false,
      message: 'Method PUT not allowed on this endpoint.',
    },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse<EnrollmentErrorResponse>> {
  return NextResponse.json(
    {
      success: false,
      message: 'Method DELETE not allowed on this endpoint. Use /api/enrollment/[id] instead.',
    },
    { status: 405 }
  );
}
