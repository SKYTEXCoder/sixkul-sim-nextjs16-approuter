/**
 * Session Date Group Component
 *
 * Displays a date header with all sessions for that date.
 * Server Component - no client-side interactivity needed.
 *
 * @module components/student-schedule/SessionDateGroup
 */

import { SessionCard } from "./SessionCard";
import type { SessionDateGroup as SessionDateGroupType } from "@/lib/session-data";

// ============================================
// Types
// ============================================

interface SessionDateGroupProps {
  group: SessionDateGroupType;
}

// ============================================
// Main Component
// ============================================

export function SessionDateGroup({ group }: SessionDateGroupProps) {
  return (
    <div className="space-y-3">
      {/* Date Header */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
          {group.dateString}
        </h3>
        <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
      </div>

      {/* Session Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {group.sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
