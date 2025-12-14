/**
 * Enrollment Announcements Component
 * 
 * Displays announcements for the extracurricular activity.
 * Server Component - no client-side interactivity needed.
 * 
 * @module components/enrollment-detail/EnrollmentAnnouncements
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, User, Clock } from "lucide-react";
import type { EnrollmentDetailViewModel } from "@/lib/enrollment-detail-data";

// ============================================
// Types
// ============================================

interface EnrollmentAnnouncementsProps {
  announcements: EnrollmentDetailViewModel["announcements"];
}

// ============================================
// Main Component
// ============================================

export function EnrollmentAnnouncements({ announcements }: EnrollmentAnnouncementsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-indigo-500" />
          Pengumuman Ekstrakurikuler
        </CardTitle>
      </CardHeader>
      <CardContent>
        {announcements.length === 0 ? (
          <div className="text-center py-8">
            <Megaphone className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              Belum ada pengumuman
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              >
                {/* Header */}
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {announcement.title}
                </h3>

                {/* Content */}
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 whitespace-pre-wrap">
                  {announcement.content}
                </p>

                {/* Footer Meta */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span>{announcement.authorName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {new Date(announcement.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
