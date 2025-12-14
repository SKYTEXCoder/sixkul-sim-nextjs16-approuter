/**
 * Announcements Header Component
 * 
 * Displays the page header with title and subtitle.
 * Server Component - no client-side interactivity needed.
 * 
 * @module components/announcements/AnnouncementsHeader
 */

import { Megaphone } from "lucide-react";

// ============================================
// Component
// ============================================

export function AnnouncementsHeader() {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <Megaphone className="h-6 w-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Pengumuman Saya
        </h1>
      </div>
      <p className="text-slate-500 dark:text-slate-400 mt-2">
        Informasi terbaru dari ekstrakurikuler yang kamu ikuti
      </p>
    </div>
  );
}
