"use client";

/**
 * Create Schedule Form Component
 *
 * Form to create a new schedule template.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

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
import { createScheduleAction } from "../actions";

// Day options
const DAY_OPTIONS = [
  { value: "MONDAY", label: "Senin" },
  { value: "TUESDAY", label: "Selasa" },
  { value: "WEDNESDAY", label: "Rabu" },
  { value: "THURSDAY", label: "Kamis" },
  { value: "FRIDAY", label: "Jumat" },
  { value: "SATURDAY", label: "Sabtu" },
  { value: "SUNDAY", label: "Minggu" },
];

interface CreateScheduleFormProps {
  extracurricularId: string;
}

export function CreateScheduleForm({
  extracurricularId,
}: CreateScheduleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState("");

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);

    try {
      formData.set("day_of_week", dayOfWeek);
      const result = await createScheduleAction(extracurricularId, formData);

      if (result.success) {
        toast.success("Jadwal berhasil ditambahkan!");
        // Reset form
        setDayOfWeek("");
        (document.getElementById("schedule-form") as HTMLFormElement)?.reset();
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menambahkan jadwal");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form id="schedule-form" action={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-5">
        {/* Day of Week */}
        <div className="space-y-2">
          <Label htmlFor="day_of_week">Hari</Label>
          <Select value={dayOfWeek} onValueChange={setDayOfWeek} required>
            <SelectTrigger>
              <SelectValue placeholder="Pilih hari" />
            </SelectTrigger>
            <SelectContent>
              {DAY_OPTIONS.map((day) => (
                <SelectItem key={day.value} value={day.value}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Start Time */}
        <div className="space-y-2">
          <Label htmlFor="start_time">Mulai</Label>
          <Input
            id="start_time"
            name="start_time"
            type="time"
            required
            placeholder="14:00"
          />
        </div>

        {/* End Time */}
        <div className="space-y-2">
          <Label htmlFor="end_time">Selesai</Label>
          <Input
            id="end_time"
            name="end_time"
            type="time"
            required
            placeholder="16:00"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Lokasi</Label>
          <Input
            id="location"
            name="location"
            type="text"
            required
            placeholder="Lapangan, Ruang Musik, dll"
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-end">
          <Button
            type="submit"
            disabled={isSubmitting || !dayOfWeek}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Tambah
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
