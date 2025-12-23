"use client";

/**
 * SIXKUL Top Navigation Bar Component
 *
 * Includes search, notifications, and logout functionality.
 *
 * @module components/layout/TopNavbar
 */

import { useState } from "react";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, User, Settings, Menu, Loader2 } from "lucide-react";
import { NotificationDropdown } from "@/components/pembina/NotificationDropdown";
import type { PembinaNotification } from "@/lib/pembina-notification-data";

// ============================================
// Types
// ============================================

interface TopNavbarProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
  };
  onMenuClick?: () => void;
  showSearch?: boolean;
  unreadNotificationCount?: number;
  // PEMBINA-specific: notifications for dropdown
  pembinaNotifications?: PembinaNotification[];
}

// ============================================
// TopNavbar Component
// ============================================

export function TopNavbar({
  user,
  onMenuClick,
  unreadNotificationCount = 0,
  pembinaNotifications = [],
}: TopNavbarProps) {
  const { signOut } = useClerk();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ----------------------------------------
  // Handle Logout
  // ----------------------------------------
  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await signOut({ redirectUrl: "/sign-in" });

      toast.success("Logout berhasil", {
        description: "Sampai jumpa lagi!",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Terjadi kesalahan", {
        description: "Tidak dapat logout. Silakan coba lagi.",
      });
      setIsLoggingOut(false);
    }
    // Note: Don't reset isLoggingOut in finally block since page will redirect on success
  };

  return (
    <div className="flex items-center justify-between h-full px-4 md:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-slate-600 dark:text-slate-400"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search Bar - Removed for cleaner UI */}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Notification Bell - Role-specific behavior */}
        {user?.role === "PEMBINA" ? (
          // PEMBINA: Show dropdown with notifications
          <NotificationDropdown
            notifications={pembinaNotifications}
            unreadCount={unreadNotificationCount}
          />
        ) : (
          // SISWA: Link to notifications page, ADMIN: placeholder
          <Link
            href={
              user?.role === "SISWA"
                ? "/student/notifications"
                : "/admin/announcements"
            }
            className="relative p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            {/* Notification badge - show only when unread count > 0 */}
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
            )}
          </Link>
        )}

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-auto p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback className="bg-primary text-white text-sm">
                  {user?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {user?.name}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                  {user?.role}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{user?.name}</span>
                <span className="text-xs font-normal text-slate-500">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={
                  user?.role === "SISWA"
                    ? "/student/profile"
                    : user?.role === "PEMBINA"
                      ? "/pembina/profile"
                      : "/admin/profile"
                }
              >
                <User className="mr-2 h-4 w-4" />
                Profil Saya
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={
                  user?.role === "SISWA"
                    ? "/student/settings"
                    : user?.role === "PEMBINA"
                      ? "/pembina/settings"
                      : "/admin/settings"
                }
              >
                <Settings className="mr-2 h-4 w-4" />
                Pengaturan
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
            >
              {isLoggingOut ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              {isLoggingOut ? "Logging out..." : "Logout"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default TopNavbar;
