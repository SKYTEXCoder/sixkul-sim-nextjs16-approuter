/**
 * Extracurricular Detail Page (Server Component)
 * 
 * Shows full details of an extracurricular with enrollment option.
 * 
 * @module app/(dashboard)/student/ekstrakurikuler/[id]/page
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getOrCreateUserId } from "@/lib/sync-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { JoinButton } from "@/components/ekskul/JoinButton";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle2,
} from "lucide-react";
import { EkskulLogo } from "@/components/ekskul/EkskulLogo";

// ============================================
// Types
// ============================================

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

interface ScheduleData {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location: string;
}

interface ExtracurricularDetailData {
  id: string;
  name: string;
  category: string;
  description: string | null;
  logo_url: string | null;
  status: string;
  created_at: Date;
  pembina: {
    id: string;
    user_id: string;
    nip: string;
    expertise: string | null;
    phone_number: string | null;
    user: {
      full_name: string;
      email: string | null;
      avatar_url: string | null;
    };
  };
  schedules: ScheduleData[];
  enrollments: Array<{ id: string; status: string }>;
}

// ============================================
// Helper: Get Current User ID with JIT Sync
// ============================================

async function getCurrentUserId(): Promise<string | null> {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) return null;
    
    // Use JIT sync to get or create user and return their local DB ID
    return await getOrCreateUserId(userId, sessionClaims);
  } catch {
    return null;
  }
}

// ============================================
// Data Fetching
// ============================================

async function getExtracurricular(id: string): Promise<ExtracurricularDetailData | null> {
  const extracurricular = await prisma.extracurricular.findUnique({
    where: { id },
    include: {
      pembina: {
        include: {
          user: {
            select: {
              full_name: true,
              email: true,
              avatar_url: true,
            },
          },
        },
      },
      schedules: true,
      enrollments: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  return extracurricular;
}

async function getUserEnrollment(userId: string, ekskulId: string) {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      extracurricular_id: ekskulId,
      student: {
        user_id: userId,
      },
    },
  });

  return enrollment;
}

// ============================================
// Day Names
// ============================================

const dayNames: Record<string, string> = {
  SUNDAY: "Minggu",
  MONDAY: "Senin",
  TUESDAY: "Selasa",
  WEDNESDAY: "Rabu",
  THURSDAY: "Kamis",
  FRIDAY: "Jumat",
  SATURDAY: "Sabtu",
};

// ============================================
// Page Component
// ============================================

export default async function EkskulDetailPage({ params }: PageProps) {
  const { id } = await params;
  const extracurricular = await getExtracurricular(id);

  if (!extracurricular) {
    notFound();
  }

  // Check if user is already enrolled
  const userId = await getCurrentUserId();
  let enrollment = null;
  
  if (userId) {
    enrollment = await getUserEnrollment(userId, id);
  }

  const isAlreadyEnrolled = !!enrollment;
  const enrollmentStatus = enrollment?.status;
  const memberCount = extracurricular.enrollments.filter(e => e.status === "APPROVED").length;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/student/ekstrakurikuler">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Ekskul
        </Button>
      </Link>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card>
            <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-t-lg relative flex items-center justify-center">
              <EkskulLogo
                logoUrl={extracurricular.logo_url}
                name={extracurricular.name}
                category={extracurricular.category}
                size="lg"
              />
            </div>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <Badge className="mb-2">{extracurricular.category}</Badge>
                  <CardTitle className="text-2xl">
                    {extracurricular.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {memberCount} anggota aktif
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Aktif
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Deskripsi
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {extracurricular.description || "Tidak ada deskripsi tersedia untuk ekstrakurikuler ini."}
              </p>
            </CardContent>
          </Card>

          {/* Schedule Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Jadwal Kegiatan
              </CardTitle>
              <CardDescription>
                Jadwal rutin ekstrakurikuler ini
              </CardDescription>
            </CardHeader>
            <CardContent>
              {extracurricular.schedules.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  Belum ada jadwal yang ditetapkan.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {extracurricular.schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-slate-900 dark:text-white">
                          {dayNames[schedule.day_of_week] || schedule.day_of_week}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="h-4 w-4" />
                        <span>
                          {schedule.start_time} - {schedule.end_time}
                        </span>
                      </div>
                      {schedule.location && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                          <MapPin className="h-4 w-4" />
                          <span>{schedule.location}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Join Card */}
          <Card>
            <CardHeader>
              <CardTitle>Bergabung Sekarang</CardTitle>
              <CardDescription>
                Daftar untuk menjadi anggota ekstrakurikuler ini
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <JoinButton
                ekskulId={extracurricular.id}
                ekskulName={extracurricular.name}
                isAlreadyEnrolled={isAlreadyEnrolled}
                enrollmentStatus={enrollmentStatus || undefined}
              />

              <p className="text-xs text-slate-500 text-center">
                Pendaftaran akan menunggu persetujuan dari pembina.
              </p>
            </CardContent>
          </Card>

          {/* Pembina Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-500" />
                Pembina
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage
                    src={extracurricular.pembina.user.avatar_url || undefined}
                    alt={extracurricular.pembina.user.full_name}
                  />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg">
                    {extracurricular.pembina.user.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {extracurricular.pembina.user.full_name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {extracurricular.pembina.user.email || "Email tidak tersedia"}
                  </p>
                  {extracurricular.pembina.expertise && (
                    <Badge variant="secondary" className="mt-1">
                      {extracurricular.pembina.expertise}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <Badge className="bg-emerald-100 text-emerald-700">
                  {extracurricular.status}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Kategori</span>
                <span className="text-slate-900 dark:text-white">
                  {extracurricular.category}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Jumlah Jadwal</span>
                <span className="text-slate-900 dark:text-white">
                  {extracurricular.schedules.length} sesi/minggu
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Dibuat</span>
                <span className="text-slate-900 dark:text-white">
                  {new Date(extracurricular.created_at).toLocaleDateString("id-ID")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
