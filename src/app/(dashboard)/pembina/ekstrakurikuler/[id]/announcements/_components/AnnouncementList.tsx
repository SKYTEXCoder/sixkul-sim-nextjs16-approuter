"use client";

/**
 * Announcement List Component
 *
 * Displays announcements with author-only delete.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, Megaphone, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteAnnouncementAction } from "../actions";

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  authorId: string;
  authorName: string;
}

interface AnnouncementListProps {
  announcements: Announcement[];
  extracurricularId: string;
  currentUserId: string;
}

export function AnnouncementList({
  announcements,
  extracurricularId,
  currentUserId,
}: AnnouncementListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(announcementId: string) {
    setDeletingId(announcementId);

    try {
      const result = await deleteAnnouncementAction(
        announcementId,
        extracurricularId,
      );

      if (result.success) {
        toast.success("Pengumuman berhasil dihapus!");
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menghapus pengumuman");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeletingId(null);
    }
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-8">
        <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400">
          Belum ada pengumuman. Buat pengumuman pertama di atas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => {
        const isAuthor = announcement.authorId === currentUserId;

        return (
          <div
            key={announcement.id}
            className="p-4 rounded-lg border bg-slate-50 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {announcement.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 whitespace-pre-wrap">
                  {announcement.content}
                </p>
                <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                  <span>{announcement.authorName}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {format(
                        new Date(announcement.createdAt),
                        "dd MMM yyyy, HH:mm",
                        {
                          locale: idLocale,
                        },
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delete Button - Author only */}
              {isAuthor && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                      disabled={deletingId === announcement.id}
                    >
                      {deletingId === announcement.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Pengumuman?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Pengumuman &quot;{announcement.title}&quot; akan
                        dihapus. Tindakan ini tidak dapat dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(announcement.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
