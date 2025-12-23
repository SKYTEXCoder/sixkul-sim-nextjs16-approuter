"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function PeriodSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Default to current month or existing param

  // const currentEnd = searchParams.get("endDate") || endOfMonth(new Date()).toISOString();

  const getRanges = () => {
    const now = new Date();

    // This Month
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);

    // Last Month
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Semester Ini (Last 6 months -> End of current month)
    const semesterStart = subMonths(now, 6);
    const semesterEnd = endOfMonth(now);

    // This Year
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);

    return {
      this_month: { start: thisMonthStart, end: thisMonthEnd },
      last_month: { start: lastMonthStart, end: lastMonthEnd },
      this_semester: { start: semesterStart, end: semesterEnd },
      this_year: { start: yearStart, end: yearEnd },
    };
  };

  const ranges = getRanges();

  const handlePresetChange = (value: string) => {
    const range = ranges[value as keyof typeof ranges];
    if (!range) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("startDate", range.start.toISOString());
    params.set("endDate", range.end.toISOString());
    router.push(`?${params.toString()}`);
  };

  const formatDateRange = (start: Date, end: Date) => {
    return `${format(start, "dd MMM", { locale: id })} - ${format(end, "dd MMM", { locale: id })}`;
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-zinc-500">Periode:</span>
      <Select onValueChange={handlePresetChange} defaultValue="this_month">
        <SelectTrigger className="w-[280px] bg-white dark:bg-zinc-900 cursor-pointer">
          <SelectValue placeholder="Pilih Periode" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            value="this_month"
            className="cursor-pointer"
            title="Tampilkan data mulai tanggal 1 hingga akhir bulan ini"
          >
            <span className="flex justify-between w-full gap-4">
              <span>Bulan Ini</span>
              <span className="text-zinc-400 font-normal">
                {formatDateRange(
                  ranges.this_month.start,
                  ranges.this_month.end
                )}
              </span>
            </span>
          </SelectItem>
          <SelectItem
            value="last_month"
            className="cursor-pointer"
            title="Tampilkan data lengkap bulan sebelumnya"
          >
            <span className="flex justify-between w-full gap-4">
              <span>Bulan Lalu</span>
              <span className="text-zinc-400 font-normal">
                {formatDateRange(
                  ranges.last_month.start,
                  ranges.last_month.end
                )}
              </span>
            </span>
          </SelectItem>
          <SelectItem
            value="this_semester"
            className="cursor-pointer"
            title="Tampilkan data untuk semester berjalan (Juni - Desember / Januari - Juni)"
          >
            <span className="flex justify-between w-full gap-4">
              <span>Semester Ini</span>
              <span className="text-zinc-400 font-normal">
                {formatDateRange(
                  ranges.this_semester.start,
                  ranges.this_semester.end
                )}
              </span>
            </span>
          </SelectItem>
          <SelectItem
            value="this_year"
            className="cursor-pointer"
            title="Tampilkan data untuk tahun berjalan (1 Jan - 31 Des)"
          >
            <span className="flex justify-between w-full gap-4">
              <span>Tahun Ini</span>
              <span className="text-zinc-400 font-normal">
                {formatDateRange(ranges.this_year.start, ranges.this_year.end)}
              </span>
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
