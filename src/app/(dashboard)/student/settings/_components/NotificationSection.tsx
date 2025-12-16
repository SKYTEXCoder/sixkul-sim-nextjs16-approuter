"use client";

/**
 * Notification Preferences Section
 *
 * @module app/(dashboard)/student/settings/_components/NotificationSection
 */

import { Bell, Calendar, ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface NotificationSectionProps {
  notifyAnnouncements: boolean;
  notifyScheduleChanges: boolean;
  notifyAttendance: boolean;
  onToggle: (
    field: "notifyAnnouncements" | "notifyScheduleChanges" | "notifyAttendance",
    value: boolean,
  ) => void;
}

const notificationOptions = [
  {
    field: "notifyAnnouncements" as const,
    label: "Pengumuman Ekstrakurikuler",
    description: "Notifikasi saat ada pengumuman baru dari ekstrakurikuler",
    icon: Bell,
  },
  {
    field: "notifyScheduleChanges" as const,
    label: "Perubahan Jadwal",
    description: "Notifikasi saat jadwal kegiatan berubah",
    icon: Calendar,
  },
  {
    field: "notifyAttendance" as const,
    label: "Status Absensi",
    description: "Notifikasi terkait kehadiran dan absensi",
    icon: ClipboardCheck,
  },
];

export function NotificationSection({
  notifyAnnouncements,
  notifyScheduleChanges,
  notifyAttendance,
  onToggle,
}: NotificationSectionProps) {
  const values = {
    notifyAnnouncements,
    notifyScheduleChanges,
    notifyAttendance,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Notifikasi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notificationOptions.map((option) => {
            const Icon = option.icon;
            const isEnabled = values[option.field];
            return (
              <div
                key={option.field}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      isEnabled
                        ? "bg-violet-100 dark:bg-violet-900/30"
                        : "bg-slate-200 dark:bg-slate-700",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        isEnabled
                          ? "text-violet-500"
                          : "text-slate-400 dark:text-slate-500",
                      )}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {option.label}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {option.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => onToggle(option.field, checked)}
                  className="cursor-pointer"
                />
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
          Pengaturan ini akan aktif saat sistem notifikasi diimplementasikan.
        </p>
      </CardContent>
    </Card>
  );
}
