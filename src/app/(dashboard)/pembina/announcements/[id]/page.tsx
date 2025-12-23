import { notFound } from "next/navigation";
import { getSystemAnnouncementById } from "@/lib/actions/admin-announcements";
import { AnnouncementDetail } from "@/components/admin/announcements/AnnouncementDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PembinaAnnouncementDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  const announcement = await getSystemAnnouncementById(id);

  if (!announcement) {
    notFound();
  }

  return (
    <AnnouncementDetail
      announcement={announcement}
      backUrl="/pembina/announcements"
    />
  );
}
