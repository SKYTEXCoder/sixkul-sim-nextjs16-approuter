import { notFound } from "next/navigation";
import Link from "next/link";
import { Edit2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSystemAnnouncementById } from "@/lib/actions/admin-announcements";
import { AnnouncementDetail } from "@/components/admin/announcements/AnnouncementDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminAnnouncementDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  const announcement = await getSystemAnnouncementById(id);

  if (!announcement) {
    notFound();
  }

  const actions = (
    <Button asChild variant="outline" size="sm">
      <Link href={`/admin/announcements/${id}/edit`}>
        <Edit2 className="w-4 h-4 mr-2" />
        Edit Pengumuman
      </Link>
    </Button>
  );

  return (
    <AnnouncementDetail
      announcement={announcement}
      backUrl="/admin/announcements"
      actions={actions}
    />
  );
}
