import { Suspense } from "react";
import { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { AnnouncementList } from "@/components/admin/announcements/AnnouncementList";
import { getSystemAnnouncements } from "@/lib/actions/admin-announcements";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Pengumuman Sekolah | SIXKUL",
  description: "Informasi dan pengumuman terbaru dari sekolah.",
};

export const dynamic = "force-dynamic";

export default async function PembinaAnnouncementsPage() {
  const announcements = await getSystemAnnouncements();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengumuman Sekolah"
        description="Informasi terbaru seputar kegiatan sekolah dan ekstrakurikuler."
      />

      <Suspense fallback={<AnnouncementsSkeleton />}>
        <AnnouncementList announcements={announcements} />
      </Suspense>
    </div>
  );
}

function AnnouncementsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-40" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
