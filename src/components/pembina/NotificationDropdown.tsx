"use client";

/**
 * PEMBINA Notification Dropdown Component
 *
 * Bell icon dropdown for viewing and interacting with notifications.
 * No standalone /pembina/notifications route — dropdown only.
 *
 * @module components/pembina/NotificationDropdown
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  PembinaNotification,
  markPembinaNotificationAsRead,
  markAllPembinaNotificationsAsRead,
} from "@/lib/pembina-notification-data";

// ============================================
// Routing Helper (client-side)
// ============================================

/**
 * Derive target route from a notification.
 * Uses Option A: enrollment → extracurricular.
 */
function getNotificationTargetRoute(notification: PembinaNotification): string {
  const { extracurricularId, type } = notification;

  // Fallback if no extracurricular context
  if (!extracurricularId) {
    return "/pembina/ekstrakurikuler";
  }

  // Route based on notification type
  switch (type) {
    case "ENROLLMENT":
      return `/pembina/ekstrakurikuler/${extracurricularId}/enrollments`;
    case "SCHEDULE":
      return `/pembina/ekstrakurikuler/${extracurricularId}/sessions`;
    case "ANNOUNCEMENT":
      return `/pembina/ekstrakurikuler/${extracurricularId}/announcements`;
    case "ATTENDANCE":
      return `/pembina/ekstrakurikuler/${extracurricularId}/attendance`;
    default:
      return `/pembina/ekstrakurikuler/${extracurricularId}`;
  }
}

// ============================================
// Types
// ============================================

interface NotificationDropdownProps {
  notifications: PembinaNotification[];
  unreadCount: number;
}

// ============================================
// Component
// ============================================

export function NotificationDropdown({
  notifications,
  unreadCount,
}: NotificationDropdownProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  // ----------------------------------------
  // Handle Notification Click
  // ----------------------------------------
  const handleNotificationClick = async (notification: PembinaNotification) => {
    // Mark as read first
    if (!notification.isRead) {
      startTransition(async () => {
        await markPembinaNotificationAsRead(notification.id);
      });
    }

    // Navigate to target route
    const targetRoute = getNotificationTargetRoute(notification);
    setIsOpen(false);
    router.push(targetRoute);
  };

  // ----------------------------------------
  // Handle Mark All as Read
  // ----------------------------------------
  const handleMarkAllAsRead = async () => {
    startTransition(async () => {
      await markAllPembinaNotificationsAsRead();
    });
  };

  // ----------------------------------------
  // Get notification icon color based on type
  // ----------------------------------------
  const getTypeColor = (type: string) => {
    switch (type) {
      case "ENROLLMENT":
        return "text-blue-500";
      case "SCHEDULE":
        return "text-green-500";
      case "ANNOUNCEMENT":
        return "text-amber-500";
      case "ATTENDANCE":
        return "text-purple-500";
      default:
        return "text-slate-500";
    }
  };

  // ----------------------------------------
  // Get notification type label
  // ----------------------------------------
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ENROLLMENT":
        return "Pendaftaran";
      case "SCHEDULE":
        return "Jadwal";
      case "ANNOUNCEMENT":
        return "Pengumuman";
      case "ATTENDANCE":
        return "Absensi";
      default:
        return "Notifikasi";
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Bell className="h-5 w-5" />
          {/* Unread badge */}
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        {/* Header */}
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-semibold">Notifikasi</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs text-primary hover:text-primary/80"
              onClick={handleMarkAllAsRead}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <CheckCheck className="h-3 w-3 mr-1" />
              )}
              Tandai semua dibaca
            </Button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Notification List */}
        {notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Tidak ada notifikasi
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[300px]">
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start gap-1 p-3 cursor-pointer",
                  !notification.isRead && "bg-primary/5"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                {/* Header row */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      getTypeColor(notification.type)
                    )}
                  >
                    {getTypeLabel(notification.type)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </span>
                </div>

                {/* Title */}
                <p
                  className={cn(
                    "text-sm line-clamp-1",
                    !notification.isRead
                      ? "font-medium text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-300"
                  )}
                >
                  {notification.title}
                </p>

                {/* Message preview */}
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {notification.message}
                </p>

                {/* Extracurricular context */}
                {notification.extracurricularName && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {notification.extracurricularName}
                  </span>
                )}

                {/* Read indicator */}
                {notification.isRead && (
                  <div className="absolute top-3 right-3">
                    <Check className="h-3 w-3 text-slate-400" />
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}

        {/* Show more indicator */}
        {notifications.length > 10 && (
          <>
            <DropdownMenuSeparator />
            <div className="py-2 text-center">
              <span className="text-xs text-slate-500">
                +{notifications.length - 10} notifikasi lainnya
              </span>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationDropdown;
