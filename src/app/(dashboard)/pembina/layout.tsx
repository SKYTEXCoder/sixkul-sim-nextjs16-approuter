"use client";

/**
 * Pembina Dashboard Layout
 * 
 * Layout for Pembina role with appropriate navigation menu.
 * 
 * @module app/(dashboard)/pembina/layout
 */

import { Sidebar, NavItem } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  Calendar,
  BookOpen,
  BarChart3,
} from "lucide-react";

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
    label: "Ekskul Saya",
    href: "/pembina/my-ekskul",
    icon: BookOpen,
  },
  {
    label: "Daftar Anggota",
    href: "/pembina/members",
    icon: Users,
  },
  {
    label: "Input Absensi",
    href: "/pembina/attendance",
    icon: ClipboardCheck,
  },
  {
    label: "Kelola Jadwal",
    href: "/pembina/schedule",
    icon: Calendar,
  },
  {
    label: "Laporan",
    href: "/pembina/reports",
    icon: BarChart3,
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
  // TODO: Get user data from context/session
  const user = {
    name: "Pembina User",
    email: "pembina@sixkul.sch.id",
    role: "PEMBINA",
    avatarUrl: undefined,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <Sidebar menuItems={pembinaMenuItems} user={user} />

      {/* Main Content Area */}
      <div className="md:ml-64 transition-all duration-300">
        {/* Top Navigation */}
        <TopNavbar user={user} />

        {/* Page Content */}
        <main className="pt-20 px-4 md:px-6 pb-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
