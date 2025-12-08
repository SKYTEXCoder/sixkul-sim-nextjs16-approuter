/**
 * SIXKUL Login API Route
 * 
 * POST /api/auth/login
 * 
 * Handles user authentication by:
 * 1. Validating email and password input
 * 2. Finding user by email in database
 * 3. Verifying password with bcrypt
 * 4. Generating JWT token on success
 * 5. Setting HTTP-only cookie for secure session management
 * 
 * @module api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  comparePassword, 
  signToken, 
  AUTH_CONFIG 
} from '@/lib/auth';

// ============================================
// Type Definitions
// ============================================

interface LoginRequestBody {
  email: string;
  password: string;
}

interface LoginSuccessResponse {
  success: true;
  message: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
}

interface LoginErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

// ============================================
// Input Validation
// ============================================

/**
 * Validate login request body
 */
function validateLoginInput(body: unknown): { 
  valid: boolean; 
  data?: LoginRequestBody; 
  errors?: string[] 
} {
  const errors: string[] = [];

  // Check if body exists and is an object
  if (!body || typeof body !== 'object') {
    return { 
      valid: false, 
      errors: ['Request body is required'] 
    };
  }

  const { email, password } = body as Partial<LoginRequestBody>;

  // Validate email
  if (!email) {
    errors.push('Email is required');
  } else if (typeof email !== 'string') {
    errors.push('Email must be a string');
  } else if (!isValidEmail(email)) {
    errors.push('Email format is invalid');
  }

  // Validate password
  if (!password) {
    errors.push('Password is required');
  } else if (typeof password !== 'string') {
    errors.push('Password must be a string');
  } else if (password.length < 1) {
    errors.push('Password cannot be empty');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { 
    valid: true, 
    data: { 
      email: email!.toLowerCase().trim(), 
      password: password! 
    } 
  };
}

/**
 * Simple email format validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ============================================
// POST Handler - Login
// ============================================

/**
 * Handle POST request for user login
 * 
 * @param request - NextRequest object
 * @returns NextResponse with login result
 * 
 * Success Response (200):
 * {
 *   success: true,
 *   message: "Login berhasil",
 *   user: { id, email, full_name, role }
 * }
 * + Sets HTTP-only cookie with JWT token
 * 
 * Error Responses:
 * - 400: Validation errors
 * - 401: Invalid credentials
 * - 500: Server error
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<LoginSuccessResponse | LoginErrorResponse>> {
  try {
    // ----------------------------------------
    // Step 1: Parse request body
    // ----------------------------------------
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    // ----------------------------------------
    // Step 2: Validate input
    // ----------------------------------------
    const validation = validateLoginInput(body);
    
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

    const { email, password } = validation.data;

    // ----------------------------------------
    // Step 3: Find user by email in database
    // ----------------------------------------
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password_hash: true,
        full_name: true,
        role: true,
        avatar_url: true,
      },
    });

    // User not found - return generic error for security
    // (don't reveal whether email exists or not)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email atau password salah',
        },
        { status: 401 }
      );
    }

    // ----------------------------------------
    // Step 4: Verify password using bcrypt
    // ----------------------------------------
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      // Password invalid - return 401 Unauthorized
      return NextResponse.json(
        {
          success: false,
          message: 'Email atau password salah',
        },
        { status: 401 }
      );
    }

    // ----------------------------------------
    // Step 5: Generate JWT token
    // ----------------------------------------
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // ----------------------------------------
    // Step 6: Create success response with user data
    // ----------------------------------------
    const responseBody: LoginSuccessResponse = {
      success: true,
      message: 'Login berhasil',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    };

    // Create the response
    const response = NextResponse.json(responseBody, { status: 200 });

    // ----------------------------------------
    // Step 7: Set JWT as HTTP-Only cookie
    // ----------------------------------------
    response.cookies.set({
      name: AUTH_CONFIG.COOKIE_NAME,
      value: token,
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax', // CSRF protection
      maxAge: AUTH_CONFIG.COOKIE_MAX_AGE, // 1 day in seconds
      path: '/', // Available across entire site
    });

    // Log successful login (for debugging/auditing)
    console.log(`[LOGIN] User logged in: ${user.email} (${user.role})`);

    return response;

  } catch (error) {
    // ----------------------------------------
    // Error Handling - Return 500 Internal Server Error
    // ----------------------------------------
    console.error('[LOGIN ERROR]', error);

    // Don't expose internal error details to client
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

/**
 * Handle unsupported HTTP methods
 */
export async function GET(): Promise<NextResponse<LoginErrorResponse>> {
  return NextResponse.json(
    {
      success: false,
      message: 'Method GET not allowed. Use POST to login.',
    },
    { status: 405 }
  );
}

export async function PUT(): Promise<NextResponse<LoginErrorResponse>> {
  return NextResponse.json(
    {
      success: false,
      message: 'Method PUT not allowed. Use POST to login.',
    },
    { status: 405 }
  );
}

export async function DELETE(): Promise<NextResponse<LoginErrorResponse>> {
  return NextResponse.json(
    {
      success: false,
      message: 'Method DELETE not allowed. Use POST to login.',
    },
    { status: 405 }
  );
}
