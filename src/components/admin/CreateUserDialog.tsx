"use client";

/**
 * CreateUserDialog Component
 *
 * Modal dialog for creating new users with role-specific fields.
 * Submits to /api/admin/users API.
 *
 * @module components/admin/CreateUserDialog
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, Loader2 } from "lucide-react";
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

interface CreateUserDialogProps {
  onSuccess?: () => void;
}

const DEFAULT_PASSWORD = "rtx5070ti16gb";

export function CreateUserDialog({ onSuccess }: CreateUserDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [role, setRole] = useState<UserRole>("SISWA");
  const [specificId, setSpecificId] = useState("");
  const [className, setClassName] = useState("");
  const [major, setMajor] = useState("");
  const [expertise, setExpertise] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword(DEFAULT_PASSWORD);
    setRole("SISWA");
    setSpecificId("");
    setClassName("");
    setMajor("");
    setExpertise("");
    setPhoneNumber("");
    setErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          specificId,
          className: role === "SISWA" ? className : undefined,
          major: role === "SISWA" ? major : undefined,
          expertise: role === "PEMBINA" ? expertise : undefined,
          phoneNumber: phoneNumber || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors([data.message || "Terjadi kesalahan"]);
        }
        return;
      }

      toast.success(`User ${role} berhasil dibuat!`, {
        description: `Email: ${email}`,
      });

      resetForm();
      setOpen(false);
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error("Create user error:", error);
      setErrors(["Gagal terhubung ke server"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700 cursor-pointer">
          <UserPlus className="mr-2 h-4 w-4" />
          Tambah User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah User Baru</DialogTitle>
            <DialogDescription>
              Buat akun user baru untuk sistem SIXKUL.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Error Display */}
            {errors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password untuk user baru"
                required
              />
              <p className="text-xs text-slate-500">
                Password default: {DEFAULT_PASSWORD}
              </p>
            </div>

            {/* Role */}
            <div className="grid gap-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as UserRole)}
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
            </div>

            {/* Specific ID (NIS/NIP) */}
            {(role === "SISWA" || role === "PEMBINA") && (
              <div className="grid gap-2">
                <Label htmlFor="specificId">
                  {role === "SISWA" ? "NIS" : "NIP"} *
                </Label>
                <Input
                  id="specificId"
                  value={specificId}
                  onChange={(e) => setSpecificId(e.target.value)}
                  placeholder={
                    role === "SISWA"
                      ? "Nomor Induk Siswa"
                      : "Nomor Induk Pegawai"
                  }
                  required
                />
              </div>
            )}

            {/* SISWA-specific fields */}
            {role === "SISWA" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="className">Kelas *</Label>
                  <Input
                    id="className"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="Contoh: XII IPA 1"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="major">Jurusan *</Label>
                  <Input
                    id="major"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="Contoh: IPA"
                    required
                  />
                </div>
              </>
            )}

            {/* PEMBINA-specific fields */}
            {role === "PEMBINA" && (
              <div className="grid gap-2">
                <Label htmlFor="expertise">Keahlian</Label>
                <Input
                  id="expertise"
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  placeholder="Contoh: Olahraga, Musik"
                />
              </div>
            )}

            {/* Phone Number (Optional) */}
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Nomor Telepon</Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
