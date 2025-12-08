"use client";

/**
 * SIXKUL Sidebar Component
 * 
 * Reusable navigation sidebar for dashboard layouts.
 * Accepts menu items with labels, hrefs, and icons.
 * 
 * @module components/layout/Sidebar
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LucideIcon,
} from "lucide-react";

// ============================================
// Types
// ============================================

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
}

export interface SidebarProps {
  menuItems: NavItem[];
  user: {
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
  };
  accentColor?: string;
}

// ============================================
// Role Colors
// ============================================

const roleColors = {
  ADMIN: "from-red-500 to-rose-600",
  PEMBINA: "from-emerald-500 to-teal-600",
  SISWA: "from-blue-500 to-indigo-600",
} as const;

const roleLabels = {
  ADMIN: "Administrator",
  PEMBINA: "Pembina",
  SISWA: "Siswa",
} as const;

// ============================================
// Sidebar Component
// ============================================

export function Sidebar({ menuItems, user }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const gradientColor = roleColors[user.role as keyof typeof roleColors] || roleColors.SISWA;
  const roleLabel = roleLabels[user.role as keyof typeof roleLabels] || user.role;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header / Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-slate-800",
        isCollapsed ? "justify-center" : ""
      )}>
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br",
          gradientColor
        )}>
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white">SIXKUL</span>
            <span className="text-xs text-slate-400">Dashboard</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                    isActive
                      ? `bg-gradient-to-r ${gradientColor} text-white shadow-lg`
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  )}
                >
                  <Icon className={cn(
                    "flex-shrink-0 w-5 h-5 transition-transform",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )} />
                  {!isCollapsed && (
                    <>
                      <span className="font-medium truncate">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          "ml-auto text-xs font-semibold px-2 py-0.5 rounded-full",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-700 text-slate-300"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className={cn(
        "border-t border-slate-800 p-4",
        isCollapsed ? "flex justify-center" : ""
      )}>
        {isCollapsed ? (
          <Avatar className="h-10 w-10 border-2 border-slate-700">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="bg-slate-700 text-slate-300 text-sm">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-slate-700">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback className="bg-slate-700 text-slate-300 text-sm">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-slate-400 truncate">{roleLabel}</p>
            </div>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </aside>
  );
}

export default Sidebar;
