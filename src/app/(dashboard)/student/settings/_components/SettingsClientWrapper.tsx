"use client";

/**
 * Settings Client Wrapper
 *
 * Coordinates auto-save and toast feedback for all settings sections.
 * Uses Server Actions for preference updates.
 *
 * @module app/(dashboard)/student/settings/_components/SettingsClientWrapper
 */

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { SettingsHeader } from "./SettingsHeader";
import { AppearanceSection } from "./AppearanceSection";
import { NotificationSection } from "./NotificationSection";
import { SchedulePreferencesSection } from "./SchedulePreferencesSection";
import { SecuritySection } from "./SecuritySection";
import type { StudentPreferencesViewModel } from "@/lib/preferences-data";
import { updatePreferenceAction } from "../actions";

interface SettingsClientWrapperProps {
  initialPreferences: StudentPreferencesViewModel;
}

export function SettingsClientWrapper({
  initialPreferences,
}: SettingsClientWrapperProps) {
  const [preferences, setPreferences] =
    useState<StudentPreferencesViewModel>(initialPreferences);
  const [isPending, startTransition] = useTransition();

  // Generic update handler with auto-save
  const handleUpdate = async <
    K extends keyof Omit<StudentPreferencesViewModel, "id">
  >(
    field: K,
    value: StudentPreferencesViewModel[K]
  ) => {
    // Optimistic update
    setPreferences((prev) => ({ ...prev, [field]: value }));

    startTransition(async () => {
      const result = await updatePreferenceAction(field, value);

      if (result.success && result.data) {
        setPreferences(result.data);
        toast.success("Perubahan tersimpan");
      } else {
        // Revert on error
        setPreferences(initialPreferences);
        toast.error(result.error || "Gagal menyimpan perubahan");
      }
    });
  };

  return (
    <div className="space-y-6">
      <SettingsHeader />

      <div className="grid gap-6">
        {/* Appearance Section */}
        <AppearanceSection
          currentTheme={preferences.theme}
          onThemeChange={(theme) =>
            handleUpdate("theme", theme as "light" | "dark" | "system")
          }
        />

        {/* Notification Preferences */}
        <NotificationSection
          notifyAnnouncements={preferences.notifyAnnouncements}
          notifyScheduleChanges={preferences.notifyScheduleChanges}
          notifyAttendance={preferences.notifyAttendance}
          onToggle={(field, value) => handleUpdate(field, value)}
        />

        {/* Schedule Preferences */}
        <SchedulePreferencesSection
          scheduleDefaultView={preferences.scheduleDefaultView}
          scheduleRangeDays={preferences.scheduleRangeDays}
          onViewChange={(view) => handleUpdate("scheduleDefaultView", view)}
          onRangeChange={(days) => handleUpdate("scheduleRangeDays", days)}
        />

        {/* Security Section */}
        <SecuritySection />
      </div>

      {/* Loading indicator */}
      {isPending && (
        <div className="fixed bottom-4 right-4 bg-violet-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Menyimpan...
        </div>
      )}
    </div>
  );
}
