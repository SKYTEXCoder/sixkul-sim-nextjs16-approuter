"use client";

/**
 * Pembina Dashboard Layout
 *
 * Layout for Pembina role with appropriate navigation menu.
 *
 * @module app/(dashboard)/pembina/layout
 */

import { useUser } from "@clerk/nextjs";
import { useAuthSync } from "@/hooks/useAuthSync";
import { Sidebar, NavItem } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { LayoutDashboard, BookOpen } from "lucide-react";

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
      {/* Sidebar */}
      <Sidebar menuItems={pembinaMenuItems} user={userData} />

      {/* Main Content Area */}
      <div className="md:ml-64 transition-all duration-300">
        {/* Top Navigation */}
        <TopNavbar user={userData} />

        {/* Page Content */}
        <main className="pt-20 px-4 md:px-6 pb-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
