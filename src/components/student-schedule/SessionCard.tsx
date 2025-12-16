/**
 * Session Card Component
 *
 * Displays a single session with extracurricular name, category badge,
 * time, and location. Clickable to navigate to enrollment detail.
 *
 * @module components/student-schedule/SessionCard
 */

import Link from "next/link";
import { Clock, MapPin, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SessionViewModel } from "@/lib/session-data";

// ============================================
// Category Colors
// ============================================

const categoryColors: Record<string, string> = {
  Olahraga:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Seni: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  Teknologi: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Akademik:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Bahasa: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
};

// ============================================
// Types
// ============================================

interface SessionCardProps {
  session: SessionViewModel;
}

// ============================================
// Main Component
// ============================================

export function SessionCard({ session }: SessionCardProps) {
  const categoryClass =
    categoryColors[session.extracurricular.category] ||
    "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";

  return (
    <Link href={`/student/enrollments/${session.enrollmentId}`}>
      <Card className="group hover:shadow-md transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-700 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Extracurricular Name */}
              <h4 className="font-semibold text-slate-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {session.extracurricular.name}
              </h4>

              {/* Category Badge */}
              <div className="mt-1">
                <Badge variant="secondary" className={categoryClass}>
                  {session.extracurricular.category}
                </Badge>
              </div>

              {/* Time and Location */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {session.startTime} - {session.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{session.location}</span>
                </div>
              </div>
            </div>

            {/* Arrow indicator */}
            <div className="flex-shrink-0 mt-1">
              <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-violet-500 transition-colors" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
