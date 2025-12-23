"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  adminAnnouncementSchema,
  AdminAnnouncementInput,
  AnnouncementScope,
} from "@/lib/schemas/admin-announcement-schema";

interface AnnouncementFormProps {
  defaultValues?: Partial<AdminAnnouncementInput>;
  onSubmit: (data: AdminAnnouncementInput) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function AnnouncementForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Simpan Pengumuman",
}: AnnouncementFormProps) {
  // Ensure default values are strictly typed
  const form = useForm<AdminAnnouncementInput>({
    resolver: zodResolver(adminAnnouncementSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      content: defaultValues?.content || "",
      scope: AnnouncementScope.SYSTEM, // Must match enum
      extracurricular_id: undefined, // Explicitly undefined/null if needed
    },
  });

  const handleSubmit = async (data: AdminAnnouncementInput) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Judul Pengumuman</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Libur Hari Raya..." {...field} />
              </FormControl>
              <FormDescription>
                Judul singkat dan jelas untuk pengumuman ini.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Isi Pengumuman</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tulis detail pengumuman di sini..."
                  className="min-h-[200px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isDirty}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {submitLabel}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
