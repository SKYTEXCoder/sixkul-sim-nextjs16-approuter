import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { getSystemAnnouncementById } from "@/lib/actions/admin-announcements";
import { EditAnnouncementClient } from "./EditAnnouncementClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAnnouncementPage({ params }: PageProps) {
  const { id } = await params;
  const announcement = await getSystemAnnouncementById(id);

  if (!announcement) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Edit Pengumuman"
        description="Perbarui informasi pengumuman yang sudah dipublikasikan."
      />

      <div className="p-6 border rounded-xl bg-card shadow-sm">
        <EditAnnouncementClient announcement={announcement} />
      </div>
    </div>
  );
}
