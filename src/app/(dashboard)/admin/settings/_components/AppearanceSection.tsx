"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Palette } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateAdminPreferences } from "@/lib/admin-preferences-data";

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

export function AppearanceSection() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    // Sync to DB (optimistic, don't block UI)
    try {
      await updateAdminPreferences("theme", newTheme);
    } catch (error) {
      console.error("Failed to sync theme preference", error);
      // Optional: toast error
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Tampilan
        </CardTitle>
        <CardDescription>
          Sesuaikan tema dan tampilan aplikasi sesuai preferensi Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-3 block">
              Tema Aplikasi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleThemeChange(option.value)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer",
                      isSelected
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-transparent bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-8 h-8 mb-2",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {option.label}
                    </span>
                    <span
                      className={cn(
                        "text-xs mt-1 text-center",
                        isSelected ? "text-primary/70" : "text-muted-foreground"
                      )}
                    >
                      {option.description}
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
