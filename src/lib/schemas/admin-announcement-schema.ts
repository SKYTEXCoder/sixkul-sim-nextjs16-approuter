import { z } from "zod";

// Replicating Prisma Enum to avoid importing full Prisma Client in client-side code
// This ensures the schema can be safely used in client components without bundling the Prisma engine
export enum AnnouncementScope {
  EXTRACURRICULAR = "EXTRACURRICULAR",
  SYSTEM = "SYSTEM",
}

export const adminAnnouncementSchema = z.object({
  title: z
    .string()
    .min(1, "Judul pengumuman harus diisi")
    .max(255, "Judul terlalu panjang (maksimal 255 karakter)"),
  content: z.string().min(1, "Konten pengumuman harus diisi"),
  // For Admin announcements, we force SYSTEM scope
  scope: z.nativeEnum(AnnouncementScope),
  // System announcements do not have an extracurricular_id
  extracurricular_id: z.null().optional(),
});

export type AdminAnnouncementInput = z.infer<typeof adminAnnouncementSchema>;
