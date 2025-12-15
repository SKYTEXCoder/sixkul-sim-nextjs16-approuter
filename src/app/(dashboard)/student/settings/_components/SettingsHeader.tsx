"use client";

/**
 * Settings Header Component
 *
 * @module app/(dashboard)/student/settings/_components/SettingsHeader
 */

import { Settings } from "lucide-react";

export function SettingsHeader() {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
        <Settings className="w-7 h-7 text-white" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Pengaturan
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Preferensi pribadi dan keamanan akun kamu
        </p>
      </div>
    </div>
  );
}
