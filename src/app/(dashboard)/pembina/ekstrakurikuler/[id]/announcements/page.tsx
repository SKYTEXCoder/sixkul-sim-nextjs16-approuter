/**
 * PEMBINA Announcements Page
 *
 * Create and manage announcements for an extracurricular.
 *
 * @module app/(dashboard)/pembina/ekstrakurikuler/[id]/announcements/page
 */

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";

import { validatePembinaOwnership } from "@/lib/pembina-ekstrakurikuler-data";
import { getAnnouncementsByExtracurricular } from "@/lib/pembina-announcement-data";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateAnnouncementForm } from "./_components/CreateAnnouncementForm";
import { AnnouncementList } from "./_components/AnnouncementList";

// ============================================
// Page Component
// ============================================

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function PembinaEkskulAnnouncementsPage({
  params,
}: PageProps) {
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

  // Get current user's internal ID for author matching
  const user = await prisma.user.findUnique({
    where: { clerk_id: userId },
    select: { id: true },
  });

  const announcements = await getAnnouncementsByExtracurricular(id);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Pengumuman 📢
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Buat dan kelola pengumuman untuk anggota ekstrakurikuler.
        </p>
      </div>

      {/* Create Announcement Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buat Pengumuman Baru</CardTitle>
          <CardDescription>
            Pengumuman akan terlihat oleh semua anggota aktif.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateAnnouncementForm extracurricularId={id} />
        </CardContent>
      </Card>

      {/* Existing Announcements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pengumuman yang Ada</CardTitle>
          <CardDescription>
            {announcements.length === 0
              ? "Belum ada pengumuman."
              : `${announcements.length} pengumuman`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnnouncementList
            announcements={announcements}
            extracurricularId={id}
            currentUserId={user?.id || ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
