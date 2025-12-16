"use client";

/**
 * Schedule Filters Component
 *
 * Client Component for interactive filtering by extracurricular and date range.
 * Uses URL search params for filter state (enables server-side filtering).
 *
 * @module components/student-schedule/ScheduleFilters
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ============================================
// Types
// ============================================

interface ScheduleFiltersProps {
  extracurriculars: Array<{ id: string; name: string }>;
}

// ============================================
// Main Component
// ============================================

export function ScheduleFilters({ extracurriculars }: ScheduleFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current filter values from URL
  const currentEkskulId = searchParams.get("ekskul") || "";
  const currentStartDate = searchParams.get("start") || "";
  const currentEndDate = searchParams.get("end") || "";

  const [ekskulId, setEkskulId] = useState(currentEkskulId || "all");
  const [startDate, setStartDate] = useState(currentStartDate);
  const [endDate, setEndDate] = useState(currentEndDate);

  // Apply filters by updating URL
  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (ekskulId && ekskulId !== "all") params.set("ekskul", ekskulId);
    if (startDate) params.set("start", startDate);
    if (endDate) params.set("end", endDate);

    const queryString = params.toString();
    router.push(
      queryString ? `/student/schedule?${queryString}` : "/student/schedule",
    );
  }, [ekskulId, startDate, endDate, router]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setEkskulId("all");
    setStartDate("");
    setEndDate("");
    router.push("/student/schedule");
  }, [router]);

  const hasActiveFilters =
    (ekskulId && ekskulId !== "all") || startDate || endDate;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Filter
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Extracurricular Filter */}
        <div className="space-y-2">
          <Label
            htmlFor="ekskul-filter"
            className="text-sm text-slate-600 dark:text-slate-400"
          >
            Ekstrakurikuler
          </Label>
          <Select value={ekskulId} onValueChange={setEkskulId}>
            <SelectTrigger id="ekskul-filter">
              <SelectValue placeholder="Semua" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              {extracurriculars.map((ekskul) => (
                <SelectItem key={ekskul.id} value={ekskul.id}>
                  {ekskul.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Start Date Filter */}
        <div className="space-y-2">
          <Label
            htmlFor="start-date"
            className="text-sm text-slate-600 dark:text-slate-400"
          >
            Dari Tanggal
          </Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* End Date Filter */}
        <div className="space-y-2">
          <Label
            htmlFor="end-date"
            className="text-sm text-slate-600 dark:text-slate-400"
          >
            Sampai Tanggal
          </Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-end gap-2">
          <Button onClick={applyFilters} className="flex-1">
            Terapkan
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" size="icon" onClick={clearFilters}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
