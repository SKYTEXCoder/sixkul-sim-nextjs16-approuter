"use client";

/**
 * Create Announcement Form Component
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createAnnouncementAction } from "../actions";

interface CreateAnnouncementFormProps {
  extracurricularId: string;
}

export function CreateAnnouncementForm({
  extracurricularId,
}: CreateAnnouncementFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);

    try {
      const result = await createAnnouncementAction(
        extracurricularId,
        formData,
      );

      if (result.success) {
        toast.success("Pengumuman berhasil dibuat!");
        (
          document.getElementById("announcement-form") as HTMLFormElement
        )?.reset();
        router.refresh();
      } else {
        toast.error(result.error || "Gagal membuat pengumuman");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form id="announcement-form" action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Judul</Label>
        <Input
          id="title"
          name="title"
          placeholder="Masukkan judul pengumuman"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Isi Pengumuman</Label>
        <Textarea
          id="content"
          name="content"
          placeholder="Tulis isi pengumuman di sini..."
          rows={4}
          required
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Kirim Pengumuman
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
