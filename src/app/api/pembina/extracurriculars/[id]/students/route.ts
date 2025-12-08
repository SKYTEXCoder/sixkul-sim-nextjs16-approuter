/**
 * SIXKUL Pembina Extracurricular Students API Route
 * 
 * GET /api/pembina/extracurriculars/[id]/students - Fetch students enrolled in extracurricular
 * Also returns schedule data for date validation
 * 
 * @module api/pembina/extracurriculars/[id]/students
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, AUTH_CONFIG } from '@/lib/auth';

// ============================================
// Type Definitions
// ============================================

interface ScheduleItem {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location: string;
}

interface StudentItem {
  enrollmentId: string;
  student: {
    id: string;
    name: string;
    class: string;
    nis: string;
  };
}

interface SuccessResponse {
  success: true;
  message: string;
  data: {
    schedules: ScheduleItem[];
    students: StudentItem[];
  };
}

interface ErrorResponse {
  success: false;
  message: string;
}

// ============================================
// Helper Functions
// ============================================

async function authenticatePembina(request: NextRequest): Promise<{
  success: boolean;
  pembinaProfileId?: string;
  error?: string;
  statusCode?: number;
}> {
  const token = request.cookies.get(AUTH_CONFIG.COOKIE_NAME)?.value;
  
  if (!token) {
    return {
      success: false,
      error: 'Authentication required. Please login.',
      statusCode: 401,
    };
  }

  try {
    const payload = verifyToken(token);
    
    if (payload.role !== 'PEMBINA' && payload.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Only Pembina can access this resource.',
        statusCode: 403,
      };
    }

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
      pembinaProfileId: pembinaProfile.id,
    };
  } catch (error) {
    console.error('[PEMBINA AUTH ERROR]', error);
    return {
      success: false,
      error: 'Invalid or expired token. Please login again.',
      statusCode: 401,
    };
  }
}

// ============================================
// GET Handler - Fetch Students & Schedules
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const { id: extracurricularId } = await params;

    // Authenticate pembina
    const auth = await authenticatePembina(request);
    
    if (!auth.success || !auth.pembinaProfileId) {
      return NextResponse.json(
        { success: false, message: auth.error! },
        { status: auth.statusCode }
      );
    }

    // Verify pembina owns this extracurricular
    const extracurricular = await prisma.extracurricular.findFirst({
      where: {
        id: extracurricularId,
        pembina_id: auth.pembinaProfileId,
      },
      select: { id: true },
    });

    if (!extracurricular) {
      return NextResponse.json(
        { success: false, message: 'Extracurricular not found or not authorized.' },
        { status: 404 }
      );
    }

    // Fetch schedules for this extracurricular
    const schedules = await prisma.schedule.findMany({
      where: {
        extracurricular_id: extracurricularId,
      },
      select: {
        id: true,
        day_of_week: true,
        start_time: true,
        end_time: true,
        location: true,
      },
      orderBy: {
        day_of_week: 'asc',
      },
    });

    // Fetch students with ACTIVE enrollment status
    const enrollments = await prisma.enrollment.findMany({
      where: {
        extracurricular_id: extracurricularId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        student: {
          select: {
            id: true,
            nis: true,
            class_name: true,
            user: {
              select: {
                full_name: true,
              },
            },
          },
        },
      },
      orderBy: {
        student: {
          user: {
            full_name: 'asc',
          },
        },
      },
    });

    // Transform data to match expected response format
    const students: StudentItem[] = enrollments.map((enrollment) => ({
      enrollmentId: enrollment.id,
      student: {
        id: enrollment.student.id,
        name: enrollment.student.user.full_name,
        class: enrollment.student.class_name,
        nis: enrollment.student.nis,
      },
    }));

    return NextResponse.json({
      success: true,
      message: 'Students and schedules fetched successfully',
      data: {
        schedules,
        students,
      },
    });

  } catch (error) {
    console.error('[PEMBINA STUDENTS ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      },
      { status: 500 }
    );
  }
}
