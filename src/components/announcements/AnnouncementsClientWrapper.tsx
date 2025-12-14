"use client";

/**
 * Announcements Client Wrapper Component
 * 
 * Client component that provides:
 * 1. View mode toggle (Global Feed / Grouped by Ekstrakurikuler)
 * 2. Client-side search filtering
 * 
 * No additional Prisma queries - filters pre-fetched data only.
 * 
 * @module components/announcements/AnnouncementsClientWrapper
 */

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, List, LayoutGrid } from "lucide-react";
import { AnnouncementList } from "./AnnouncementList";
import type { AnnouncementViewModel } from "@/lib/announcements-data";

// ============================================
// Types
// ============================================

type ViewMode = "global" | "grouped";

interface AnnouncementsClientWrapperProps {
  announcements: AnnouncementViewModel[];
}

// ============================================
// Component
// ============================================

export function AnnouncementsClientWrapper({
  announcements,
}: AnnouncementsClientWrapperProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("global");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Cari pengumuman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <Button
            variant={viewMode === "global" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("global")}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Semua Pengumuman</span>
          </Button>
          <Button
            variant={viewMode === "grouped" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grouped")}
            className="flex items-center gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Per Ekstrakurikuler</span>
          </Button>
        </div>
      </div>

      {/* Announcements List */}
      <AnnouncementList
        announcements={announcements}
        viewMode={viewMode}
        searchQuery={searchQuery}
      />
    </div>
  );
}
