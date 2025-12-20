/**
 * Admin Ekstrakurikuler List Page
 *
 * Displays all ekstrakurikuler with filtering and management actions.
 *
 * @module app/(dashboard)/admin/ekstrakurikuler/page
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Search, Users } from "lucide-react";
import {
  getAllEkstrakurikuler,
  getEkstrakurikulerStats,
} from "@/lib/admin-ekstrakurikuler-data";
import Link from "next/link";

export default async function AdminEkstrakurikulerPage() {
  const [ekstrakurikuler, stats] = await Promise.all([
    getAllEkstrakurikuler(),
    getEkstrakurikulerStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Manajemen Ekstrakurikuler 📚
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Kelola semua ekstrakurikuler dan pembina.
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Ekstrakurikuler
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Ekstrakurikuler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Tidak Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-400">
              {stats.inactive}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">
              Total Pendaftaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {stats.totalEnrollments}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari ekstrakurikuler..."
          className="w-full max-w-md pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Ekstrakurikuler Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ekstrakurikuler.map((ekskul) => (
          <Card
            key={ekskul.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{ekskul.name}</CardTitle>
                    <p className="text-sm text-slate-500">{ekskul.category}</p>
                  </div>
                </div>
                <Badge
                  variant={ekskul.status === "ACTIVE" ? "default" : "secondary"}
                  className={
                    ekskul.status === "ACTIVE"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : ""
                  }
                >
                  {ekskul.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {ekskul.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  {ekskul.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Users className="h-4 w-4" />
                <span>{ekskul._count.enrollments} anggota</span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400">Pembina</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {ekskul.pembina.user.full_name}
                </p>
              </div>

              <Link href={`/admin/ekstrakurikuler/${ekskul.id}`}>
                <Button variant="outline" className="w-full mt-2">
                  Kelola
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {ekstrakurikuler.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-slate-500">
            Belum ada ekstrakurikuler terdaftar.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
