"use client";

/**
 * Schedule Preferences Section
 *
 * @module app/(dashboard)/student/settings/_components/SchedulePreferencesSection
 */

import { Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SchedulePreferencesSectionProps {
  scheduleDefaultView: "date" | "extracurricular";
  scheduleRangeDays: number;
  onViewChange: (view: "date" | "extracurricular") => void;
  onRangeChange: (days: number) => void;
}

const viewOptions = [
  { value: "date" as const, label: "Berdasarkan Tanggal" },
  { value: "extracurricular" as const, label: "Berdasarkan Ekstrakurikuler" },
];

const rangeOptions = [
  { value: 7, label: "7 Hari" },
  { value: 14, label: "14 Hari" },
  { value: 30, label: "30 Hari" },
];

export function SchedulePreferencesSection({
  scheduleDefaultView,
  scheduleRangeDays,
  onViewChange,
  onRangeChange,
}: SchedulePreferencesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Preferensi Jadwal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Default View */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-slate-400" />
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tampilan Default
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {viewOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => onViewChange(option.value)}
                className={cn(
                  "p-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer",
                  scheduleDefaultView === option.value
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-slate-400" />
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Rentang Waktu Default
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {rangeOptions.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => onRangeChange(option.value)}
                className={cn(
                  "p-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer",
                  scheduleRangeDays === option.value
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
