/**
 * PEMBINA Sessions Page
 *
 * List and generate sessions for an extracurricular.
 *
 * @module app/(dashboard)/pembina/ekstrakurikuler/[id]/sessions/page
 */

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";

import { validatePembinaOwnership } from "@/lib/pembina-ekstrakurikuler-data";
import { getSessionsByExtracurricular } from "@/lib/pembina-session-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SessionList } from "./_components/SessionList";
import { GenerateSessionsForm } from "./_components/GenerateSessionsForm";

// ============================================
// Page Component
// ============================================

interface PageProps {
  params: { id: string };
}

export const dynamic = "force-dynamic";

export default async function SessionsPage({ params }: PageProps) {
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

  const sessions = await getSessionsByExtracurricular(id);

  // Separate upcoming and past sessions
  const now = new Date();
  const upcomingSessions = sessions.filter((s) => new Date(s.date) >= now);
  const pastSessions = sessions.filter((s) => new Date(s.date) < now);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Pertemuan 📆
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kelola pertemuan ekstrakurikuler. Generate pertemuan dari jadwal
          rutin.
        </p>
      </div>

      {/* Generate Sessions Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate Pertemuan</CardTitle>
          <CardDescription>
            Buat pertemuan untuk rentang tanggal berdasarkan jadwal rutin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenerateSessionsForm extracurricularId={id} />
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pertemuan Mendatang</CardTitle>
          <CardDescription>
            {upcomingSessions.length === 0
              ? "Tidak ada pertemuan mendatang."
              : `${upcomingSessions.length} pertemuan mendatang`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SessionList
            sessions={upcomingSessions}
            extracurricularId={id}
            showStatus
          />
        </CardContent>
      </Card>

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pertemuan Lalu</CardTitle>
            <CardDescription>
              {pastSessions.length} pertemuan yang telah berlalu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SessionList
              sessions={pastSessions}
              extracurricularId={id}
              isPast
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
