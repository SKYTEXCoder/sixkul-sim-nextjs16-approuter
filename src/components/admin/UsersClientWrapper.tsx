"use client";

/**
 * UsersClientWrapper Component
 *
 * Client wrapper for admin users page with reactive search
 * and create user dialog integration.
 *
 * @module components/admin/UsersClientWrapper
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Users, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateUserDialog } from "./CreateUserDialog";
import { PembinaActivityMetrics } from "@/lib/admin/admin-data-aggregation";
import { PembinaActivityList } from "./PembinaActivityList";

interface UserData {
  id: string;
  clerk_id: string;
  username: string;
  email: string | null;
  full_name: string;
  role: string;
  avatar_url: string | null;
  created_at: Date;
  studentProfile?: {
    id: string;
    nis: string;
    class_name: string;
    major: string;
  } | null;
  pembinaProfile?: {
    id: string;
    nip: string;
    expertise: string | null;
  } | null;
  isActive: boolean;
}

interface UserStats {
  total: number;
  byRole: {
    ADMIN: number;
    PEMBINA: number;
    SISWA: number;
  };
  active: number;
  inactive: number;
}

interface UsersClientWrapperProps {
  users: UserData[];
  stats: UserStats;
  pembinaMetrics?: PembinaActivityMetrics[];
}

export function UsersClientWrapper({
  users,
  stats,
  pembinaMetrics = [],
}: UsersClientWrapperProps) {
  const [activeTab, setActiveTab] = useState<"users" | "pembina">("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  // Reactive filtering
  const filteredUsers = useMemo(() => {
    let result = users;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.full_name.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.studentProfile?.nis.toLowerCase().includes(query) ||
          user.pembinaProfile?.nip.toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (roleFilter) {
      result = result.filter((user) => user.role === roleFilter);
    }

    return result;
  }, [users, searchQuery, roleFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Manajemen User 👥
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Kelola semua pengguna sistem SIXKUL.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex text-sm font-medium">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-2 ${
                activeTab === "users"
                  ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4" />
              Daftar User
            </button>
            <button
              onClick={() => setActiveTab("pembina")}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-2 ${
                activeTab === "pembina"
                  ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Activity className="w-4 h-4" />
              Monitoring Pembina
            </button>
          </div>
          <CreateUserDialog />
        </div>
      </div>

      {activeTab === "users" ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  Total User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  Siswa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.byRole.SISWA}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  Pembina
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.byRole.PEMBINA}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                  Admin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">
                  {stats.byRole.ADMIN}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={roleFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setRoleFilter(null)}
                className="cursor-pointer"
              >
                Semua
              </Button>
              <Button
                variant={roleFilter === "SISWA" ? "default" : "outline"}
                size="sm"
                onClick={() => setRoleFilter("SISWA")}
                className="cursor-pointer"
              >
                Siswa
              </Button>
              <Button
                variant={roleFilter === "PEMBINA" ? "default" : "outline"}
                size="sm"
                onClick={() => setRoleFilter("PEMBINA")}
                className="cursor-pointer"
              >
                Pembina
              </Button>
              <Button
                variant={roleFilter === "ADMIN" ? "default" : "outline"}
                size="sm"
                onClick={() => setRoleFilter("ADMIN")}
                className="cursor-pointer"
              >
                Admin
              </Button>
            </div>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Daftar User ({filteredUsers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-medium text-slate-500">
                        Nama
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">
                        ID
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-slate-500">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                              {user.full_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-900 dark:text-white">
                              {user.full_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {user.email || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              user.role === "ADMIN"
                                ? "destructive"
                                : user.role === "PEMBINA"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-sm font-mono">
                          {user.studentProfile?.nis ||
                            user.pembinaProfile?.nip ||
                            "-"}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={user.isActive ? "default" : "secondary"}
                            className={
                              user.isActive
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-slate-100 text-slate-500"
                            }
                          >
                            {user.isActive ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="cursor-pointer"
                            >
                              Detail
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  {searchQuery || roleFilter
                    ? "Tidak ada user yang sesuai filter."
                    : "Belum ada user terdaftar."}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <PembinaActivityList metrics={pembinaMetrics} />
      )}
    </div>
  );
}
