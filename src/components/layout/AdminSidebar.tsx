"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Trophy,
  Settings,
  FileText, // Changed/Added for Reports
  Calendar,
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Ekstrakurikuler", href: "/admin/ekstrakurikuler", icon: Trophy },
  { name: "Schedules", href: "/admin/schedules", icon: Calendar },
  { name: "Attendance", href: "/admin/attendance", icon: ClipboardCheck },
  { name: "Laporan", href: "/admin/reports", icon: FileText }, // New Link
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-screen flex flex-col fixed left-0 top-0 pt-16 z-40">
      <div className="p-4 flex-1 overflow-y-auto">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          SIXKUL v0.1.0
          <br />
          Admin Panel
        </div>
      </div>
    </div>
  );
}
