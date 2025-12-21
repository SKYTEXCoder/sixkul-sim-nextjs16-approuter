"use client";

/**
 * Admin Dashboard Layout
 *
 * Layout for Admin role with appropriate navigation menu.
 * Content area is responsive to sidebar collapse/expand state.
 *
 * @module app/(dashboard)/admin/layout
 */

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useAuthSync } from "@/hooks/useAuthSync";
import { Sidebar, NavItem } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  Shield,
  BarChart3,
  Bell,
  School,
} from "lucide-react";

// ============================================
// Admin Menu Configuration
// ============================================

const adminMenuItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Manajemen User",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Manajemen Ekstrakurikuler",
    href: "/admin/ekstrakurikuler",
    icon: BookOpen,
  },
  {
    label: "Data Sekolah",
    href: "/admin/school",
    icon: School,
  },
  {
    label: "Laporan",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    label: "Pengumuman",
    href: "/admin/announcements",
    icon: Bell,
  },
  {
    label: "Hak Akses",
    href: "/admin/permissions",
    icon: Shield,
  },
  {
    label: "Pengaturan",
    href: "/admin/settings",
    icon: Settings,
  },
];

// ============================================
// Layout Component
// ============================================

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get user data from Clerk
  const { user, isLoaded } = useUser();

  // Sync user to Prisma database (JIT)
  const { isSyncing } = useAuthSync();

  // Sidebar collapse state - lifted to layout for content responsiveness
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const userData = {
    name: user?.fullName || user?.username || "Admin User",
    email: user?.primaryEmailAddress?.emailAddress || "",
    role: "ADMIN",
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
      {/* Sidebar with controlled collapse state */}
      <Sidebar
        menuItems={adminMenuItems}
        user={userData}
        isCollapsed={isSidebarCollapsed}
        onCollapseChange={setIsSidebarCollapsed}
      />

      {/* Main Content Area - responsive to sidebar state */}
      <div
        className={cn(
          "transition-all duration-300",
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        {/* Top Navigation - Sticky & Styled */}
        <header className="sticky top-0 z-50 w-full h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <TopNavbar user={userData} />
        </header>

        {/* Page Content */}
        <main className="pt-6 px-4 md:px-6 pb-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
