/**
 * SIXKUL Logout API Route
 * 
 * POST /api/auth/logout - Clear auth cookie and logout user
 * 
 * @module api/auth/logout
 */

import { NextRequest, NextResponse } from 'next/server';
import { AUTH_CONFIG } from '@/lib/auth';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logout berhasil',
      },
      { status: 200 }
    );

    // Clear the auth cookie
    response.cookies.set({
      name: AUTH_CONFIG.COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    console.log('[LOGOUT] User logged out');

    return response;
  } catch (error) {
    console.error('[LOGOUT ERROR]', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Logout gagal',
      },
      { status: 500 }
    );
  }
}

// GET redirect to login
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      success: false,
      message: 'Use POST method to logout',
    },
    { status: 405 }
  );
}
