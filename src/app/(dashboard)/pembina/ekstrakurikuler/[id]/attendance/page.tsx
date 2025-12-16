/**
 * PEMBINA Session-Based Attendance Page
 *
 * Record attendance per SESSION (not schedule).
 *
 * CRITICAL: This is the ONLY valid attendance implementation.
 * - Session selector (dropdown), NOT calendar date picker
 * - Attendance tied to session_id (REQUIRED)
 * - No schedule-based selection
 *
 * @module app/(dashboard)/pembina/ekstrakurikuler/[id]/attendance/page
 */

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";

import { validatePembinaOwnership } from "@/lib/pembina-ekstrakurikuler-data";
import {
  getSessionsForAttendance,
  getActiveEnrollments,
} from "@/lib/pembina-attendance-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AttendanceForm } from "./_components/AttendanceForm";

// ============================================
// Page Component
// ============================================

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AttendancePage({ params }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;

  // Validate ownership
  const isOwner = await validatePembinaOwnership(id, userId);
  if (!isOwner) {
    notFound();
  }

  const [sessions, enrollments] = await Promise.all([
    getSessionsForAttendance(id),
    getActiveEnrollments(id),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Input Absensi 📋
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Catat kehadiran anggota per pertemuan.
        </p>
      </div>

      {/* Attendance Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Absensi Pertemuan</CardTitle>
          <CardDescription>
            Pilih pertemuan, lalu isi status kehadiran setiap anggota.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceForm
            sessions={sessions}
            enrollments={enrollments}
            extracurricularId={id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
