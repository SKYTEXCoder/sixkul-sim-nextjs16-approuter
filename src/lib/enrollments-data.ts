/**
 * Server-side data fetching for Student Enrollments
 * 
 * Uses Prisma directly to fetch enrollment data for Server Components.
 * No API routes - data is fetched server-side.
 * 
 * @module lib/enrollments-data
 */

import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// ============================================
// Types
// ============================================

export interface EnrollmentViewModel {
  id: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'ALUMNI' | 'CANCELLED';
  joinedAt: Date;
  academicYear: string;
  extracurricular: {
    id: string;
    name: string;
    category: string;
    description: string | null;
    logoUrl: string | null;
  };
  pembina: {
    name: string;
  };
  scheduleCount: number;
}

export interface EnrollmentsResult {
  success: boolean;
  data?: EnrollmentViewModel[];
  error?: string;
  errorCode?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR';
}

// ============================================
// Data Fetching
// ============================================

/**
 * Fetch all enrollments for the currently authenticated student
 * 
 * This function is designed to be called from Server Components.
 * It handles authentication, authorization, and data fetching.
 */
export async function getStudentEnrollments(): Promise<EnrollmentsResult> {
  try {
    // Step 1: Authenticate using Clerk
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'Authentication required. Please login.',
        errorCode: 'UNAUTHORIZED',
      };
    }

    // Step 2: Verify role is SISWA
    const userRole = (sessionClaims?.public_metadata as { role?: string })?.role;
    
    if (userRole !== 'SISWA') {
      return {
        success: false,
        error: 'Access denied. This page is only available for students.',
        errorCode: 'FORBIDDEN',
      };
    }

    // Step 3: Find the user in our database
    const user = await prisma.user.findUnique({
      where: { clerk_id: userId },
      include: {
        studentProfile: true,
      },
    });

    if (!user || !user.studentProfile) {
      return {
        success: false,
        error: 'Student profile not found. Please contact administrator.',
        errorCode: 'NOT_FOUND',
      };
    }

    // Step 4: Fetch enrollments with related data
    const enrollments = await prisma.enrollment.findMany({
      where: {
        student_id: user.studentProfile.id,
      },
      include: {
        extracurricular: {
          include: {
            pembina: {
              include: {
                user: {
                  select: {
                    full_name: true,
                  },
                },
              },
            },
            schedules: {
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        joined_at: 'desc',
      },
    });

    // Step 5: Transform to view model
    const viewModels: EnrollmentViewModel[] = enrollments.map((enrollment) => ({
      id: enrollment.id,
      status: enrollment.status,
      joinedAt: enrollment.joined_at,
      academicYear: enrollment.academic_year,
      extracurricular: {
        id: enrollment.extracurricular.id,
        name: enrollment.extracurricular.name,
        category: enrollment.extracurricular.category,
        description: enrollment.extracurricular.description,
        logoUrl: enrollment.extracurricular.logo_url,
      },
      pembina: {
        name: enrollment.extracurricular.pembina.user.full_name,
      },
      scheduleCount: enrollment.extracurricular.schedules.length,
    }));

    return {
      success: true,
      data: viewModels,
    };
  } catch (error) {
    console.error('[ENROLLMENTS DATA ERROR]', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
      errorCode: 'SERVER_ERROR',
    };
  }
}
