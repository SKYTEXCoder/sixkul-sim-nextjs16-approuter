/**
 * SIXKUL Student Dashboard API Route
 * 
 * GET /api/student/dashboard - Fetch all dashboard data for the current student
 * 
 * Returns:
 * - user: { fullName }
 * - stats: { activeEnrollmentsCount, attendancePercentage, schedulesThisWeek, newAnnouncementsCount }
 * - myEkskul: Array of active extracurriculars
 * - upcomingSchedules: Next 10 upcoming sessions
 * - recentAnnouncements: Recent announcements from enrolled extracurriculars
 * 
 * @module api/student/dashboard
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateStudentProfile } from '@/lib/sync-user';

// ============================================
// Type Definitions
// ============================================

interface DashboardSuccessResponse {
  success: true;
  data: {
    user: {
      fullName: string;
    };
    stats: {
      activeEnrollmentsCount: number;
      attendancePercentage: number;
      schedulesThisWeek: number;
      newAnnouncementsCount: number;
    };
    myEkskul: Array<{
      enrollmentId: string;
      id: string;
      name: string;
      category: string;
      status: string;
    }>;
    upcomingSchedules: Array<{
      scheduleId: string;
      ekskulId: string;
      ekskulName: string;
      day: string;
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      location: string;
    }>;
    recentAnnouncements: Array<{
      id: string;
      title: string;
      ekskulName: string;
      createdAt: Date;
      relativeTime: string;
    }>;
  };
}

interface DashboardErrorResponse {
  success: false;
  message: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Map day of week string to Indonesian name
 */
function getDayNameIndonesian(dayOfWeek: string): string {
  const dayMap: Record<string, string> = {
    'SENIN': 'Senin',
    'SELASA': 'Selasa',
    'RABU': 'Rabu',
    'KAMIS': 'Kamis',
    'JUMAT': 'Jumat',
    'SABTU': 'Sabtu',
    'MINGGU': 'Minggu',
    // Also handle English day names just in case
    'MONDAY': 'Senin',
    'TUESDAY': 'Selasa',
    'WEDNESDAY': 'Rabu',
    'THURSDAY': 'Kamis',
    'FRIDAY': 'Jumat',
    'SATURDAY': 'Sabtu',
    'SUNDAY': 'Minggu',
  };
  return dayMap[dayOfWeek.toUpperCase()] || dayOfWeek;
}

/**
 * Get day index (0=Sunday, 1=Monday, etc) from day string
 */
function getDayIndex(dayOfWeek: string): number {
  const dayMap: Record<string, number> = {
    'MINGGU': 0, 'SUNDAY': 0,
    'SENIN': 1, 'MONDAY': 1,
    'SELASA': 2, 'TUESDAY': 2,
    'RABU': 3, 'WEDNESDAY': 3,
    'KAMIS': 4, 'THURSDAY': 4,
    'JUMAT': 5, 'FRIDAY': 5,
    'SABTU': 6, 'SATURDAY': 6,
  };
  return dayMap[dayOfWeek.toUpperCase()] ?? -1;
}

/**
 * Get relative time string in Indonesian
 */
function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Baru saja';
  if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
  if (diffInHours < 24) return `${diffInHours} jam lalu`;
  if (diffInDays === 0) return 'Hari ini';
  if (diffInDays === 1) return 'Kemarin';
  if (diffInDays < 7) return `${diffInDays} hari lalu`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} minggu lalu`;
  return `${Math.floor(diffInDays / 30)} bulan lalu`;
}

/**
 * Get upcoming schedules for the next 7 days (max 10)
 */
function getUpcomingSchedules(
  schedules: Array<{
    id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    location: string;
    extracurricular: { id: string; name: string };
  }>
): Array<{
  scheduleId: string;
  ekskulId: string;
  ekskulName: string;
  day: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location: string;
}> {
  const now = new Date();
  const todayDayIndex = now.getDay(); // 0=Sunday, 1=Monday, etc.
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // Create list of upcoming schedule occurrences
  const upcoming: Array<{
    schedule: typeof schedules[0];
    daysUntil: number;
    isPast: boolean;
  }> = [];

  for (const schedule of schedules) {
    const scheduleDayIndex = getDayIndex(schedule.day_of_week);
    if (scheduleDayIndex === -1) continue;

    // Calculate days until this schedule
    let daysUntil = scheduleDayIndex - todayDayIndex;
    if (daysUntil < 0) daysUntil += 7;

    // Check if it's today but already past
    const [startHour, startMinute] = schedule.start_time.split(':').map(Number);
    const scheduleTimeMinutes = startHour * 60 + startMinute;
    const isPast = daysUntil === 0 && scheduleTimeMinutes < currentTime;

    // If today and past, add for next week
    if (isPast) {
      daysUntil = 7;
    }

    // Only include schedules within the next 7 days
    if (daysUntil <= 7) {
      upcoming.push({ schedule, daysUntil, isPast: false });
    }
  }

  // Sort by days until (ascending), then by start time
  upcoming.sort((a, b) => {
    if (a.daysUntil !== b.daysUntil) return a.daysUntil - b.daysUntil;
    return a.schedule.start_time.localeCompare(b.schedule.start_time);
  });

  // Take max 10 and format
  return upcoming.slice(0, 10).map(({ schedule }) => ({
    scheduleId: schedule.id,
    ekskulId: schedule.extracurricular.id,
    ekskulName: schedule.extracurricular.name,
    day: getDayNameIndonesian(schedule.day_of_week),
    dayOfWeek: schedule.day_of_week,
    startTime: schedule.start_time,
    endTime: schedule.end_time,
    location: schedule.location,
  }));
}

// ============================================
// GET Handler
// ============================================

export async function GET(): Promise<NextResponse<DashboardSuccessResponse | DashboardErrorResponse>> {
  try {
    // ----------------------------------------
    // Step 1: Authenticate user
    // ----------------------------------------
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required. Please login.' },
        { status: 401 }
      );
    }

    const userRole = (sessionClaims?.public_metadata as { role?: string })?.role;
    
    if (userRole !== 'SISWA') {
      return NextResponse.json(
        { success: false, message: 'Only students can access this resource.' },
        { status: 403 }
      );
    }

    // ----------------------------------------
    // Step 2: Get or create student profile (JIT sync)
    // ----------------------------------------
    const result = await getOrCreateStudentProfile(userId, sessionClaims);

    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Student profile not found or could not be created.' },
        { status: 404 }
      );
    }

    const { studentProfile, userId: prismaUserId } = result;

    // ----------------------------------------
    // Step 3: Get user's full name
    // ----------------------------------------
    const user = await prisma.user.findUnique({
      where: { id: prismaUserId },
      select: { full_name: true },
    });

    const fullName = user?.full_name || 'Siswa';

    // ----------------------------------------
    // Step 4: Get active enrollments with extracurricular data
    // ----------------------------------------
    const activeEnrollments = await prisma.enrollment.findMany({
      where: {
        student_id: studentProfile.id,
        status: 'ACTIVE',
      },
      include: {
        extracurricular: {
          select: {
            id: true,
            name: true,
            category: true,
            status: true,
            schedules: {
              select: {
                id: true,
                day_of_week: true,
                start_time: true,
                end_time: true,
                location: true,
              },
            },
          },
        },
      },
    });

    const activeEnrollmentsCount = activeEnrollments.length;

    // ----------------------------------------
    // Step 5: Calculate attendance percentage
    // ----------------------------------------
    const allEnrollmentIds = activeEnrollments.map(e => e.id);
    
    let attendancePercentage = 0;
    
    if (allEnrollmentIds.length > 0) {
      const attendanceRecords = await prisma.attendance.findMany({
        where: {
          enrollment_id: { in: allEnrollmentIds },
        },
        select: { status: true },
      });

      const totalRecords = attendanceRecords.length;
      if (totalRecords > 0) {
        // PRESENT, SICK, PERMISSION = attended; ALPHA = absent
        const attendedCount = attendanceRecords.filter(
          r => r.status === 'PRESENT' || r.status === 'SICK' || r.status === 'PERMISSION'
        ).length;
        attendancePercentage = Math.round((attendedCount / totalRecords) * 100);
      }
    }

    // ----------------------------------------
    // Step 6: Count schedules this week
    // ----------------------------------------
    const now = new Date();
    const todayDayIndex = now.getDay();
    const currentDayNames = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
    
    // Get remaining days of this week (including today)
    const remainingDays: string[] = [];
    for (let i = todayDayIndex; i <= 6; i++) {
      remainingDays.push(currentDayNames[i]);
    }
    // Also add English variations
    const englishDays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    for (let i = todayDayIndex; i <= 6; i++) {
      remainingDays.push(englishDays[i]);
    }

    // Collect all schedules from active enrollments
    const allSchedules: Array<{
      id: string;
      day_of_week: string;
      start_time: string;
      end_time: string;
      location: string;
      extracurricular: { id: string; name: string };
    }> = [];

    for (const enrollment of activeEnrollments) {
      for (const schedule of enrollment.extracurricular.schedules) {
        allSchedules.push({
          ...schedule,
          extracurricular: {
            id: enrollment.extracurricular.id,
            name: enrollment.extracurricular.name,
          },
        });
      }
    }

    // Count schedules for remaining days of this week
    const schedulesThisWeek = allSchedules.filter(s => 
      remainingDays.includes(s.day_of_week.toUpperCase())
    ).length;

    // ----------------------------------------
    // Step 7: Get new announcements count (last 7 days)
    // ----------------------------------------
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const extracurricularIds = activeEnrollments.map(e => e.extracurricular.id);
    
    let newAnnouncementsCount = 0;
    
    if (extracurricularIds.length > 0) {
      newAnnouncementsCount = await prisma.announcement.count({
        where: {
          extracurricular_id: { in: extracurricularIds },
          created_at: { gte: sevenDaysAgo },
        },
      });
    }

    // ----------------------------------------
    // Step 8: Get my ekskul list
    // ----------------------------------------
    const myEkskul = activeEnrollments.map(e => ({
      enrollmentId: e.id,
      id: e.extracurricular.id,
      name: e.extracurricular.name,
      category: e.extracurricular.category,
      status: e.status,
    }));

    // ----------------------------------------
    // Step 9: Get upcoming schedules (max 10)
    // ----------------------------------------
    const upcomingSchedules = getUpcomingSchedules(allSchedules);

    // ----------------------------------------
    // Step 10: Get recent announcements
    // ----------------------------------------
    let recentAnnouncements: DashboardSuccessResponse['data']['recentAnnouncements'] = [];
    
    if (extracurricularIds.length > 0) {
      const announcements = await prisma.announcement.findMany({
        where: {
          extracurricular_id: { in: extracurricularIds },
        },
        include: {
          extracurricular: {
            select: { name: true },
          },
        },
        orderBy: { created_at: 'desc' },
        take: 5,
      });

      recentAnnouncements = announcements.map(a => ({
        id: a.id,
        title: a.title,
        ekskulName: a.extracurricular.name,
        createdAt: a.created_at,
        relativeTime: getRelativeTimeString(a.created_at),
      }));
    }

    // ----------------------------------------
    // Step 11: Return dashboard data
    // ----------------------------------------
    return NextResponse.json({
      success: true,
      data: {
        user: { fullName },
        stats: {
          activeEnrollmentsCount,
          attendancePercentage,
          schedulesThisWeek,
          newAnnouncementsCount,
        },
        myEkskul,
        upcomingSchedules,
        recentAnnouncements,
      },
    });

  } catch (error) {
    console.error('[STUDENT DASHBOARD ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
