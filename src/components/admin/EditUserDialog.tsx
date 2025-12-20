"use client";

/**
 * EditUserDialog Component
 *
 * Modal dialog for editing existing user details (name, role).
 * Submits to PUT /api/admin/users/[id] API.
 *
 * @module components/admin/EditUserDialog
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Edit, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type UserRole = "ADMIN" | "PEMBINA" | "SISWA";

interface EditUserDialogProps {
  userId: string;
  currentName: string;
  currentRole: UserRole;
}

export function EditUserDialog({
  userId,
  currentName,
  currentRole,
}: EditUserDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [fullName, setFullName] = useState(currentName);
  const [role, setRole] = useState<UserRole>(currentRole);

  // Reset form to current values when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setFullName(currentName);
      setRole(currentRole);
    }
    setOpen(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!fullName.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Gagal memperbarui user", {
          description: data.errors?.join(", "),
        });
        return;
      }

      toast.success("User berhasil diperbarui!", {
        description: `${fullName} (${role})`,
      });

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Update user error:", error);
      toast.error("Gagal terhubung ke server", {
        description: "Silakan coba lagi nanti.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Ubah informasi pengguna. Klik simpan setelah selesai.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Full Name */}
            <div className="grid gap-2">
              <Label htmlFor="fullName">Nama Lengkap *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                disabled={isLoading}
                required
              />
            </div>

            {/* Role */}
            <div className="grid gap-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
                disabled={isLoading}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SISWA" className="cursor-pointer">
                    SISWA
                  </SelectItem>
                  <SelectItem value="PEMBINA" className="cursor-pointer">
                    PEMBINA
                  </SelectItem>
                  <SelectItem value="ADMIN" className="cursor-pointer">
                    ADMIN
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Mengubah role akan mempengaruhi akses pengguna.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
