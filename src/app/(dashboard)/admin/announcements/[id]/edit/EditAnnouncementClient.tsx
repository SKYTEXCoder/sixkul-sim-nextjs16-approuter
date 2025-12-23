"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AnnouncementForm } from "@/components/admin/announcements/AnnouncementForm";
import { updateSystemAnnouncement } from "@/lib/actions/admin-announcements";
import {
  AdminAnnouncementInput,
  AnnouncementScope,
} from "@/lib/schemas/admin-announcement-schema";

interface EditAnnouncementClientProps {
  announcement: {
    id: string;
    title: string;
    content: string;
  };
}

export function EditAnnouncementClient({
  announcement,
}: EditAnnouncementClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: AdminAnnouncementInput) => {
    setIsSubmitting(true);
    try {
      const result = await updateSystemAnnouncement(announcement.id, data);
      if (result.success) {
        toast.success("Pengumuman berhasil diperbarui");
        router.push("/admin/announcements");
        router.refresh();
      } else {
        toast.error(result.error || "Gagal memperbarui pengumuman");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnnouncementForm
      defaultValues={{
        title: announcement.title,
        content: announcement.content,
        scope: AnnouncementScope.SYSTEM,
      }}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Simpan Perubahan"
    />
  );
}
