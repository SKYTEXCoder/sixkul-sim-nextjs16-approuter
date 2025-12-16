/**
 * Admin Dashboard Page
 *
 * Main dashboard view for Admin role.
 *
 * @module app/(dashboard)/admin/dashboard/page
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  UserPlus,
  TrendingUp,
  Activity,
  Shield,
  Bell,
  BarChart3,
} from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard Administrator 🏫
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Kelola sistem SIXKUL dan pantau aktivitas keseluruhan.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Bell className="mr-2 h-4 w-4" />
            Pengumuman
          </Button>
          <Button className="bg-red-600 hover:bg-red-700">
            <UserPlus className="mr-2 h-4 w-4" />
            Tambah User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-red-100">
              Total User
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold">156</span>
                <p className="text-xs text-red-200 mt-1">+12 bulan ini</p>
              </div>
              <Users className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-100">
              Ekskul Aktif
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold">12</span>
                <p className="text-xs text-blue-200 mt-1">5 kategori</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-emerald-100">
              Total Pembina
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold">8</span>
                <p className="text-xs text-emerald-200 mt-1">Aktif semua</p>
              </div>
              <Shield className="h-8 w-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-amber-100">
              Keaktifan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold">89%</span>
                <p className="text-xs text-amber-200 mt-1">
                  ↑ 5% dari bulan lalu
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Distribusi User
            </CardTitle>
            <CardDescription>Berdasarkan role dalam sistem</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  145
                </p>
                <p className="text-sm text-slate-500 mt-1">Siswa</p>
                <Badge variant="secondary" className="mt-2">
                  93%
                </Badge>
              </div>
              <div className="text-center p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  8
                </p>
                <p className="text-sm text-slate-500 mt-1">Pembina</p>
                <Badge variant="secondary" className="mt-2">
                  5%
                </Badge>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  3
                </p>
                <p className="text-sm text-slate-500 mt-1">Admin</p>
                <Badge variant="secondary" className="mt-2">
                  2%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              Aksi Cepat
            </CardTitle>
            <CardDescription>Manajemen sistem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah User Baru
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BookOpen className="mr-2 h-4 w-4" />
              Tambah Ekskul
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              Lihat Laporan
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Bell className="mr-2 h-4 w-4" />
              Buat Pengumuman
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Ekskul List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-500" />
              Aktivitas Terbaru
            </CardTitle>
            <CardDescription>Log aktivitas sistem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                action: "User baru terdaftar",
                user: "Siti Nurhaliza",
                time: "2 menit lalu",
              },
              {
                action: "Pendaftaran ekskul",
                user: "Ahmad Rizki → Robotik",
                time: "15 menit lalu",
              },
              {
                action: "Absensi diinput",
                user: "Pembina: Basket",
                time: "1 jam lalu",
              },
              {
                action: "Ekskul baru dibuat",
                user: "Admin: English Club",
                time: "3 jam lalu",
              },
            ].map((activity, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white text-sm">
                    {activity.action}
                  </p>
                  <p className="text-xs text-slate-500">{activity.user}</p>
                </div>
                <span className="text-xs text-slate-400">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Ekskul */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              Ekskul Terpopuler
            </CardTitle>
            <CardDescription>Berdasarkan jumlah anggota</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Basket", members: 28, category: "Olahraga" },
              { name: "Robotik", members: 24, category: "Teknologi" },
              { name: "Paskibra", members: 20, category: "Kepanduan" },
              { name: "PMR", members: 18, category: "Sosial" },
            ].map((ekskul, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-400">
                    #{i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {ekskul.name}
                    </p>
                    <p className="text-xs text-slate-500">{ekskul.category}</p>
                  </div>
                </div>
                <Badge variant="secondary">{ekskul.members} anggota</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
