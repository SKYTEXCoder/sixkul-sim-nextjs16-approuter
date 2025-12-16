/**
 * SIXKUL Admin User Management API Routes
 *
 * Full CRUD operations for managing users (Admin only)
 *
 * POST   /api/admin/users     - Create new user with profile
 * GET    /api/admin/users     - List all users
 *
 * @module api/admin/users
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { UserRole } from "@/generated/prisma";

// ============================================
// Constants
// ============================================

const DEFAULT_PASSWORD = "123456";

// ============================================
// Type Definitions
// ============================================

interface CreateUserRequestBody {
  name: string;
  email: string;
  role: UserRole;
  specificId: string; // NIS for SISWA, NIP for PEMBINA
  className?: string; // For SISWA only
  major?: string; // For SISWA only
  expertise?: string; // For PEMBINA only
  phoneNumber?: string;
}

interface UserSuccessResponse {
  success: true;
  message: string;
  data: {
    id: string;
    email: string | null;
    full_name: string;
    role: string;
    avatar_url: string | null;
    created_at: Date;
    profile?: {
      id: string;
      specificId: string;
      phoneNumber?: string | null;
      // Additional profile fields based on role
      className?: string;
      major?: string;
      expertise?: string | null;
    };
  };
  defaultPassword: string;
}

interface UserListResponse {
  success: true;
  message: string;
  data: Array<{
    id: string;
    email: string | null;
    full_name: string;
    role: string;
    avatar_url: string | null;
    created_at: Date;
    studentProfile?: {
      id: string;
      nis: string;
      class_name: string;
      major: string;
    } | null;
    pembinaProfile?: {
      id: string;
      nip: string;
      expertise: string | null;
    } | null;
  }>;
  total: number;
}

interface UserErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

// ============================================
// Helper Functions
// ============================================

/**
 * Authenticate user and verify ADMIN role using Clerk
 */
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

    return {
      success: true,
      userId,
    };
  } catch (error) {
    console.error("[ADMIN AUTH ERROR]", error);
    return {
      success: false,
      error: "Authentication failed. Please login again.",
      statusCode: 401,
    };
  }
}

/**
 * Validate create user request body
 */
function validateCreateUserInput(body: unknown): {
  valid: boolean;
  data?: CreateUserRequestBody;
  errors?: string[];
} {
  const errors: string[] = [];

  if (!body || typeof body !== "object") {
    return { valid: false, errors: ["Request body is required"] };
  }

  const {
    name,
    email,
    role,
    specificId,
    className,
    major,
    expertise,
    phoneNumber,
  } = body as Partial<CreateUserRequestBody>;

  // Validate required fields
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    errors.push("name is required and must be a non-empty string");
  }

  if (!email || typeof email !== "string") {
    errors.push("email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("email must be a valid email address");
  }

  if (!role) {
    errors.push("role is required");
  } else if (!["ADMIN", "PEMBINA", "SISWA"].includes(role)) {
    errors.push("role must be one of: ADMIN, PEMBINA, SISWA");
  }

  // specificId validation based on role
  if (role === "SISWA" || role === "PEMBINA") {
    if (
      !specificId ||
      typeof specificId !== "string" ||
      specificId.trim().length === 0
    ) {
      errors.push(
        `specificId is required for ${role} (${role === "SISWA" ? "NIS" : "NIP"})`,
      );
    }
  }

  // SISWA-specific validation
  if (role === "SISWA") {
    if (!className || typeof className !== "string") {
      errors.push("className is required for SISWA");
    }
    if (!major || typeof major !== "string") {
      errors.push("major is required for SISWA");
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      name: name!.trim(),
      email: email!.toLowerCase().trim(),
      role: role as UserRole,
      specificId: specificId?.trim() || "",
      className: className?.trim(),
      major: major?.trim(),
      expertise: expertise?.trim(),
      phoneNumber: phoneNumber?.trim(),
    },
  };
}

// ============================================
// POST Handler - Create User with Profile
// ============================================

export async function POST(
  request: NextRequest,
): Promise<NextResponse<UserSuccessResponse | UserErrorResponse>> {
  try {
    // ----------------------------------------
    // Step 1: Authenticate and verify ADMIN role
    // ----------------------------------------
    const authResult = await authenticateAdmin();

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error! },
        { status: authResult.statusCode },
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
        { status: 400 },
      );
    }

    const validation = validateCreateUserInput(body);

    if (!validation.valid || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        },
        { status: 400 },
      );
    }

    const {
      name,
      email,
      role,
      specificId,
      className,
      major,
      expertise,
      phoneNumber,
    } = validation.data;

    // ----------------------------------------
    // Step 3: Check for duplicate email (optional field but should be unique if provided)
    // ----------------------------------------
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            message: `User dengan email "${email}" sudah ada.`,
          },
          { status: 409 },
        );
      }
    }

    // ----------------------------------------
    // Step 4: Check for duplicate NIS/NIP
    // ----------------------------------------
    if (role === "SISWA") {
      const existingNis = await prisma.studentProfile.findUnique({
        where: { nis: specificId },
      });
      if (existingNis) {
        return NextResponse.json(
          {
            success: false,
            message: `Student dengan NIS "${specificId}" sudah ada.`,
          },
          { status: 409 },
        );
      }
    } else if (role === "PEMBINA") {
      const existingNip = await prisma.pembinaProfile.findUnique({
        where: { nip: specificId },
      });
      if (existingNip) {
        return NextResponse.json(
          {
            success: false,
            message: `Pembina dengan NIP "${specificId}" sudah ada.`,
          },
          { status: 409 },
        );
      }
    }

    // ----------------------------------------
    // Step 5: Generate placeholder clerk_id and username
    // Note: In production, users should be created via Clerk Dashboard or Clerk Backend API
    // ----------------------------------------
    const timestamp = Date.now();
    const placeholderClerkId = `placeholder_${timestamp}`;
    const username = `${role.toLowerCase()}_${specificId || timestamp}`;

    // ----------------------------------------
    // Step 6: Create user with profile in transaction
    // ----------------------------------------
    const result = await prisma.$transaction(async (tx) => {
      // Create the user
      const newUser = await tx.user.create({
        data: {
          clerk_id: placeholderClerkId,
          username,
          email: email || null,
          full_name: name,
          role,
          avatar_url: null,
        },
      });

      let profile: {
        id: string;
        specificId: string;
        phoneNumber?: string | null;
        className?: string;
        major?: string;
        expertise?: string | null;
      } | null = null;

      // Create role-specific profile
      if (role === "SISWA") {
        const studentProfile = await tx.studentProfile.create({
          data: {
            user_id: newUser.id,
            nis: specificId,
            class_name: className!,
            major: major!,
            phone_number: phoneNumber || null,
          },
        });
        profile = {
          id: studentProfile.id,
          specificId: studentProfile.nis,
          phoneNumber: studentProfile.phone_number,
          className: studentProfile.class_name,
          major: studentProfile.major,
        };
      } else if (role === "PEMBINA") {
        const pembinaProfile = await tx.pembinaProfile.create({
          data: {
            user_id: newUser.id,
            nip: specificId,
            expertise: expertise || null,
            phone_number: phoneNumber || null,
          },
        });
        profile = {
          id: pembinaProfile.id,
          specificId: pembinaProfile.nip,
          phoneNumber: pembinaProfile.phone_number,
          expertise: pembinaProfile.expertise,
        };
      }

      return { user: newUser, profile };
    });

    console.log(
      `[ADMIN] User created: ${result.user.email} (${result.user.role}) - ID: ${result.user.id}`,
    );

    // ----------------------------------------
    // Step 7: Return created user
    // ----------------------------------------
    return NextResponse.json(
      {
        success: true,
        message: `User ${role} berhasil dibuat! Note: Untuk login, user harus dibuat via Clerk Dashboard.`,
        data: {
          id: result.user.id,
          email: result.user.email,
          full_name: result.user.full_name,
          role: result.user.role,
          avatar_url: result.user.avatar_url,
          created_at: result.user.created_at,
          profile: result.profile || undefined,
        },
        defaultPassword: "N/A - Create user in Clerk Dashboard",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[ADMIN USER CREATE ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server. Silakan coba lagi.",
      },
      { status: 500 },
    );
  }
}

// ============================================
// GET Handler - List All Users
// ============================================

export async function GET(
  request: NextRequest,
): Promise<NextResponse<UserListResponse | UserErrorResponse>> {
  try {
    // Authenticate admin
    const authResult = await authenticateAdmin();

    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error! },
        { status: authResult.statusCode },
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    // Build filter
    const where: Record<string, unknown> = {};
    if (role && ["ADMIN", "PEMBINA", "SISWA"].includes(role)) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch all users with profiles
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        avatar_url: true,
        created_at: true,
        studentProfile: {
          select: {
            id: true,
            nis: true,
            class_name: true,
            major: true,
          },
        },
        pembinaProfile: {
          select: {
            id: true,
            nip: true,
            expertise: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
      total: users.length,
    });
  } catch (error) {
    console.error("[ADMIN USER GET ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server. Silakan coba lagi.",
      },
      { status: 500 },
    );
  }
}

// ============================================
// Other HTTP Methods
// ============================================

export async function PUT(): Promise<NextResponse<UserErrorResponse>> {
  return NextResponse.json(
    {
      success: false,
      message: "Use /api/admin/users/[id] for updating users.",
    },
    { status: 405 },
  );
}

export async function DELETE(): Promise<NextResponse<UserErrorResponse>> {
  return NextResponse.json(
    {
      success: false,
      message: "Use /api/admin/users/[id] for deleting users.",
    },
    { status: 405 },
  );
}
