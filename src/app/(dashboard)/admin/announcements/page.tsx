import { Suspense } from "react";
import { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { AnnouncementList } from "@/components/admin/announcements/AnnouncementList";
import { getSystemAnnouncements } from "@/lib/actions/admin-announcements";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Kelola Pengumuman | Admin SIXKUL",
  description: "Buat dan kelola pengumuman sistem untuk seluruh sekolah.",
};

export default async function AdminAnnouncementsPage() {
  const announcements = await getSystemAnnouncements();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengumuman Admin"
        description="Kelola informasi dan pengumuman yang akan ditampilkan kepada seluruh pengguna."
      />

      <Suspense fallback={<AnnouncementsSkeleton />}>
        <AnnouncementList announcements={announcements} isAdminView={true} />
      </Suspense>
    </div>
  );
}

function AnnouncementsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
