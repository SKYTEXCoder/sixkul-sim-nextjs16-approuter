"use client";

/**
 * CreateEkskulDialog Component
 *
 * Modal dialog for creating new extracurriculars.
 * Submits to /api/admin/ekstrakurikuler API.
 *
 * @module components/admin/CreateEkskulDialog
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PembinaOption {
  id: string;
  nip: string;
  user: {
    id: string;
    full_name: string;
    email: string | null;
  };
}

interface CreateEkskulDialogProps {
  pembinas: PembinaOption[];
  onSuccess?: () => void;
}

export function CreateEkskulDialog({
  pembinas,
  onSuccess,
}: CreateEkskulDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [pembinaId, setPembinaId] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const resetForm = () => {
    setName("");
    setCategory("");
    setDescription("");
    setPembinaId("");
    setStatus("ACTIVE");
    setErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    try {
      const response = await fetch("/api/admin/ekstrakurikuler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          description: description || undefined,
          pembinaId,
          status,
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

      toast.success("Ekstrakurikuler berhasil dibuat!", {
        description: `${name} - ${category}`,
      });

      resetForm();
      setOpen(false);
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error("Create ekstrakurikuler error:", error);
      setErrors(["Gagal terhubung ke server"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Ekstrakurikuler
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Ekstrakurikuler Baru</DialogTitle>
            <DialogDescription>
              Buat ekstrakurikuler baru dan tetapkan pembina.
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
              <Label htmlFor="name">Nama Ekstrakurikuler *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Basket, Pramuka"
                required
              />
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="category">Kategori *</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Contoh: Olahraga, Seni, Akademik"
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat ekstrakurikuler..."
                rows={3}
              />
            </div>

            {/* Pembina */}
            <div className="grid gap-2">
              <Label htmlFor="pembina">Pembina *</Label>
              <Select value={pembinaId} onValueChange={setPembinaId} required>
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Pilih pembina" />
                </SelectTrigger>
                <SelectContent>
                  {pembinas.map((pembina) => (
                    <SelectItem
                      key={pembina.id}
                      value={pembina.id}
                      className="cursor-pointer"
                    >
                      {pembina.user.full_name} ({pembina.nip})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {pembinas.length === 0 && (
                <p className="text-xs text-amber-600">
                  Tidak ada pembina tersedia. Buat user PEMBINA terlebih dahulu.
                </p>
              )}
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus(value as "ACTIVE" | "INACTIVE")
                }
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE" className="cursor-pointer">
                    Aktif
                  </SelectItem>
                  <SelectItem value="INACTIVE" className="cursor-pointer">
                    Tidak Aktif
                  </SelectItem>
                </SelectContent>
              </Select>
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
              disabled={isSubmitting || pembinas.length === 0}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
