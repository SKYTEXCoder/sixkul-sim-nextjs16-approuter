"use client";

/**
 * Student Dashboard Layout
 * 
 * Layout for Student (SISWA) role with appropriate navigation menu.
 * 
 * @module app/(dashboard)/student/layout
 */

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useAuthSync } from "@/hooks/useAuthSync";
import { Sidebar, NavItem } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  History,
  Trophy,
  ClipboardCheck,
  Megaphone,
  UserCircle,
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
    href: "/student/enrollments",
    icon: Trophy,
  },
  {
    label: "Jadwal Saya",
    href: "/student/schedule",
    icon: Calendar,
  },
  {
    label: "Absensi Saya",
    href: "/student/attendance",
    icon: ClipboardCheck,
  },
  {
    label: "Pengumuman",
    href: "/student/announcements",
    icon: Megaphone,
  },
  {
    label: "Riwayat & Nilai",
    href: "/student/history",
    icon: History,
  },
  {
    label: "Profil Saya",
    href: "/student/profile",
    icon: UserCircle,
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
  // Sidebar collapse state - managed here to make content responsive
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
      <Sidebar 
        menuItems={studentMenuItems} 
        user={userData}
        isCollapsed={isSidebarCollapsed}
        onCollapseChange={setIsSidebarCollapsed}
      />

      {/* Main Content Area - responsive to sidebar state */}
      <div className={cn(
        "transition-all duration-300",
        isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
      )}>
        {/* Top Navigation - also responsive to sidebar state */}
        <header className={cn(
          "fixed top-0 right-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300",
          isSidebarCollapsed ? "left-0 md:left-20" : "left-0 md:left-64"
        )}>
          <TopNavbar user={userData} />
        </header>

        {/* Page Content */}
        <main className="pt-20 px-4 md:px-6 pb-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
