"use client";

/**
 * Pembina Dashboard Layout
 *
 * Layout for Pembina role with appropriate navigation menu.
 *
 * @module app/(dashboard)/pembina/layout
 */

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useAuthSync } from "@/hooks/useAuthSync";
import { Sidebar, NavItem } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { LayoutDashboard, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

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
];

// ============================================
// Layout Component
// ============================================

export default function PembinaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          isSidebarCollapsed ? "md:ml-20" : "md:ml-64",
        )}
      >
        {/* Top Navigation with divider and padding */}
        <header className="sticky top-0 z-30 bg-white dark:bg-slate-900">
          {/* Top padding to move navbar away from browser edge */}
          <div className="pt-3" />

          {/* Navbar content */}
          <div className="h-14">
            <TopNavbar user={userData} />
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
