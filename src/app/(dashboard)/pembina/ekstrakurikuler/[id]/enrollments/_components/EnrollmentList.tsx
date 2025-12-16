"use client";

/**
 * Enrollment List Component
 *
 * Displays pending enrollments with approve/reject actions.
 * CONSTRAINTS: One-by-one actions only, no bulk operations.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2, UserPlus, Clock } from "lucide-react";
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
import { approveEnrollmentAction, rejectEnrollmentAction } from "../actions";

interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentNis: string;
  requestedAt: Date;
}

interface EnrollmentListProps {
  enrollments: Enrollment[];
  extracurricularId: string;
}

export function EnrollmentList({
  enrollments,
  extracurricularId,
}: EnrollmentListProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function handleApprove(enrollmentId: string) {
    setProcessingId(enrollmentId);

    try {
      const result = await approveEnrollmentAction(
        enrollmentId,
        extracurricularId
      );

      if (result.success) {
        toast.success("Pendaftaran berhasil disetujui!");
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menyetujui pendaftaran");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(enrollmentId: string) {
    setProcessingId(enrollmentId);

    try {
      const result = await rejectEnrollmentAction(
        enrollmentId,
        extracurricularId
      );

      if (result.success) {
        toast.success("Pendaftaran berhasil ditolak");
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menolak pendaftaran");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setProcessingId(null);
    }
  }

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-8">
        <UserPlus className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 dark:text-slate-400">
          Tidak ada permintaan bergabung saat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {enrollments.map((enrollment) => {
        const isProcessing = processingId === enrollment.id;

        return (
          <div
            key={enrollment.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-slate-50 dark:bg-slate-900"
          >
            <div className="flex items-center gap-4">
              {/* Student Info */}
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {enrollment.studentName}
                </p>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span>{enrollment.studentClass}</span>
                  <span>•</span>
                  <span>NIS: {enrollment.studentNis}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Request Date */}
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <Clock className="h-4 w-4" />
                <span>
                  {format(new Date(enrollment.requestedAt), "dd MMM yyyy", {
                    locale: idLocale,
                  })}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Approve Button */}
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleApprove(enrollment.id)}
                  disabled={isProcessing}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Setujui
                    </>
                  )}
                </Button>

                {/* Reject Button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isProcessing}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Tolak
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tolak Pendaftaran?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Pendaftaran {enrollment.studentName} akan ditolak. Siswa
                        akan menerima notifikasi penolakan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleReject(enrollment.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Tolak Pendaftaran
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
