/**
 * PEMBINA Enrollment Requests Page
 *
 * View and approve/reject pending enrollments.
 * CONSTRAINTS: No bulk actions, one-by-one only.
 *
 * @module app/(dashboard)/pembina/ekstrakurikuler/[id]/enrollments/page
 */

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";

import { validatePembinaOwnership } from "@/lib/pembina-ekstrakurikuler-data";
import { getPendingEnrollments } from "@/lib/pembina-enrollment-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EnrollmentList } from "./_components/EnrollmentList";

// ============================================
// Page Component
// ============================================

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EnrollmentsPage({ params }: PageProps) {
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

  const pendingEnrollments = await getPendingEnrollments(id);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Permintaan Bergabung 👋
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Setujui atau tolak permintaan siswa untuk bergabung.
        </p>
      </div>

      {/* Pending Enrollments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Menunggu Persetujuan</CardTitle>
          <CardDescription>
            {pendingEnrollments.length === 0
              ? "Tidak ada permintaan yang menunggu."
              : `${pendingEnrollments.length} permintaan menunggu persetujuan`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EnrollmentList
            enrollments={pendingEnrollments}
            extracurricularId={id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
