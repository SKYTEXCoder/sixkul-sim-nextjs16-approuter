"use client";

/**
 * Schedule List Component
 *
 * Displays existing schedule templates with delete functionality.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

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
import { deleteScheduleAction } from "../actions";

interface Schedule {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location: string;
  sessionCount: number;
}

interface ScheduleListProps {
  schedules: Schedule[];
  extracurricularId: string;
  getDayLabel: (day: string) => string;
}

export function ScheduleList({
  schedules,
  extracurricularId,
  getDayLabel,
}: ScheduleListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(scheduleId: string) {
    setDeletingId(scheduleId);

    try {
      const result = await deleteScheduleAction(scheduleId, extracurricularId);

      if (result.success) {
        toast.success("Jadwal berhasil dihapus!");
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menghapus jadwal");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeletingId(null);
    }
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400">
          Belum ada jadwal rutin. Tambahkan jadwal pertama di atas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {schedules.map((schedule) => {
        const canDelete = schedule.sessionCount === 0;

        return (
          <div
            key={schedule.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-slate-50 dark:bg-slate-900"
          >
            <div className="flex items-center gap-6">
              {/* Day */}
              <div className="flex items-center gap-2 min-w-[100px]">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span className="font-medium text-slate-900 dark:text-white">
                  {getDayLabel(schedule.day_of_week)}
                </span>
              </div>

              {/* Time */}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600 dark:text-slate-400">
                  {schedule.start_time} - {schedule.end_time}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600 dark:text-slate-400">
                  {schedule.location}
                </span>
              </div>

              {/* Session count badge */}
              {schedule.sessionCount > 0 && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                  {schedule.sessionCount} pertemuan
                </span>
              )}
            </div>

            {/* Delete Action */}
            {canDelete ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={deletingId === schedule.id}
                  >
                    {deletingId === schedule.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Jadwal?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Jadwal {getDayLabel(schedule.day_of_week)} (
                      {schedule.start_time} - {schedule.end_time}) akan dihapus.
                      Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(schedule.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <AlertCircle className="h-4 w-4" />
                <span>Tidak dapat dihapus</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
