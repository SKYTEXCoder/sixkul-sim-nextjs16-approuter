"use client";

/**
 * EditEkskulDialog Component
 *
 * Modal dialog for editing extracurricular metadata (name, category, description).
 * Submits to PUT /api/admin/ekstrakurikuler/[id] API.
 *
 * @module components/admin/EditEkskulDialog
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  "Olahraga",
  "Seni",
  "Akademik",
  "Teknologi",
  "Bahasa",
  "Sosial",
  "Keagamaan",
  "Lainnya",
];

interface EditEkskulDialogProps {
  ekskulId: string;
  currentName: string;
  currentCategory: string;
  currentDescription: string | null;
}

export function EditEkskulDialog({
  ekskulId,
  currentName,
  currentCategory,
  currentDescription,
}: EditEkskulDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [name, setName] = useState(currentName);
  const [category, setCategory] = useState(currentCategory);
  const [description, setDescription] = useState(currentDescription || "");

  // Reset form when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setName(currentName);
      setCategory(currentCategory);
      setDescription(currentDescription || "");
    }
    setOpen(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error("Nama ekstrakurikuler tidak boleh kosong");
      return;
    }
    if (!category) {
      toast.error("Kategori harus dipilih");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/ekstrakurikuler/${ekskulId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          description: description.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Gagal memperbarui ekstrakurikuler", {
          description: data.errors?.join(", "),
        });
        return;
      }

      toast.success("Ekstrakurikuler berhasil diperbarui!", {
        description: name,
      });

      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Update ekstrakurikuler error:", error);
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
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Ekstrakurikuler</DialogTitle>
            <DialogDescription>
              Ubah informasi ekstrakurikuler. Klik simpan setelah selesai.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Ekstrakurikuler *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Basket, Paduan Suara"
                disabled={isLoading}
                required
              />
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select
                value={category}
                onValueChange={setCategory}
                disabled={isLoading}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem
                      key={cat}
                      value={cat}
                      className="cursor-pointer"
                    >
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat tentang ekstrakurikuler ini..."
                disabled={isLoading}
                rows={3}
              />
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
