/**
 * Admin Ekstrakurikuler Detail Page
 *
 * View and manage ekstrakurikuler details, including PEMBINA assignment.
 *
 * @module app/(dashboard)/admin/ekstrakurikuler/[id]/page
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Calendar,
  Edit,
  Archive,
  User,
} from "lucide-react";
import { getEkstrakurikulerById } from "@/lib/admin-ekstrakurikuler-data";
import { getAvailablePembina } from "@/lib/admin-user-data";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEkstrakurikulerDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  const [ekskul, availablePembina] = await Promise.all([
    getEkstrakurikulerById(id),
    getAvailablePembina(),
  ]);

  if (!ekskul) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/ekstrakurikuler">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {ekskul.name}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {ekskul.category}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {ekskul.status === "ACTIVE" && (
            <Button
              variant="outline"
              className="text-amber-600 hover:text-amber-700"
            >
              <Archive className="mr-2 h-4 w-4" />
              Arsipkan
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Informasi Ekstrakurikuler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                  <BookOpen className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {ekskul.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{ekskul.category}</Badge>
                    <Badge
                      variant={
                        ekskul.status === "ACTIVE" ? "default" : "secondary"
                      }
                      className={
                        ekskul.status === "ACTIVE"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : ""
                      }
                    >
                      {ekskul.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
                    </Badge>
                  </div>
                </div>
              </div>

              {ekskul.description && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-500 mb-1">Deskripsi</p>
                  <p className="text-slate-700 dark:text-slate-300">
                    {ekskul.description}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 mb-1">Dibuat</p>
                <p className="text-slate-700 dark:text-slate-300">
                  {ekskul.created_at.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-500" />
                Statistik
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-2xl font-bold text-blue-600">
                    {ekskul._count.enrollments}
                  </p>
                  <p className="text-sm text-slate-500">Anggota</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <p className="text-2xl font-bold text-emerald-600">
                    {ekskul._count.sessions}
                  </p>
                  <p className="text-sm text-slate-500">Pertemuan</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <p className="text-2xl font-bold text-purple-600">
                    {ekskul._count.schedules}
                  </p>
                  <p className="text-sm text-slate-500">Jadwal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* PEMBINA Assignment Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-500" />
                Pembina
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-medium">
                  {ekskul.pembina.user.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {ekskul.pembina.user.full_name}
                  </p>
                  <p className="text-sm text-slate-500">
                    NIP: {ekskul.pembina.nip}
                  </p>
                </div>
              </div>

              {/* Change Pembina - Placeholder for interactive functionality */}
              <div>
                <label className="text-sm text-slate-500 block mb-2">
                  Ganti Pembina
                </label>
                <select className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
                  <option value="">Pilih pembina...</option>
                  {availablePembina.map((pembina) => (
                    <option key={pembina.id} value={pembina.id}>
                      {pembina.user.full_name} ({pembina.nip})
                    </option>
                  ))}
                </select>
                <Button className="w-full mt-3" variant="outline">
                  Simpan Perubahan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-500" />
                Info Lainnya
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-500">
              <p>
                Untuk mengelola jadwal, pertemuan, dan absensi, silakan gunakan
                akun Pembina yang ditugaskan.
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Admin tidak dapat melakukan operasi harian ekstrakurikuler.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
