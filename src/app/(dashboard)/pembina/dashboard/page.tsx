/**
 * Pembina Dashboard Page
 * 
 * Main dashboard view for Pembina role.
 * 
 * @module app/(dashboard)/pembina/dashboard/page
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
  ClipboardCheck,
  Users,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function PembinaDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Selamat Datang, Pembina! 🎓
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Kelola ekstrakurikuler dan pantau perkembangan siswa.
          </p>
        </div>
        <Button className="w-fit bg-emerald-600 hover:bg-emerald-700">
          <ClipboardCheck className="mr-2 h-4 w-4" />
          Input Absensi
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-emerald-100">
              Ekskul Dikelola
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">3</span>
              <BookOpen className="h-8 w-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-100">
              Total Anggota
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">48</span>
              <Users className="h-8 w-8 text-blue-200" />
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
              <span className="text-3xl font-bold">6</span>
              <Calendar className="h-8 w-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardDescription className="text-red-100">
              Perlu Persetujuan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">5</span>
              <AlertCircle className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ekskul & Pendaftar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              Ekskul Saya
            </CardTitle>
            <CardDescription>
              Ekstrakurikuler yang Anda bimbing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Robotik", members: 24, status: "ACTIVE" },
              { name: "Paskibra", members: 15, status: "ACTIVE" },
              { name: "PMR", members: 9, status: "ACTIVE" },
            ].map((ekskul, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {ekskul.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {ekskul.members} anggota
                  </p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Aktif
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pendaftaran Baru */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Pendaftaran Baru
            </CardTitle>
            <CardDescription>Menunggu persetujuan Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Siti Nurhaliza", ekskul: "Robotik", date: "Hari ini" },
              { name: "Ahmad Rizki", ekskul: "Paskibra", date: "Kemarin" },
              { name: "Dewi Lestari", ekskul: "PMR", date: "2 hari lalu" },
            ].map((pending, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {pending.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {pending.ekskul} • {pending.date}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    Tolak
                  </Button>
                  <Button size="sm">Setujui</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Jadwal Hari Ini */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Jadwal Hari Ini
          </CardTitle>
          <CardDescription>Kegiatan yang perlu Anda hadiri</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "Latihan Robotik", time: "15:00 - 17:00", location: "Lab Komputer" },
              { name: "Rapat Paskibra", time: "16:00 - 17:00", location: "Aula" },
            ].map((schedule, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <p className="font-medium text-slate-900 dark:text-white">
                  {schedule.name}
                </p>
                <p className="text-sm text-slate-500 mt-1">{schedule.time}</p>
                <p className="text-sm text-slate-400 mt-0.5">
                  📍 {schedule.location}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
