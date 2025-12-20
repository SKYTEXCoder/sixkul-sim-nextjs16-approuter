"use client";

/**
 * UserStatusButton Component
 *
 * Button with confirmation dialog for activating/deactivating users.
 * Submits to PUT /api/admin/users/[id] API with is_active field.
 *
 * @module components/admin/UserStatusButton
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, UserX, UserCheck } from "lucide-react";
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

interface UserStatusButtonProps {
  userId: string;
  isActive: boolean;
  userName: string;
}

export function UserStatusButton({
  userId,
  isActive,
  userName,
}: UserStatusButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleStatusChange = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_active: !isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Gagal mengubah status user", {
          description: data.errors?.join(", "),
        });
        return;
      }

      toast.success(
        isActive ? "User berhasil dinonaktifkan" : "User berhasil diaktifkan",
        {
          description: userName,
        }
      );

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Update user status error:", error);
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
          className={
            isActive
              ? "text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
              : "text-green-600 hover:text-green-700 hover:bg-green-50 cursor-pointer"
          }
        >
          {isActive ? (
            <>
              <UserX className="mr-2 h-4 w-4" />
              Nonaktifkan User
            </>
          ) : (
            <>
              <UserCheck className="mr-2 h-4 w-4" />
              Aktifkan User
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActive ? "Nonaktifkan User?" : "Aktifkan User?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActive ? (
              <>
                User <strong>{userName}</strong> tidak akan dapat login ke
                sistem. Semua data historis akan tetap tersimpan dan dapat
                diaktifkan kembali kapan saja.
              </>
            ) : (
              <>
                User <strong>{userName}</strong> akan dapat login kembali ke
                sistem dengan akses sesuai role yang dimiliki.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading} className="cursor-pointer">
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleStatusChange();
            }}
            disabled={isLoading}
            className={
              isActive
                ? "bg-red-600 hover:bg-red-700 cursor-pointer"
                : "bg-green-600 hover:bg-green-700 cursor-pointer"
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : isActive ? (
              "Ya, Nonaktifkan"
            ) : (
              "Ya, Aktifkan"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
