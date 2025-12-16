/**
 * Announcement Card Component
 *
 * Displays a single announcement with title, extracurricular info,
 * date, and content preview. Links to enrollment detail page.
 *
 * @module components/announcements/AnnouncementCard
 */

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronRight } from "lucide-react";
import type { AnnouncementViewModel } from "@/lib/announcements-data";

// ============================================
// Types
// ============================================

interface AnnouncementCardProps {
  announcement: AnnouncementViewModel;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Format date to Indonesian locale
 */
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Get relative time string (e.g., "2 hari yang lalu")
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} hari yang lalu`;
  } else if (hours > 0) {
    return `${hours} jam yang lalu`;
  } else if (minutes > 0) {
    return `${minutes} menit yang lalu`;
  } else {
    return "Baru saja";
  }
}

/**
 * Truncate content to specified length
 */
function truncateContent(content: string, maxLength: number = 150): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + "...";
}

// ============================================
// Component
// ============================================

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  return (
    <Link href={`/student/enrollments/${announcement.enrollmentId}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2">
                {announcement.title}
              </h3>

              {/* Extracurricular + Date */}
              <div className="flex items-center gap-2 flex-wrap text-sm text-slate-500 dark:text-slate-400 mb-3">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {announcement.extracurricular.name}
                </span>
                <Badge
                  variant="secondary"
                  className="text-xs bg-slate-100 dark:bg-slate-800"
                >
                  {announcement.extracurricular.category}
                </Badge>
                <span className="text-slate-400">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {getRelativeTime(announcement.createdAt)}
                </span>
              </div>

              {/* Content Preview */}
              <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">
                {truncateContent(announcement.content)}
              </p>

              {/* Author */}
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                Oleh: {announcement.authorName}
              </p>
            </div>

            {/* Chevron */}
            <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0 mt-1 group-hover:text-indigo-500 transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
