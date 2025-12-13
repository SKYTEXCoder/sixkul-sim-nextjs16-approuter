/**
 * Student Announcements Page
 * 
 * Displays announcements from all extracurriculars the student is enrolled in.
 * 
 * @module app/(dashboard)/student/announcements/page
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Megaphone,
  Search,
  AlertCircle,
  ChevronRight,
  Calendar,
  Bell,
} from "lucide-react";

// ============================================
// Types
// ============================================

interface Announcement {
  id: string;
  title: string;
  content: string;
  ekskulId: string;
  ekskulName: string;
  createdAt: string;
  formattedDate: string;
  relativeTime: string;
  isNew: boolean;
}

interface AnnouncementsData {
  newCount: number;
  announcements: Announcement[];
}

// ============================================
// Loading Skeleton Component
// ============================================

function AnnouncementsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Search Skeleton */}
      <Skeleton className="h-10 w-full max-w-md" />

      {/* Announcements Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-3" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Main Page Component
// ============================================

export default function StudentAnnouncementsPage() {
  const [data, setData] = useState<AnnouncementsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch announcements data
  useEffect(() => {
    async function fetchAnnouncementsData() {
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with actual API endpoint
        // const response = await fetch("/api/student/announcements");
        // const result = await response.json();
        
        // Mock data for initial development
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockData: AnnouncementsData = {
          newCount: 3,
          announcements: [
            {
              id: "1",
              title: "Latihan Tambahan untuk Kompetisi",
              content: "Untuk persiapan kompetisi antar sekolah, akan diadakan latihan tambahan setiap hari Sabtu pukul 08:00 - 12:00. Diharapkan semua anggota yang terdaftar dalam tim kompetisi untuk hadir tepat waktu.",
              ekskulId: "ekskul-1",
              ekskulName: "Basket",
              createdAt: "2025-12-13T10:00:00Z",
              formattedDate: "13 Desember 2025",
              relativeTime: "1 jam yang lalu",
              isNew: true,
            },
            {
              id: "2",
              title: "Jadwal Latihan Desember",
              content: "Berikut adalah jadwal latihan untuk bulan Desember. Harap perhatikan perubahan jadwal karena libur akhir tahun.",
              ekskulId: "ekskul-2",
              ekskulName: "Paduan Suara",
              createdAt: "2025-12-12T14:30:00Z",
              formattedDate: "12 Desember 2025",
              relativeTime: "1 hari yang lalu",
              isNew: true,
            },
            {
              id: "3",
              title: "Pengumpulan Iuran Bulan Desember",
              content: "Pengumpulan iuran bulanan untuk bulan Desember maksimal tanggal 20 Desember. Silakan serahkan kepada bendahara.",
              ekskulId: "ekskul-1",
              ekskulName: "Basket",
              createdAt: "2025-12-11T09:15:00Z",
              formattedDate: "11 Desember 2025",
              relativeTime: "2 hari yang lalu",
              isNew: true,
            },
            {
              id: "4",
              title: "Hasil Seleksi Anggota Baru",
              content: "Selamat kepada anggota baru yang telah lolos seleksi! Silakan ambil seragam di ruang ekskul.",
              ekskulId: "ekskul-2",
              ekskulName: "Paduan Suara",
              createdAt: "2025-12-08T16:00:00Z",
              formattedDate: "8 Desember 2025",
              relativeTime: "5 hari yang lalu",
              isNew: false,
            },
            {
              id: "5",
              title: "Libur Latihan Akhir Tahun",
              content: "Latihan akan diliburkan pada tanggal 25 Desember - 1 Januari. Latihan akan dimulai kembali pada tanggal 3 Januari 2026.",
              ekskulId: "ekskul-1",
              ekskulName: "Basket",
              createdAt: "2025-12-05T11:00:00Z",
              formattedDate: "5 Desember 2025",
              relativeTime: "1 minggu yang lalu",
              isNew: false,
            },
          ],
        };
        
        setData(mockData);
      } catch (err) {
        console.error("Announcements fetch error:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnnouncementsData();
  }, []);

  // Filter announcements based on search query
  const filteredAnnouncements = data?.announcements.filter(
    (announcement) =>
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.ekskulName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Show loading skeleton
  if (isLoading) {
    return <AnnouncementsSkeleton />;
  }

  // Show error state
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Gagal Memuat Pengumuman
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          {error || "Terjadi kesalahan yang tidak diketahui"}
        </p>
        <Button onClick={() => window.location.reload()}>
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Pengumuman
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Informasi terbaru dari ekstrakurikuler yang kamu ikuti.
          </p>
        </div>
        {data.newCount > 0 && (
          <Badge className="w-fit bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            <Bell className="h-3 w-3 mr-1" />
            {data.newCount} pengumuman baru
          </Badge>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Cari pengumuman..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <div className="text-center py-12">
          <Megaphone className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            {searchQuery ? "Pengumuman tidak ditemukan" : "Belum ada pengumuman"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            {searchQuery
              ? "Coba gunakan kata kunci yang berbeda."
              : "Pengumuman dari ekstrakurikuler akan muncul di sini."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <Link key={announcement.id} href={`/student/announcements/${announcement.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {announcement.title}
                        </h3>
                        {announcement.isNew && (
                          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs">
                            Baru
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {announcement.ekskulName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {announcement.relativeTime}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 line-clamp-2">
                        {announcement.content}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
