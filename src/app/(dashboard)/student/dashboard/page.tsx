/**
 * Student Dashboard Page
 * 
 * Main dashboard view for Student (SISWA) role.
 * 
 * @module app/(dashboard)/student/dashboard/page
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
  Calendar,
  CheckCircle2,
  Clock,
  Trophy,
  TrendingUp,
} from "lucide-react";

export default function StudentDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Selamat Datang, Siswa! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Lihat aktivitas dan perkembangan ekstrakurikuler kamu.
          </p>
        </div>
        <Button className="w-fit">
          <BookOpen className="mr-2 h-4 w-4" />
          Jelajahi Ekskul
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-100">
              Ekskul Diikuti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">2</span>
              <Trophy className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-emerald-100">
              Kehadiran
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">95%</span>
              <CheckCircle2 className="h-8 w-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-amber-100">
              Jadwal Minggu Ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">4</span>
              <Calendar className="h-8 w-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-purple-100">
              Poin Prestasi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">150</span>
              <TrendingUp className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ekskul Saya */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-blue-500" />
              Ekskul Saya
            </CardTitle>
            <CardDescription>
              Ekstrakurikuler yang sedang kamu ikuti
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Robotik", category: "Teknologi", status: "APPROVED" },
              { name: "Basket", category: "Olahraga", status: "APPROVED" },
            ].map((ekskul, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {ekskul.name}
                  </p>
                  <p className="text-sm text-slate-500">{ekskul.category}</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Aktif
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Jadwal Mendatang */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Jadwal Mendatang
            </CardTitle>
            <CardDescription>Kegiatan dalam 7 hari ke depan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Latihan Robotik", day: "Senin", time: "15:00 - 17:00" },
              { name: "Latihan Basket", day: "Rabu", time: "15:30 - 17:30" },
              { name: "Latihan Robotik", day: "Jumat", time: "15:00 - 17:00" },
            ].map((schedule, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {schedule.name}
                  </p>
                  <p className="text-sm text-slate-500">{schedule.day}</p>
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {schedule.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
