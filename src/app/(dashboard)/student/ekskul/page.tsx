/**
 * Browse Extracurriculars Page (Server Component)
 * 
 * Lists all active extracurriculars for students to browse and join.
 * Uses direct Prisma queries as a Server Component.
 * 
 * @module app/(dashboard)/student/ekskul/page
 */

import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Users,
  Search,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// ============================================
// Category Colors
// ============================================

const categoryColors: Record<string, string> = {
  Teknologi: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Olahraga: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Seni: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Akademik: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Kepanduan: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Sosial: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  default: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400",
};

// ============================================
// Type Definitions
// ============================================

interface ExtracurricularCardData {
  id: string;
  name: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  pembina: {
    user: {
      full_name: string;
    };
  };
  enrollments: Array<{ id: string; status: string }>;
}

// ============================================
// Data Fetching
// ============================================

async function getActiveExtracurriculars(): Promise<ExtracurricularCardData[]> {
  const extracurriculars = await prisma.extracurricular.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      pembina: {
        include: {
          user: {
            select: {
              full_name: true,
            },
          },
        },
      },
      enrollments: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return extracurriculars;
}

// ============================================
// Page Component
// ============================================

export default async function BrowseEkskulPage() {
  const extracurriculars = await getActiveExtracurriculars();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-blue-500" />
            Jelajahi Ekstrakurikuler
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Temukan dan daftar ke ekstrakurikuler yang kamu minati
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Cari ekstrakurikuler..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              {extracurriculars.length} Ekstrakurikuler Tersedia
            </h2>
            <p className="text-blue-100 mt-1">
              Pilih yang sesuai dengan minat dan bakatmu!
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-5 w-5" />
            <span>Semua ekstrakurikuler aktif dan menerima pendaftaran</span>
          </div>
        </div>
      </div>

      {/* Ekskul Grid */}
      {extracurriculars.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
              Belum ada ekstrakurikuler
            </h3>
            <p className="text-slate-500 mt-1">
              Ekstrakurikuler akan ditampilkan di sini setelah ditambahkan oleh admin.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {extracurriculars.map((ekskul) => {
            const categoryColor =
              categoryColors[ekskul.category] || categoryColors.default;
            const memberCount = ekskul.enrollments.filter(e => e.status === "APPROVED").length;

            return (
              <Card
                key={ekskul.id}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Card Header with Gradient */}
                <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 relative flex items-center justify-center">
                  {ekskul.logo_url ? (
                    <img
                      src={ekskul.logo_url}
                      alt={ekskul.name}
                      className="h-20 w-20 object-contain"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-white dark:bg-slate-600 flex items-center justify-center shadow-md">
                      <BookOpen className="h-10 w-10 text-slate-400" />
                    </div>
                  )}
                  {/* Category Badge */}
                  <Badge
                    className={`absolute top-3 right-3 ${categoryColor}`}
                  >
                    {ekskul.category}
                  </Badge>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {ekskul.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {ekskul.description || "Tidak ada deskripsi tersedia."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-slate-500">
                      <Users className="h-4 w-4" />
                      <span>{memberCount} anggota</span>
                    </div>
                    <span className="text-slate-400">
                      Pembina: {ekskul.pembina.user.full_name}
                    </span>
                  </div>
                </CardContent>

                <CardFooter>
                  <Link href={`/student/ekskul/${ekskul.id}`} className="w-full">
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all"
                    >
                      Lihat Detail
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
