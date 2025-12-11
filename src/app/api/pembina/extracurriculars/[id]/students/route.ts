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
import { auth } from '@clerk/nextjs/server';
import { getOrCreatePembinaProfile } from '@/lib/sync-user';

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

/**
 * Authenticate user and verify PEMBINA or ADMIN role using Clerk with JIT sync
 */
async function authenticatePembina(): Promise<{
  success: boolean;
  pembinaProfileId?: string;
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
    
    if (userRole !== 'PEMBINA' && userRole !== 'ADMIN') {
      return {
        success: false,
        error: 'Only Pembina can access this resource.',
        statusCode: 403,
      };
    }

    // Use JIT sync to get or create pembina profile
    const result = await getOrCreatePembinaProfile(userId, sessionClaims);
    
    if (!result) {
      return {
        success: false,
        error: 'Pembina profile not found or could not be created.',
        statusCode: 404,
      };
    }

    return {
      success: true,
      pembinaProfileId: result.pembinaProfile.id,
    };
  } catch (error) {
    console.error('[PEMBINA AUTH ERROR]', error);
    return {
      success: false,
      error: 'Authentication failed. Please login again.',
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
    const authResult = await authenticatePembina();
    
    if (!authResult.success || !authResult.pembinaProfileId) {
      return NextResponse.json(
        { success: false, message: authResult.error! },
        { status: authResult.statusCode }
      );
    }

    // Verify pembina owns this extracurricular
    const extracurricular = await prisma.extracurricular.findFirst({
      where: {
        id: extracurricularId,
        pembina_id: authResult.pembinaProfileId,
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
