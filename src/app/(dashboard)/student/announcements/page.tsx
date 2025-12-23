import { Suspense } from "react";
import { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { AnnouncementList } from "@/components/announcements/AnnouncementList";
import { getStudentAnnouncements } from "@/lib/announcements-data";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Pengumuman | Student Portal",
  description: "Lihat pengumuman sekolah dan ekstrakurikuler",
};

export default async function StudentAnnouncementsPage() {
  const result = await getStudentAnnouncements();
  const announcements =
    result.success && result.data ? result.data.announcements : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengumuman Sekolah"
        description="Informasi terbaru seputar kegiatan sekolah dan ekstrakurikuler."
      />

      <Suspense fallback={<AnnouncementsSkeleton />}>
        <AnnouncementList
          announcements={announcements}
          viewMode="global"
          searchQuery=""
        />
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
