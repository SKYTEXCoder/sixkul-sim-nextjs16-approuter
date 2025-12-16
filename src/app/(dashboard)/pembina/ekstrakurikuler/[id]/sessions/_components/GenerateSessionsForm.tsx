"use client";

/**
 * Generate Sessions Form Component
 *
 * Form to generate sessions from schedule templates.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { format, addWeeks } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateSessionsAction } from "../actions";

interface GenerateSessionsFormProps {
  extracurricularId: string;
}

export function GenerateSessionsForm({
  extracurricularId,
}: GenerateSessionsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default date range: today to 4 weeks from now
  const today = format(new Date(), "yyyy-MM-dd");
  const fourWeeksLater = format(addWeeks(new Date(), 4), "yyyy-MM-dd");

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(fourWeeksLater);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await generateSessionsAction(
        extracurricularId,
        startDate,
        endDate,
      );

      if (result.success) {
        if (result.count > 0) {
          toast.success(`Berhasil membuat ${result.count} pertemuan baru!`);
        } else {
          toast.info(result.error || "Tidak ada pertemuan baru yang dibuat.");
        }
        router.refresh();
      } else {
        toast.error(result.error || "Gagal generate pertemuan");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-3">
        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="start_date">Tanggal Mulai</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              id="start_date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label htmlFor="end_date">Tanggal Selesai</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              id="end_date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-end">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Pertemuan
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
