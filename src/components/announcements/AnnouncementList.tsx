/**
 * Announcement List Component
 * 
 * Renders announcements in either global feed or grouped mode.
 * Server Component - works with pre-fetched data.
 * 
 * @module components/announcements/AnnouncementList
 */

import { Badge } from "@/components/ui/badge";
import { AnnouncementCard } from "./AnnouncementCard";
import type { AnnouncementViewModel } from "@/lib/announcements-data";

// ============================================
// Types
// ============================================

type ViewMode = "global" | "grouped";

interface AnnouncementListProps {
  announcements: AnnouncementViewModel[];
  viewMode: ViewMode;
  searchQuery: string;
}

interface GroupedData {
  extracurricular: {
    id: string;
    name: string;
    category: string;
  };
  enrollmentId: string;
  announcements: AnnouncementViewModel[];
}

// ============================================
// Helper Functions
// ============================================

/**
 * Filter announcements based on search query
 */
function filterAnnouncements(
  announcements: AnnouncementViewModel[],
  query: string
): AnnouncementViewModel[] {
  if (!query.trim()) return announcements;
  
  const lowerQuery = query.toLowerCase();
  return announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(lowerQuery) ||
      a.content.toLowerCase().includes(lowerQuery) ||
      a.extracurricular.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Group announcements by extracurricular
 */
function groupByExtracurricular(
  announcements: AnnouncementViewModel[]
): GroupedData[] {
  const grouped = new Map<string, GroupedData>();
  
  for (const announcement of announcements) {
    const existing = grouped.get(announcement.extracurricular.id);
    if (existing) {
      existing.announcements.push(announcement);
    } else {
      grouped.set(announcement.extracurricular.id, {
        extracurricular: announcement.extracurricular,
        enrollmentId: announcement.enrollmentId,
        announcements: [announcement],
      });
    }
  }
  
  return Array.from(grouped.values());
}

// ============================================
// Component
// ============================================

export function AnnouncementList({
  announcements,
  viewMode,
  searchQuery,
}: AnnouncementListProps) {
  // Filter based on search
  const filteredAnnouncements = filterAnnouncements(announcements, searchQuery);

  // No results
  if (filteredAnnouncements.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-slate-400">
        {searchQuery ? (
          <>
            <p className="font-medium">Tidak ada pengumuman yang cocok</p>
            <p className="text-sm mt-1">Coba gunakan kata kunci yang berbeda</p>
          </>
        ) : (
          <p>Tidak ada pengumuman</p>
        )}
      </div>
    );
  }

  // Global feed mode
  if (viewMode === "global") {
    return (
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <AnnouncementCard key={announcement.id} announcement={announcement} />
        ))}
      </div>
    );
  }

  // Grouped by extracurricular mode
  const groups = groupByExtracurricular(filteredAnnouncements);

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.extracurricular.id}>
          {/* Group Header */}
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {group.extracurricular.name}
            </h2>
            <Badge variant="secondary" className="text-xs">
              {group.extracurricular.category}
            </Badge>
            <span className="text-sm text-slate-500">
              ({group.announcements.length} pengumuman)
            </span>
          </div>

          {/* Group Announcements */}
          <div className="space-y-4 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
            {group.announcements.map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
