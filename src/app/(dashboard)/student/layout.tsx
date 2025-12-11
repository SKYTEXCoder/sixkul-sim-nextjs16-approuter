"use client";

/**
 * Student Dashboard Layout
 * 
 * Layout for Student (SISWA) role with appropriate navigation menu.
 * 
 * @module app/(dashboard)/student/layout
 */

import { useUser } from "@clerk/nextjs";
import { useAuthSync } from "@/hooks/useAuthSync";
import { Sidebar, NavItem } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  History,
  Trophy,
} from "lucide-react";

// ============================================
// Student Menu Configuration
// ============================================

const studentMenuItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/student/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Jelajahi Ekskul",
    href: "/student/ekskul",
    icon: BookOpen,
  },
  {
    label: "Ekskul Saya",
    href: "/student/my-ekskul",
    icon: Trophy,
  },
  {
    label: "Jadwal Saya",
    href: "/student/schedule",
    icon: Calendar,
  },
  {
    label: "Riwayat & Nilai",
    href: "/student/history",
    icon: History,
  },
];

// ============================================
// Layout Component
// ============================================

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get user data from Clerk
  const { user, isLoaded } = useUser();
  
  // Sync user to Prisma database (JIT)
  const { isSyncing } = useAuthSync();
  
  const userData = {
    name: user?.fullName || user?.username || "Student User",
    email: user?.primaryEmailAddress?.emailAddress || "",
    role: "SISWA",
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
      <Sidebar menuItems={studentMenuItems} user={userData} />

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
