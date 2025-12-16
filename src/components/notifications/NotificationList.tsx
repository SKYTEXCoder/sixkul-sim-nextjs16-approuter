/**
 * NotificationList Component
 *
 * Displays a list of notifications with "Mark all as read" button.
 *
 * @module components/notifications/NotificationList
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { NotificationCard } from "./NotificationCard";
import { markAllNotificationsAsRead } from "@/lib/notification-data";
import { NotificationType } from "@/generated/prisma";
import { CheckCheck, Loader2 } from "lucide-react";

// ============================================
// Types
// ============================================

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  enrollmentId: string | null;
  extracurricularName?: string;
}

interface NotificationListProps {
  notifications: NotificationItem[];
  unreadCount: number;
}

// ============================================
// Component
// ============================================

export function NotificationList({
  notifications,
  unreadCount,
}: NotificationListProps) {
  const router = useRouter();
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const handleMarkAllAsRead = async () => {
    if (isMarkingAll || unreadCount === 0) return;
    setIsMarkingAll(true);

    try {
      const result = await markAllNotificationsAsRead();
      if (result.success) {
        // Refresh the page to show updated state
        router.refresh();
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Mark All as Read */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {unreadCount} notifikasi belum dibaca
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll}
            className="text-primary hover:text-primary/80 cursor-pointer"
          >
            {isMarkingAll ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4 mr-2" />
            )}
            Tandai semua dibaca
          </Button>
        </div>
      )}

      {/* Notification Cards */}
      <div className="space-y-3">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            id={notification.id}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            isRead={notification.isRead}
            createdAt={notification.createdAt}
            enrollmentId={notification.enrollmentId}
            extracurricularName={notification.extracurricularName}
          />
        ))}
      </div>
    </div>
  );
}

export default NotificationList;
