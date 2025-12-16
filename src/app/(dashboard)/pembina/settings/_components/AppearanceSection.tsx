"use client";

/**
 * Appearance Section - Theme selector for PEMBINA settings
 *
 * Provides Light / Dark / System theme options.
 * Uses next-themes for actual theme switching.
 *
 * @module app/(dashboard)/pembina/settings/_components/AppearanceSection
 */

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ============================================
// Theme Options Configuration
// ============================================

const themeOptions = [
  {
    value: "light",
    label: "Terang",
    description: "Mode terang untuk penggunaan siang hari",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Gelap",
    description: "Mode gelap untuk penggunaan malam hari",
    icon: Moon,
  },
  {
    value: "system",
    label: "Sistem",
    description: "Ikuti pengaturan sistem operasi",
    icon: Monitor,
  },
];

// ============================================
// Component
// ============================================

export function AppearanceSection() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Tampilan
        </CardTitle>
        <CardDescription>
          Sesuaikan tema dan tampilan aplikasi sesuai preferensi Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Theme Selector */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
              Tema Aplikasi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.value;

                return (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-8 h-8 mb-2",
                        isSelected
                          ? "text-emerald-500"
                          : "text-slate-400 dark:text-slate-500"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isSelected
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-600 dark:text-slate-400"
                      )}
                    >
                      {option.label}
                    </span>
                    <span
                      className={cn(
                        "text-xs mt-1 text-center",
                        isSelected
                          ? "text-emerald-500/70 dark:text-emerald-400/70"
                          : "text-slate-400 dark:text-slate-500"
                      )}
                    >
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Theme Indicator */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              {resolvedTheme === "dark" ? (
                <Moon className="h-4 w-4 text-slate-500" />
              ) : (
                <Sun className="h-4 w-4 text-slate-500" />
              )}
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Tema aktif saat ini
              </span>
            </div>
            <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">
              {resolvedTheme === "dark" ? "Gelap" : "Terang"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AppearanceSection;
