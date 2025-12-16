/**
 * PEMBINA Ekstrakurikuler Index Page
 *
 * Lists all extracurriculars owned by the authenticated PEMBINA.
 * Each card links to the management hub at /pembina/ekstrakurikuler/[id].
 *
 * @module app/(dashboard)/pembina/ekstrakurikuler/page
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Users, Calendar, Clock, ChevronRight } from "lucide-react";

import { getPembinaExtracurriculars } from "@/lib/pembina-ekstrakurikuler-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ============================================
// Page Component
// ============================================

export default async function PembinaEkstrakurikulerPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const extracurriculars = await getPembinaExtracurriculars(userId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Ekstrakurikuler Saya 📚
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Kelola ekstrakurikuler yang Anda bina.
        </p>
      </div>

      {/* Extracurricular List */}
      {extracurriculars.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {extracurriculars.map((ekskul) => (
            <ExtracurricularCard key={ekskul.id} ekskul={ekskul} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Subcomponents
// ============================================

interface ExtracurricularCardProps {
  ekskul: {
    id: string;
    name: string;
    category: string;
    description: string | null;
    status: "ACTIVE" | "INACTIVE";
    memberCount: number;
    pendingCount: number;
    scheduleCount: number;
    sessionCount: number;
  };
}

function ExtracurricularCard({ ekskul }: ExtracurricularCardProps) {
  return (
    <Link href={`/pembina/ekstrakurikuler/${ekskul.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group py-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {ekskul.name}
                </CardTitle>
                <CardDescription>{ekskul.category}</CardDescription>
              </div>
            </div>
            <Badge
              variant={ekskul.status === "ACTIVE" ? "default" : "secondary"}
            >
              {ekskul.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {ekskul.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
              {ekskul.description}
            </p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Users className="h-4 w-4" />
              <span>{ekskul.memberCount} anggota</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Calendar className="h-4 w-4" />
              <span>{ekskul.scheduleCount} jadwal</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Clock className="h-4 w-4" />
              <span>{ekskul.sessionCount} pertemuan</span>
            </div>
            {ekskul.pendingCount > 0 && (
              <div className="flex items-center gap-2 text-amber-600">
                <span className="font-medium">
                  {ekskul.pendingCount} permintaan
                </span>
              </div>
            )}
          </div>

          {/* Action */}
          <div className="mt-4 pt-3 border-t flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="group-hover:text-primary"
            >
              Kelola
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="py-16">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Belum Ada Ekstrakurikuler
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Anda belum ditugaskan sebagai pembina ekstrakurikuler apapun.
            Hubungi admin untuk mendapatkan akses.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
