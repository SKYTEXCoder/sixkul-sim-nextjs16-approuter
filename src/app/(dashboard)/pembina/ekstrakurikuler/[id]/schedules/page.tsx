/**
 * PEMBINA Schedule Templates Page
 *
 * Manage recurring schedule templates for an extracurricular.
 *
 * @module app/(dashboard)/pembina/ekstrakurikuler/[id]/schedules/page
 */

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";

import { validatePembinaOwnership } from "@/lib/pembina-ekstrakurikuler-data";
import {
  getSchedulesByExtracurricular,
  getDayLabel,
} from "@/lib/pembina-schedule-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScheduleList } from "./_components/ScheduleList";
import { CreateScheduleForm } from "./_components/CreateScheduleForm";

// ============================================
// Page Component
// ============================================

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SchedulesPage({ params }: PageProps) {
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

  const schedules = await getSchedulesByExtracurricular(id);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Jadwal Rutin 📅
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kelola template jadwal mingguan untuk ekstrakurikuler ini.
        </p>
      </div>

      {/* Create Schedule Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tambah Jadwal Baru</CardTitle>
          <CardDescription>
            Buat template jadwal rutin yang akan digunakan untuk generate
            pertemuan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateScheduleForm extracurricularId={id} />
        </CardContent>
      </Card>

      {/* Existing Schedules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Jadwal yang Ada</CardTitle>
          <CardDescription>
            {schedules.length === 0
              ? "Belum ada jadwal rutin yang dibuat."
              : `${schedules.length} jadwal rutin`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleList
            schedules={schedules}
            extracurricularId={id}
            getDayLabel={getDayLabel}
          />
        </CardContent>
      </Card>
    </div>
  );
}
