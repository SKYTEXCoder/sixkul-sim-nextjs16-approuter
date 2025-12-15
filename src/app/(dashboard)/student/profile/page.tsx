/**
 * Student Profile Page — Profil Saya
 *
 * READ-ONLY profile dashboard displaying:
 * - Identity data (from Clerk)
 * - Academic data (from Prisma StudentProfile)
 * - Enrollment statistics
 * - Account status
 *
 * This is a React Server Component (RSC) with no client-side data fetching.
 *
 * @module app/(dashboard)/student/profile/page
 */

import { redirect } from "next/navigation";
import { getStudentProfile } from "@/lib/profile-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Trophy,
  AlertCircle,
  School,
  User,
  Clock,
  IdCard,
  BookOpen,
  Users,
  AlertTriangle,
} from "lucide-react";

// ============================================
// Helper Components
// ============================================

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  iconBgClass: string;
  iconTextClass: string;
  placeholder?: string;
}

function InfoItem({
  icon,
  label,
  value,
  iconBgClass,
  iconTextClass,
  placeholder = "Belum diisi oleh admin",
}: InfoItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
      <div className={`p-2 rounded-lg ${iconBgClass}`}>
        <span className={iconTextClass}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
          {value || (
            <span className="text-slate-400 italic">{placeholder}</span>
          )}
        </p>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
  iconColor: string;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  gradientFrom,
  gradientTo,
  textColor,
  iconColor,
}: StatCardProps) {
  return (
    <Card
      className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white border-0`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`${textColor} text-sm`}>{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            <p className={`${textColor} text-sm mt-1`}>{subtitle}</p>
          </div>
          <span className={iconColor}>{icon}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Main Page Component
// ============================================

export default async function StudentProfilePage() {
  // Server-side data fetching
  const result = await getStudentProfile();

  // Handle authentication errors - redirect to sign-in
  if (!result.success && result.errorCode === "UNAUTHORIZED") {
    redirect("/sign-in");
  }

  // Handle authorization errors - redirect to appropriate page
  if (!result.success && result.errorCode === "FORBIDDEN") {
    redirect("/");
  }

  // Handle other errors
  if (!result.success || !result.data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Gagal Memuat Profil
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          {result.error || "Terjadi kesalahan yang tidak diketahui"}
        </p>
      </div>
    );
  }

  const profile = result.data;
  const hasStudentProfile = result.hasStudentProfile;

  // Format join date
  const formattedJoinDate = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(profile.joinedAt));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Profil Saya
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Informasi akun dan data akademik kamu
        </p>
      </div>

      {/* Missing StudentProfile Warning */}
      {!hasStudentProfile && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Data akademik belum lengkap
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Silakan hubungi admin sekolah untuk melengkapi data akademik
                  kamu.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Summary Card (Section 4.2) */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-24 w-24 border-4 border-slate-200 dark:border-slate-700">
                <AvatarImage
                  src={profile.avatarUrl || undefined}
                  alt={profile.fullName}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl">
                  {profile.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Badge className="mt-3 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Siswa
              </Badge>
            </div>

            {/* Info Section */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center md:text-left">
                {profile.fullName}
              </h2>
              {profile.nis && (
                <p className="text-slate-500 dark:text-slate-400 text-center md:text-left mt-1">
                  NIS: {profile.nis}
                </p>
              )}

              <Separator className="my-4" />

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <InfoItem
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={profile.email}
                  iconBgClass="bg-blue-100 dark:bg-blue-900/30"
                  iconTextClass="text-blue-600 dark:text-blue-400"
                  placeholder="-"
                />

                {/* Phone */}
                <InfoItem
                  icon={<Phone className="h-4 w-4" />}
                  label="Telepon"
                  value={profile.phoneNumber}
                  iconBgClass="bg-emerald-100 dark:bg-emerald-900/30"
                  iconTextClass="text-emerald-600 dark:text-emerald-400"
                  placeholder="-"
                />

                {/* Class */}
                <InfoItem
                  icon={<School className="h-4 w-4" />}
                  label="Kelas / Tingkat"
                  value={profile.className}
                  iconBgClass="bg-amber-100 dark:bg-amber-900/30"
                  iconTextClass="text-amber-600 dark:text-amber-400"
                />

                {/* Major */}
                <InfoItem
                  icon={<BookOpen className="h-4 w-4" />}
                  label="Jurusan"
                  value={profile.major}
                  iconBgClass="bg-purple-100 dark:bg-purple-900/30"
                  iconTextClass="text-purple-600 dark:text-purple-400"
                />

                {/* Academic Year - EXCLUSIVE from StudentProfile */}
                <InfoItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Tahun Akademik"
                  value={profile.academicYear}
                  iconBgClass="bg-rose-100 dark:bg-rose-900/30"
                  iconTextClass="text-rose-600 dark:text-rose-400"
                />

                {/* NIS/NISN */}
                <InfoItem
                  icon={<IdCard className="h-4 w-4" />}
                  label="NIS / NISN"
                  value={profile.nis}
                  iconBgClass="bg-cyan-100 dark:bg-cyan-900/30"
                  iconTextClass="text-cyan-600 dark:text-cyan-400"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Summary Section (Section 4.3) */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Ringkasan Ekstrakurikuler
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Enrollments */}
          <StatCard
            title="Total Ekstrakurikuler"
            value={profile.totalEnrollments}
            subtitle="diikuti"
            icon={<Users className="h-10 w-10" />}
            gradientFrom="from-slate-600"
            gradientTo="to-slate-700"
            textColor="text-slate-300"
            iconColor="text-slate-400"
          />

          {/* Active Enrollments */}
          <StatCard
            title="Ekstrakurikuler Aktif"
            value={profile.activeEnrollments}
            subtitle="sedang berjalan"
            icon={<Trophy className="h-10 w-10" />}
            gradientFrom="from-blue-500"
            gradientTo="to-indigo-600"
            textColor="text-blue-100"
            iconColor="text-blue-200"
          />

          {/* Pending Enrollments */}
          <StatCard
            title="Menunggu Persetujuan"
            value={profile.pendingEnrollments}
            subtitle="dalam antrian"
            icon={<Clock className="h-10 w-10" />}
            gradientFrom="from-amber-500"
            gradientTo="to-orange-600"
            textColor="text-amber-100"
            iconColor="text-amber-200"
          />
        </div>
      </div>

      {/* Account Status Section (Section 4.4) */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Status Akun
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Role */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Peran
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {profile.role}
                </p>
              </div>
            </div>

            {/* Account Status */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Status Akun
                </p>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {profile.accountStatus}
                  </p>
                </div>
              </div>
            </div>

            {/* Join Date */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tanggal Bergabung
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {formattedJoinDate}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
