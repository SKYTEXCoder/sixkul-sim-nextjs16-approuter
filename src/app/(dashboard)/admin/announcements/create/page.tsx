"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { AnnouncementForm } from "@/components/admin/announcements/AnnouncementForm";
import { createSystemAnnouncement } from "@/lib/actions/admin-announcements";
import { AdminAnnouncementInput } from "@/lib/schemas/admin-announcement-schema";

export default function CreateAnnouncementPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: AdminAnnouncementInput) => {
    setIsSubmitting(true);
    try {
      const result = await createSystemAnnouncement(data);
      if (result.success) {
        toast.success("Pengumuman berhasil dibuat");
        router.push("/admin/announcements");
      } else {
        toast.error(result.error || "Gagal membuat pengumuman");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Button
          variant="ghost"
          className="mb-4 pl-0 hover:pl-2 transition-all"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <PageHeader
          title="Buat Pengumuman Baru"
          description="Informasi ini akan dikirimkan kepada seluruh pengguna sistem."
        />
      </div>

      <div className="p-6 border rounded-xl bg-card shadow-sm">
        <AnnouncementForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Publikasikan Pengumuman"
        />
      </div>
    </div>
  );
}
