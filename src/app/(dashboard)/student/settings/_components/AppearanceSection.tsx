"use client";

/**
 * Appearance Section - Theme selector only (NO language)
 *
 * @module app/(dashboard)/student/settings/_components/AppearanceSection
 */

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AppearanceSectionProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const themeOptions = [
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
  { value: "system", label: "Sistem", icon: Monitor },
];

export function AppearanceSection({
  currentTheme,
  onThemeChange,
}: AppearanceSectionProps) {
  const { setTheme } = useTheme();

  const handleThemeChange = (theme: string) => {
    setTheme(theme);
    onThemeChange(theme);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tampilan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
              Tema Aplikasi
            </label>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = currentTheme === option.value;
                return (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => handleThemeChange(option.value)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer",
                      isSelected
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-6 h-6 mb-2",
                        isSelected
                          ? "text-violet-500"
                          : "text-slate-400 dark:text-slate-500",
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isSelected
                          ? "text-violet-600 dark:text-violet-400"
                          : "text-slate-600 dark:text-slate-400",
                      )}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
