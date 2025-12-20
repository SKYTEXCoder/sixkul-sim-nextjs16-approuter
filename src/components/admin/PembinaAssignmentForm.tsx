"use client";

/**
 * PembinaAssignmentForm Component
 *
 * Form for changing the PEMBINA assigned to an extracurricular.
 * Submits to PUT /api/admin/ekstrakurikuler/[id] API with pembinaId.
 *
 * @module components/admin/PembinaAssignmentForm
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface PembinaAssignmentFormProps {
  ekskulId: string;
  currentPembinaId: string;
  availablePembina: PembinaOption[];
}

export function PembinaAssignmentForm({
  ekskulId,
  currentPembinaId,
  availablePembina,
}: PembinaAssignmentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPembinaId, setSelectedPembinaId] = useState(currentPembinaId);

  const hasChanged = selectedPembinaId !== currentPembinaId;

  const handleSave = async () => {
    if (!hasChanged) {
      toast.info("Tidak ada perubahan");
      return;
    }

    if (!selectedPembinaId) {
      toast.error("Pembina harus dipilih");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/ekstrakurikuler/${ekskulId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pembinaId: selectedPembinaId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Gagal mengubah pembina", {
          description: data.errors?.join(", "),
        });
        return;
      }

      const newPembina = availablePembina.find(
        (p) => p.id === selectedPembinaId
      );
      toast.success("Pembina berhasil diubah!", {
        description: newPembina?.user.full_name,
      });

      router.refresh();
    } catch (error) {
      console.error("Update pembina error:", error);
      toast.error("Gagal terhubung ke server", {
        description: "Silakan coba lagi nanti.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm text-slate-500 block">Ganti Pembina</label>
      <Select
        value={selectedPembinaId}
        onValueChange={setSelectedPembinaId}
        disabled={isLoading}
      >
        <SelectTrigger className="cursor-pointer">
          <SelectValue placeholder="Pilih pembina..." />
        </SelectTrigger>
        <SelectContent>
          {availablePembina.map((pembina) => (
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
      <Button
        onClick={handleSave}
        disabled={isLoading || !hasChanged}
        className="w-full cursor-pointer"
        variant={hasChanged ? "default" : "outline"}
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
      {!hasChanged && (
        <p className="text-xs text-slate-400 text-center">
          Pilih pembina lain untuk mengaktifkan tombol simpan
        </p>
      )}
    </div>
  );
}
