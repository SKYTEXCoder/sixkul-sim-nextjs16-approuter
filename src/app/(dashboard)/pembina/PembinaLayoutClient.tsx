/**
 * Pembina Dashboard Layout - Client Component
 *
 * Client-side layout component for Pembina role with navigation.
 * Receives notification data from server parent.
 *
 * @module app/(dashboard)/pembina/PembinaLayoutClient
 */

"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useAuthSync } from "@/hooks/useAuthSync";
import { Sidebar, NavItem } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BookOpen, UserCircle, Settings } from "lucide-react";
import type { PembinaNotification } from "@/lib/pembina-notification-data";

// ============================================
// Pembina Menu Configuration
// ============================================

const pembinaMenuItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/pembina/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Ekstrakurikuler Saya",
    href: "/pembina/ekstrakurikuler",
    icon: BookOpen,
  },
  {
    label: "Profil Saya",
    href: "/pembina/profile",
    icon: UserCircle,
  },
  {
    label: "Pengaturan",
    href: "/pembina/settings",
    icon: Settings,
  },
];

// ============================================
// Props
// ============================================

interface PembinaLayoutClientProps {
  children: React.ReactNode;
  unreadNotificationCount: number;
  notifications: PembinaNotification[];
}

// ============================================
// Layout Component
// ============================================

export function PembinaLayoutClient({
  children,
  unreadNotificationCount,
  notifications,
}: PembinaLayoutClientProps) {
  // Sidebar collapsed state - lifted up for responsive content
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Get user data from Clerk
  const { user, isLoaded } = useUser();

  // Sync user to Prisma database (JIT)
  const { isSyncing } = useAuthSync();

  const userData = {
    name: user?.fullName || user?.username || "Pembina User",
    email: user?.primaryEmailAddress?.emailAddress || "",
    role: "PEMBINA",
    avatarUrl: user?.imageUrl,
  };

  // Show loading state while Clerk is loading or syncing
  if (!isLoaded || isSyncing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar - pass collapse state */}
      <Sidebar
        menuItems={pembinaMenuItems}
        user={userData}
        isCollapsed={isSidebarCollapsed}
        onCollapseChange={setIsSidebarCollapsed}
      />

      {/* Main Content Area - responds to sidebar collapse */}
      <div
        className={cn(
          "transition-all duration-300",
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        {/* Top Navigation with divider and padding */}
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-900">
          {/* Navbar content */}
          <div className="h-14">
            <TopNavbar
              user={userData}
              unreadNotificationCount={unreadNotificationCount}
              pembinaNotifications={notifications}
            />
          </div>

          {/* Clean divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mx-4" />
        </header>

        {/* Page Content */}
        <main className="pt-6 px-4 md:px-6 pb-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default PembinaLayoutClient;
