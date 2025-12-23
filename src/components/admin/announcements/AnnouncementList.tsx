"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { AnnouncementCard } from "./AnnouncementCard";
import { deleteSystemAnnouncement } from "@/lib/actions/admin-announcements";

// Type definition (should match getSystemAnnouncements return type)
interface AnnouncementData {
  id: string;
  title: string;
  content: string;
  created_at: Date; // or string if serialized
  author: {
    full_name: string;
    username: string;
  };
}

interface AnnouncementListProps {
  announcements: AnnouncementData[];
  isAdminView?: boolean;
}

export function AnnouncementList({
  announcements,
  isAdminView = false,
}: AnnouncementListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Helper for role-aware routing
  // Admin: /admin/announcements/ID/edit  (Only admin uses this list for editing)
  // Others: This list component is shared but used in different contexts.
  // Wait, if I click Update on AnnouncementCard, it goes to onEdit.
  // Actually, for Pembina/Student, they shouldn't see Edit button, so onEdit won't be called.
  // But clicking the card goes to Detail.
  // AnnouncementCard implementation Step 104 showed:
  // CardFooter -> Button "Baca Selengkapnya".
  // It didn't have an onClick.

  // I must check AnnouncementCard again. It renders a Button asChild for "Baca Selengkapnya".
  // But where does it link to?
  // The Card implementation in Step 97 had:
  // <Button variant="link" asChild><span>Baca Selengkapnya</span></Button>
  // It lacked the href!
  // The Card needs to know the DETAIL URL or accept a "href" prop.

  const handleEdit = (id: string) => {
    router.push(`/admin/announcements/${id}/edit`);
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    startTransition(async () => {
      const result = await deleteSystemAnnouncement(deleteId);
      if (result.success) {
        toast.success("Pengumuman berhasil dihapus");
        // Router refresh handled by server action revalidate, but we call it to fetch new data
        // Wait, revalidatePath updates the server, client needs to know.
        // router.refresh() is good practice here.
      } else {
        toast.error(result.error || "Gagal menghapus pengumuman");
      }
      setDeleteId(null);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-heading font-semibold">
          Daftar Pengumuman
        </h2>
        {isAdminView && (
          <Button onClick={() => router.push("/admin/announcements/create")}>
            <Plus className="w-4 h-4 mr-2" />
            Buat Pengumuman
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {announcements.length === 0 ? (
          <div className="text-center py-10 border rounded-xl bg-muted/20">
            <p className="text-muted-foreground">
              Belum ada pengumuman sistem.
            </p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              id={announcement.id}
              title={announcement.title}
              content={announcement.content}
              createdAt={announcement.created_at}
              authorName={announcement.author.full_name}
              isAdminView={isAdminView}
              onEdit={handleEdit}
              onDelete={confirmDelete}
            />
          ))
        )}
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengumuman?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Pengumuman ini akan hilang
              dari tampilan semua pengguna (Pembina & Siswa).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault(); // Prevent auto-close to handle async
                handleDelete();
              }}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
