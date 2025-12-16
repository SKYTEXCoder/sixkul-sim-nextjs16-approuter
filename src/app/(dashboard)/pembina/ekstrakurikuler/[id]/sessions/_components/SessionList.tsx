"use client";

/**
 * Session List Component
 *
 * Displays sessions with delete functionality.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  MapPin,
  Trash2,
  Loader2,
  AlertCircle,
  Calendar,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { deleteSessionAction } from "../actions";

interface Session {
  id: string;
  date: Date;
  start_time: string;
  end_time: string;
  location: string;
  notes: string | null;
  is_cancelled: boolean;
  attendanceCount: number;
}

interface SessionListProps {
  sessions: Session[];
  extracurricularId: string;
  showStatus?: boolean;
  isPast?: boolean;
}

export function SessionList({
  sessions,
  extracurricularId,
  showStatus,
  isPast,
}: SessionListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(sessionId: string) {
    setDeletingId(sessionId);

    try {
      const result = await deleteSessionAction(sessionId, extracurricularId);

      if (result.success) {
        toast.success("Pertemuan berhasil dihapus!");
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menghapus pertemuan");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeletingId(null);
    }
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400">
          {isPast
            ? "Belum ada pertemuan yang telah berlalu."
            : "Belum ada pertemuan mendatang. Generate pertemuan di atas."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const canDelete = session.attendanceCount === 0;
        const sessionDate = new Date(session.date);

        return (
          <div
            key={session.id}
            className={`flex items-center justify-between p-4 rounded-lg border ${
              isPast
                ? "bg-slate-50/50 dark:bg-slate-900/50"
                : "bg-slate-50 dark:bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-6 flex-wrap">
              {/* Date */}
              <div className="flex items-center gap-2 min-w-[180px]">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span
                  className={`font-medium ${
                    isPast ? "text-slate-500" : "text-slate-900 dark:text-white"
                  }`}
                >
                  {format(sessionDate, "EEEE, dd MMM yyyy", {
                    locale: idLocale,
                  })}
                </span>
              </div>

              {/* Time */}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600 dark:text-slate-400">
                  {session.start_time} - {session.end_time}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600 dark:text-slate-400">
                  {session.location}
                </span>
              </div>

              {/* Attendance count badge */}
              {session.attendanceCount > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {session.attendanceCount} absensi
                </Badge>
              )}

              {/* Status badges */}
              {showStatus && session.is_cancelled && (
                <Badge variant="destructive">Dibatalkan</Badge>
              )}
            </div>

            {/* Delete Action */}
            {!isPast && canDelete ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={deletingId === session.id}
                  >
                    {deletingId === session.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Pertemuan?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Pertemuan tanggal{" "}
                      {format(sessionDate, "dd MMMM yyyy", {
                        locale: idLocale,
                      })}{" "}
                      akan dihapus. Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(session.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : !isPast && !canDelete ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <AlertCircle className="h-4 w-4" />
                <span>Ada absensi</span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
