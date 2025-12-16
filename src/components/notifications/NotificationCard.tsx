/**
 * NotificationCard Component
 *
 * Displays a single notification with type icon, timestamp, unread indicator.
 * Handles click to mark as read and navigate to enrollment detail.
 *
 * @module components/notifications/NotificationCard
 */

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Megaphone,
  ClipboardCheck,
  Calendar,
  UserCheck,
  Loader2,
} from "lucide-react";
import { NotificationType } from "@/generated/prisma";
import { markNotificationAsRead } from "@/lib/notification-data";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

interface NotificationCardProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  enrollmentId: string | null;
  extracurricularName?: string;
}

// ============================================
// Helper Functions
// ============================================

function getTypeIcon(type: NotificationType) {
  switch (type) {
    case "ANNOUNCEMENT":
      return Megaphone;
    case "ATTENDANCE":
      return ClipboardCheck;
    case "SCHEDULE":
      return Calendar;
    case "ENROLLMENT":
      return UserCheck;
    default:
      return Megaphone;
  }
}

function getTypeColor(type: NotificationType) {
  switch (type) {
    case "ANNOUNCEMENT":
      return "text-blue-500 bg-blue-100 dark:bg-blue-900/30";
    case "ATTENDANCE":
      return "text-green-500 bg-green-100 dark:bg-green-900/30";
    case "SCHEDULE":
      return "text-orange-500 bg-orange-100 dark:bg-orange-900/30";
    case "ENROLLMENT":
      return "text-purple-500 bg-purple-100 dark:bg-purple-900/30";
    default:
      return "text-slate-500 bg-slate-100 dark:bg-slate-800";
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;

  // Fall back to formatted date for older notifications
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ============================================
// Component
// ============================================

export function NotificationCard({
  id,
  type,
  title,
  message,
  isRead,
  createdAt,
  enrollmentId,
}: NotificationCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const Icon = getTypeIcon(type);

  const handleClick = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // Mark as read (Server Action)
      if (!isRead) {
        await markNotificationAsRead(id);
      }

      // Navigate to enrollment detail if enrollmentId exists
      if (enrollmentId) {
        router.push(`/student/enrollments/${enrollmentId}`);
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      onClick={handleClick}
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        "border-l-4",
        !isRead
          ? "border-l-primary bg-primary/5 dark:bg-primary/10"
          : "border-l-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Type Icon */}
          <div className={cn("p-2 rounded-full shrink-0", getTypeColor(type))}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Icon className="h-4 w-4" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4
                className={cn(
                  "text-sm line-clamp-1",
                  !isRead
                    ? "font-semibold text-slate-900 dark:text-white"
                    : "font-medium text-slate-700 dark:text-slate-300",
                )}
              >
                {title}
              </h4>

              {/* Unread Indicator */}
              {!isRead && (
                <span className="shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
              )}
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
              {message}
            </p>

            <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">
              {formatRelativeTime(createdAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default NotificationCard;
