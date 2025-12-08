/**
 * SIXKUL Pembina Extracurriculars API Route
 * 
 * GET /api/pembina/extracurriculars - List extracurriculars managed by authenticated pembina
 * 
 * @module api/pembina/extracurriculars
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, AUTH_CONFIG } from '@/lib/auth';

// ============================================
// Type Definitions
// ============================================

interface ExtracurricularItem {
  id: string;
  name: string;
  category: string;
  status: string;
  _count: {
    enrollments: number;
  };
}

interface SuccessResponse {
  success: true;
  message: string;
  data: ExtracurricularItem[];
}

interface ErrorResponse {
  success: false;
  message: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Authenticate user and verify PEMBINA role
 */
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

    // Get pembina profile
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
// GET Handler - List Pembina's Extracurriculars
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

    // Fetch extracurriculars managed by this pembina
    const extracurriculars = await prisma.extracurricular.findMany({
      where: {
        pembina_id: auth.pembinaProfileId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        category: true,
        status: true,
        _count: {
          select: {
            enrollments: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Extracurriculars fetched successfully',
      data: extracurriculars,
    });

  } catch (error) {
    console.error('[PEMBINA EXTRACURRICULARS ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      },
      { status: 500 }
    );
  }
}
