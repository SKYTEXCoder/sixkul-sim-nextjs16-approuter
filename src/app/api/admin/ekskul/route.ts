/**
 * SIXKUL Admin Extracurricular Management API Routes
 * 
 * Full CRUD operations for managing extracurriculars (Admin only)
 * 
 * POST   /api/admin/ekskul     - Create new extracurricular
 * GET    /api/admin/ekskul     - List all extracurriculars
 * 
 * @module api/admin/ekskul
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken, AUTH_CONFIG } from '@/lib/auth';
import { ExtracurricularStatus } from '@/generated/prisma';

// ============================================
// Type Definitions
// ============================================

interface CreateEkskulRequestBody {
  name: string;
  category: string;
  description?: string;
  pembinaId: string;
  logoUrl?: string;
  status?: ExtracurricularStatus;
}

interface EkskulSuccessResponse {
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
    pembina?: {
      id: string;
      nip: string;
      user: {
        full_name: string;
        email: string;
      };
    };
  };
}

interface EkskulListResponse {
  success: true;
  message: string;
  data: Array<{
    id: string;
    name: string;
    category: string;
    description: string | null;
    status: string;
    created_at: Date;
    pembina: {
      id: string;
      nip: string;
      user: {
        full_name: string;
        email: string;
      };
    };
    _count: {
      enrollments: number;
      schedules: number;
    };
  }>;
  total: number;
}

interface EkskulErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

// ============================================
// Helper Functions
// ============================================

/**
 * Authenticate user and verify ADMIN role
 */
async function authenticateAdmin(request: NextRequest): Promise<{
  success: boolean;
  userId?: string;
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
    
    if (payload.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Admin access required.',
        statusCode: 403,
      };
    }

    return {
      success: true,
      userId: payload.userId,
    };
  } catch (error) {
    console.error('[ADMIN AUTH ERROR]', error);
    return {
      success: false,
      error: 'Invalid or expired token. Please login again.',
      statusCode: 401,
    };
  }
}

/**
 * Validate create extracurricular request body
 */
function validateCreateEkskulInput(body: unknown): {
  valid: boolean;
  data?: CreateEkskulRequestBody;
  errors?: string[];
} {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body is required'] };
  }

  const { name, category, description, pembinaId, logoUrl, status } = 
    body as Partial<CreateEkskulRequestBody>;

  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('name is required and must be a non-empty string');
  }

  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('category is required and must be a non-empty string');
  }

  if (!pembinaId || typeof pembinaId !== 'string' || pembinaId.trim().length === 0) {
    errors.push('pembinaId is required and must be a non-empty string');
  }

  // Validate optional fields
  if (description !== undefined && typeof description !== 'string') {
    errors.push('description must be a string if provided');
  }

  if (logoUrl !== undefined && typeof logoUrl !== 'string') {
    errors.push('logoUrl must be a string if provided');
  }

  if (status !== undefined && !['ACTIVE', 'INACTIVE'].includes(status)) {
    errors.push('status must be either ACTIVE or INACTIVE');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      name: name!.trim(),
      category: category!.trim(),
      description: description?.trim(),
      pembinaId: pembinaId!.trim(),
      logoUrl: logoUrl?.trim(),
      status: status || 'ACTIVE',
    },
  };
}

// ============================================
// POST Handler - Create Extracurricular
// ============================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<EkskulSuccessResponse | EkskulErrorResponse>> {
  try {
    // ----------------------------------------
    // Step 1: Authenticate and verify ADMIN role
    // ----------------------------------------
    const auth = await authenticateAdmin(request);
    
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

    const validation = validateCreateEkskulInput(body);
    
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

    const { name, category, description, pembinaId, logoUrl, status } = validation.data;

    // ----------------------------------------
    // Step 3: Verify Pembina exists
    // ----------------------------------------
    const pembina = await prisma.pembinaProfile.findUnique({
      where: { id: pembinaId },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    if (!pembina) {
      return NextResponse.json(
        {
          success: false,
          message: 'Pembina tidak ditemukan.',
        },
        { status: 404 }
      );
    }

    // ----------------------------------------
    // Step 4: Check for duplicate name
    // ----------------------------------------
    const existingEkskul = await prisma.extracurricular.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existingEkskul) {
      return NextResponse.json(
        {
          success: false,
          message: `Ekstrakurikuler dengan nama "${name}" sudah ada.`,
        },
        { status: 409 }
      );
    }

    // ----------------------------------------
    // Step 5: Create new extracurricular
    // ----------------------------------------
    const newEkskul = await prisma.extracurricular.create({
      data: {
        name,
        category,
        description: description || null,
        logo_url: logoUrl || null,
        status: status as ExtracurricularStatus,
        pembina_id: pembinaId,
      },
      include: {
        pembina: {
          include: {
            user: {
              select: {
                full_name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    console.log(`[ADMIN] Extracurricular created: ${newEkskul.name} (ID: ${newEkskul.id})`);

    return NextResponse.json(
      {
        success: true,
        message: 'Ekstrakurikuler berhasil dibuat!',
        data: {
          id: newEkskul.id,
          name: newEkskul.name,
          category: newEkskul.category,
          description: newEkskul.description,
          logo_url: newEkskul.logo_url,
          status: newEkskul.status,
          created_at: newEkskul.created_at,
          pembina: {
            id: newEkskul.pembina.id,
            nip: newEkskul.pembina.nip,
            user: newEkskul.pembina.user,
          },
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('[ADMIN EKSKUL CREATE ERROR]', error);

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
// GET Handler - List All Extracurriculars
// ============================================

export async function GET(
  request: NextRequest
): Promise<NextResponse<EkskulListResponse | EkskulErrorResponse>> {
  try {
    // Authenticate admin
    const auth = await authenticateAdmin(request);
    
    if (!auth.success) {
      return NextResponse.json(
        { success: false, message: auth.error! },
        { status: auth.statusCode }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    // Build filter
    const where: Record<string, unknown> = {};
    if (status && ['ACTIVE', 'INACTIVE'].includes(status)) {
      where.status = status;
    }
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    // Fetch all extracurriculars with related data
    const ekstrakurikuler = await prisma.extracurricular.findMany({
      where,
      include: {
        pembina: {
          include: {
            user: {
              select: {
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
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({
      success: true,
      message: 'Ekstrakurikuler retrieved successfully',
      data: ekstrakurikuler.map((e) => ({
        id: e.id,
        name: e.name,
        category: e.category,
        description: e.description,
        status: e.status,
        created_at: e.created_at,
        pembina: {
          id: e.pembina.id,
          nip: e.pembina.nip,
          user: e.pembina.user,
        },
        _count: e._count,
      })),
      total: ekstrakurikuler.length,
    });

  } catch (error) {
    console.error('[ADMIN EKSKUL GET ERROR]', error);

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
// Other HTTP Methods
// ============================================

export async function PUT(): Promise<NextResponse<EkskulErrorResponse>> {
  return NextResponse.json(
    {
      success: false,
      message: 'Use /api/admin/ekskul/[id] for updating extracurriculars.',
    },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse<EkskulErrorResponse>> {
  return NextResponse.json(
    {
      success: false,
      message: 'Use /api/admin/ekskul/[id] for deleting extracurriculars.',
    },
    { status: 405 }
  );
}
