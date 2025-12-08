/**
 * SIXKUL Attendance API Route
 * 
 * GET /api/attendance - Fetch existing attendance records for date + extracurricular
 * 
 * Query params:
 * - extracurricularId: string (required)
 * - date: string ISO date (required)
 * 
 * @module api/attendance
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, AUTH_CONFIG } from '@/lib/auth';

// ============================================
// Type Definitions
// ============================================

interface AttendanceRecord {
  enrollmentId: string;
  status: string;
  notes: string | null;
}

interface SuccessResponse {
  success: true;
  message: string;
  data: {
    hasExistingRecords: boolean;
    records: AttendanceRecord[];
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
    console.error('[ATTENDANCE AUTH ERROR]', error);
    return {
      success: false,
      error: 'Invalid or expired token. Please login again.',
      statusCode: 401,
    };
  }
}

// ============================================
// GET Handler - Fetch Existing Attendance
// ============================================

export async function GET(
  request: NextRequest
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    // Authenticate pembina
    const auth = await authenticatePembina(request);
    
    if (!auth.success || !auth.pembinaProfileId) {
      return NextResponse.json(
        { success: false, message: auth.error! },
        { status: auth.statusCode }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const extracurricularId = searchParams.get('extracurricularId');
    const dateStr = searchParams.get('date');

    if (!extracurricularId) {
      return NextResponse.json(
        { success: false, message: 'extracurricularId is required' },
        { status: 400 }
      );
    }

    if (!dateStr) {
      return NextResponse.json(
        { success: false, message: 'date is required' },
        { status: 400 }
      );
    }

    // Parse and validate date
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { success: false, message: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Normalize to start of day
    date.setHours(0, 0, 0, 0);

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

    // Fetch existing attendance for this date and extracurricular
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: date,
        enrollment: {
          extracurricular_id: extracurricularId,
        },
      },
      select: {
        enrollment_id: true,
        status: true,
        notes: true,
      },
    });

    // Transform to expected format
    const records: AttendanceRecord[] = attendanceRecords.map((record) => ({
      enrollmentId: record.enrollment_id,
      status: record.status,
      notes: record.notes,
    }));

    return NextResponse.json({
      success: true,
      message: records.length > 0 
        ? 'Existing attendance records found' 
        : 'No existing attendance records',
      data: {
        hasExistingRecords: records.length > 0,
        records,
      },
    });

  } catch (error) {
    console.error('[ATTENDANCE FETCH ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      },
      { status: 500 }
    );
  }
}
