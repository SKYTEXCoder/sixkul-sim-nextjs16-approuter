/**
 * SIXKUL Auth Sync API Route
 * 
 * POST /api/auth/sync - Sync current Clerk user to Prisma database (JIT)
 * 
 * This endpoint should be called when a user first accesses the application
 * to ensure their Clerk account is synced to the local database.
 * 
 * @module api/auth/sync
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/sync-user';

// ============================================
// Type Definitions
// ============================================

interface SyncSuccessResponse {
  success: true;
  message: string;
  data: {
    userId: string;
    role: string;
    isNewUser: boolean;
  };
}

interface SyncErrorResponse {
  success: false;
  message: string;
}

// ============================================
// POST Handler - Sync User
// ============================================

export async function POST(): Promise<NextResponse<SyncSuccessResponse | SyncErrorResponse>> {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Use JIT sync to get or create user
    const result = await getOrCreateUser(userId, sessionClaims);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: result.statusCode }
      );
    }

    const { user, isNewUser } = result.data;

    if (isNewUser) {
      console.log(`[AUTH SYNC] New user synced: ${user.username} (${user.role})`);
    }

    return NextResponse.json({
      success: true,
      message: isNewUser ? 'User created successfully' : 'User already exists',
      data: {
        userId: user.id,
        role: user.role,
        isNewUser,
      },
    });

  } catch (error) {
    console.error('[AUTH SYNC ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to sync user' },
      { status: 500 }
    );
  }
}

// Also support GET for easier testing
export async function GET(): Promise<NextResponse<SyncSuccessResponse | SyncErrorResponse>> {
  return POST();
}
