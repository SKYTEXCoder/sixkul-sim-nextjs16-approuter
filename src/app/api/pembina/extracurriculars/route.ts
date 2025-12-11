/**
 * SIXKUL Pembina Extracurriculars API Route
 * 
 * GET /api/pembina/extracurriculars - List extracurriculars managed by authenticated pembina
 * 
 * @module api/pembina/extracurriculars
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { getOrCreatePembinaProfile } from '@/lib/sync-user';

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
// GET Handler - List Pembina's Extracurriculars
// ============================================

export async function GET(
  request: NextRequest
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    // Authenticate pembina
    const authResult = await authenticatePembina();
    
    if (!authResult.success || !authResult.pembinaProfileId) {
      return NextResponse.json(
        { success: false, message: authResult.error! },
        { status: authResult.statusCode }
      );
    }

    // Fetch extracurriculars managed by this pembina
    const extracurriculars = await prisma.extracurricular.findMany({
      where: {
        pembina_id: authResult.pembinaProfileId,
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
