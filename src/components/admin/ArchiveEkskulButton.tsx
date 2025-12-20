"use client";

/**
 * ArchiveEkskulButton Component
 *
 * Button with confirmation dialog for archiving (soft-deleting) extracurriculars.
 * Submits to DELETE /api/admin/ekstrakurikuler/[id] API.
 *
 * @module components/admin/ArchiveEkskulButton
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Archive } from "lucide-react";
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
import { Button } from "@/components/ui/button";

interface ArchiveEkskulButtonProps {
  ekskulId: string;
  ekskulName: string;
}

export function ArchiveEkskulButton({
  ekskulId,
  ekskulName,
}: ArchiveEkskulButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleArchive = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/ekstrakurikuler/${ekskulId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Gagal mengarsipkan ekstrakurikuler", {
          description: data.errors?.join(", "),
        });
        return;
      }

      toast.success("Ekstrakurikuler berhasil diarsipkan", {
        description: `${ekskulName} telah dipindahkan ke arsip.`,
      });

      // Redirect to list page after successful archive
      router.push("/admin/ekstrakurikuler");
      router.refresh();
    } catch (error) {
      console.error("Archive ekstrakurikuler error:", error);
      toast.error("Gagal terhubung ke server", {
        description: "Silakan coba lagi nanti.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer"
        >
          <Archive className="mr-2 h-4 w-4" />
          Arsipkan
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Arsipkan Ekstrakurikuler?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Ekstrakurikuler <strong>{ekskulName}</strong> akan diarsipkan.
            </p>
            <p className="text-sm text-slate-500">
              • Status akan berubah menjadi &quot;Tidak Aktif&quot;
              <br />
              • Tidak akan muncul di daftar aktif
              <br />
              • Semua data historis (pendaftaran, jadwal, absensi) tetap
              tersimpan
              <br />• Tidak ada data yang dihapus
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} className="cursor-pointer">
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleArchive();
            }}
            disabled={isLoading}
            className="bg-amber-600 hover:bg-amber-700 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mengarsipkan...
              </>
            ) : (
              "Ya, Arsipkan"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
