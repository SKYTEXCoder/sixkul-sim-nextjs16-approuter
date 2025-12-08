"use client";

/**
 * Join Button Client Component
 * 
 * Handles enrollment to extracurricular with API integration.
 * Implements the Pendaftaran Ekstrakurikuler sequence diagram logic.
 * 
 * @module components/ekskul/JoinButton
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, CheckCircle2 } from "lucide-react";

// ============================================
// Types
// ============================================

interface JoinButtonProps {
  ekskulId: string;
  ekskulName: string;
  isAlreadyEnrolled?: boolean;
  enrollmentStatus?: string;
}

interface EnrollmentResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    status: string;
  };
}

// ============================================
// Component
// ============================================

export function JoinButton({
  ekskulId,
  ekskulName,
  isAlreadyEnrolled = false,
  enrollmentStatus,
}: JoinButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // ----------------------------------------
  // Handle Enrollment
  // ----------------------------------------
  const handleJoin = async () => {
    setIsLoading(true);

    try {
      // ----------------------------------------
      // Step 1: POST to /api/enrollment
      // ----------------------------------------
      const response = await fetch("/api/enrollment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extracurricularId: ekskulId,
        }),
      });

      const result: EnrollmentResponse = await response.json();

      // ----------------------------------------
      // Step 2: Handle Response
      // ----------------------------------------
      if (!response.ok) {
        // Handle 409 Conflict - Already registered
        if (response.status === 409) {
          toast.warning("Sudah Terdaftar", {
            description: result.message || "Anda sudah terdaftar di ekstrakurikuler ini.",
          });
          return;
        }

        // Handle 401 Unauthorized
        if (response.status === 401) {
          toast.error("Autentikasi Diperlukan", {
            description: "Silakan login terlebih dahulu.",
          });
          router.push("/login");
          return;
        }

        // Handle 403 Forbidden
        if (response.status === 403) {
          toast.error("Akses Ditolak", {
            description: "Hanya siswa yang dapat mendaftar ekstrakurikuler.",
          });
          return;
        }

        // Handle other errors
        toast.error("Pendaftaran Gagal", {
          description: result.message || "Terjadi kesalahan. Silakan coba lagi.",
        });
        return;
      }

      // ----------------------------------------
      // Step 3: Success - Show notification and refresh
      // ----------------------------------------
      toast.success("Pendaftaran Berhasil! 🎉", {
        description: `Anda telah mendaftar ke ${ekskulName}. Menunggu persetujuan pembina.`,
      });

      // Refresh page to update UI
      router.refresh();

    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("Terjadi Kesalahan", {
        description: "Tidak dapat terhubung ke server. Silakan coba lagi.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------
  // Render based on enrollment status
  // ----------------------------------------
  if (isAlreadyEnrolled) {
    const statusConfig: Record<string, { label: string; className: string }> = {
      PENDING: {
        label: "Menunggu Persetujuan",
        className: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400",
      },
      APPROVED: {
        label: "Sudah Terdaftar",
        className: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400",
      },
      REJECTED: {
        label: "Ditolak",
        className: "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400",
      },
    };

    const config = statusConfig[enrollmentStatus || "PENDING"] || statusConfig.PENDING;

    return (
      <Button
        disabled
        className={`w-full ${config.className} border cursor-not-allowed`}
        variant="outline"
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        {config.label}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleJoin}
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Mendaftar...
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Daftar Sekarang
        </>
      )}
    </Button>
  );
}

export default JoinButton;
