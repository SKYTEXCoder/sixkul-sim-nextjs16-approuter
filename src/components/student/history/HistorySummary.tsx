"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Clock, Archive } from "lucide-react";
import type { HistorySummaryStats } from "@/lib/history-data";

interface HistorySummaryProps {
  stats: HistorySummaryStats;
}

export function HistorySummary({ stats }: HistorySummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Card */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Diikuti
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.total}
            </h3>
          </div>
        </CardContent>
      </Card>

      {/* Active Card */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Aktif Saat Ini
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.active}
            </h3>
          </div>
        </CardContent>
      </Card>

      {/* Inactive Card */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center flex-shrink-0">
            <Archive className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Riwayat / Alumni
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {stats.inactive}
            </h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
