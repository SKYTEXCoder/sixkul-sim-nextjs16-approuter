"use client";

/**
 * Ekskul Grid Component (Client Component)
 * 
 * Displays a grid of extracurricular cards with reactive search filtering.
 * 
 * @module components/ekskul/EkskulGrid
 */

import { useState, useMemo } from "react";
import Link from "next/link";
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
  Music,
  Trophy,
  Palette,
  GraduationCap,
  Compass,
  Heart,
  Gamepad2,
  Monitor,
  Dumbbell,
} from "lucide-react";
import { EkskulLogo } from "@/components/ekskul/EkskulLogo";
import type { ExtracurricularCardData } from "@/types/ekskul";

// ============================================
// Category Colors & Icons
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

// Icon mapping for categories and common keywords
const getCategoryIcon = (category: string, name: string) => {
  const nameLower = name.toLowerCase();
  
  // Check name for specific keywords first
  if (nameLower.includes("game") || nameLower.includes("video")) return Gamepad2;
  if (nameLower.includes("musik") || nameLower.includes("band") || nameLower.includes("drum")) return Music;
  if (nameLower.includes("basket") || nameLower.includes("futsal") || nameLower.includes("voli")) return Trophy;
  if (nameLower.includes("tenis") || nameLower.includes("bulutangkis")) return Dumbbell;
  if (nameLower.includes("robotik") || nameLower.includes("komputer") || nameLower.includes("programming")) return Monitor;
  if (nameLower.includes("pramuka") || nameLower.includes("paskibra")) return Compass;
  if (nameLower.includes("lukis") || nameLower.includes("seni") || nameLower.includes("tari")) return Palette;
  
  // Fall back to category
  switch (category) {
    case "Teknologi": return Monitor;
    case "Olahraga": return Trophy;
    case "Seni": return Palette;
    case "Akademik": return GraduationCap;
    case "Kepanduan": return Compass;
    case "Sosial": return Heart;
    default: return BookOpen;
  }
};

// Background gradient colors based on category
const categoryGradients: Record<string, string> = {
  Teknologi: "from-blue-400 to-indigo-500",
  Olahraga: "from-orange-400 to-red-500",
  Seni: "from-purple-400 to-pink-500",
  Akademik: "from-emerald-400 to-teal-500",
  Kepanduan: "from-amber-400 to-orange-500",
  Sosial: "from-pink-400 to-rose-500",
  default: "from-slate-400 to-slate-500",
};

// ============================================
// Component Props
// ============================================

interface EkskulGridProps {
  extracurriculars: ExtracurricularCardData[];
}

// ============================================
// Component
// ============================================

export function EkskulGrid({ extracurriculars }: EkskulGridProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter extracurriculars based on search query
  const filteredExtracurriculars = useMemo(() => {
    if (!searchQuery.trim()) {
      return extracurriculars;
    }
    
    const query = searchQuery.toLowerCase();
    return extracurriculars.filter((ekskul) => 
      ekskul.name.toLowerCase().includes(query) ||
      ekskul.category.toLowerCase().includes(query) ||
      (ekskul.description?.toLowerCase().includes(query) ?? false) ||
      ekskul.pembina.user.full_name.toLowerCase().includes(query)
    );
  }, [extracurriculars, searchQuery]);

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

        {/* Search - Now reactive */}
        <div className="relative max-w-sm w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Cari ekstrakurikuler..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              {filteredExtracurriculars.length === extracurriculars.length 
                ? `${extracurriculars.length} Ekstrakurikuler Tersedia`
                : `${filteredExtracurriculars.length} dari ${extracurriculars.length} Ekstrakurikuler`
              }
            </h2>
            <p className="text-blue-100 mt-1">
              {searchQuery 
                ? `Hasil pencarian untuk "${searchQuery}"`
                : "Pilih yang sesuai dengan minat dan bakatmu!"
              }
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BookOpen className="h-5 w-5" />
            <span>Semua ekstrakurikuler aktif dan menerima pendaftaran</span>
          </div>
        </div>
      </div>

      {/* Ekskul Grid */}
      {filteredExtracurriculars.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">
              {searchQuery 
                ? "Tidak ada hasil ditemukan"
                : "Belum ada ekstrakurikuler"
              }
            </h3>
            <p className="text-slate-500 mt-1">
              {searchQuery 
                ? `Coba cari dengan kata kunci lain selain "${searchQuery}"`
                : "Ekstrakurikuler akan ditampilkan di sini setelah ditambahkan oleh admin."
              }
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchQuery("")}
              >
                Hapus Pencarian
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExtracurriculars.map((ekskul) => {
            const categoryColor =
              categoryColors[ekskul.category] || categoryColors.default;
            const memberCount = ekskul.enrollments.filter(e => e.status === "ACTIVE").length;
            const CategoryIcon = getCategoryIcon(ekskul.category, ekskul.name);
            const gradient = categoryGradients[ekskul.category] || categoryGradients.default;

            return (
              <Card
                key={ekskul.id}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Card Header with Gradient and Icon */}
                <div className={`h-32 bg-gradient-to-br ${gradient} relative flex items-center justify-center`}>
                  <EkskulLogo
                    logoUrl={ekskul.logo_url}
                    name={ekskul.name}
                    category={ekskul.category}
                    size="md"
                  />
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
                    <span className="text-slate-400 truncate max-w-[140px]">
                      Pembina: {ekskul.pembina.user.full_name}
                    </span>
                  </div>
                </CardContent>

                <CardFooter>
                  <Link href={`/student/ekstrakurikuler/${ekskul.id}`} className="w-full">
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

export default EkskulGrid;
