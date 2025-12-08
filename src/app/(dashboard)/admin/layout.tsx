"use client";

/**
 * Admin Dashboard Layout
 * 
 * Layout for Admin role with appropriate navigation menu.
 * 
 * @module app/(dashboard)/admin/layout
 */

import { Sidebar, NavItem } from "@/components/layout/Sidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
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
    label: "Manajemen Ekskul",
    href: "/admin/ekskul",
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
  // TODO: Get user data from context/session
  const user = {
    name: "Admin User",
    email: "admin@sixkul.sch.id",
    role: "ADMIN",
    avatarUrl: undefined,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <Sidebar menuItems={adminMenuItems} user={user} />

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
