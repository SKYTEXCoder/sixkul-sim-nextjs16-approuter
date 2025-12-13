/**
 * Student Profile Page
 * 
 * Displays the current student's profile information.
 * 
 * @module app/(dashboard)/student/profile/page
 */

"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  UserCircle,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Trophy,
  AlertCircle,
  Edit,
  School,
} from "lucide-react";

// ============================================
// Types
// ============================================

interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  studentId: string | null;
  grade: string | null;
  class: string | null;
  joinedAt: string;
  formattedJoinDate: string;
  activeEnrollmentsCount: number;
  totalEnrollmentsCount: number;
}

// ============================================
// Loading Skeleton Component
// ============================================

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Profile Card Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Card Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-full" />
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

export default function StudentProfilePage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data
  useEffect(() => {
    async function fetchProfileData() {
      if (!clerkLoaded || !clerkUser) return;
      
      try {
        setIsLoading(true);
        setError(null);

        // TODO: Replace with actual API endpoint
        // const response = await fetch("/api/student/profile");
        // const result = await response.json();
        
        // Mock data for initial development using Clerk user data
        await new Promise(resolve => setTimeout(resolve, 300));
        const mockData: ProfileData = {
          id: clerkUser.id,
          fullName: clerkUser.fullName || clerkUser.username || "Siswa",
          email: clerkUser.primaryEmailAddress?.emailAddress || "",
          phone: clerkUser.primaryPhoneNumber?.phoneNumber || null,
          studentId: "2024001",
          grade: "XI",
          class: "XI IPA 1",
          joinedAt: clerkUser.createdAt?.toISOString() || new Date().toISOString(),
          formattedJoinDate: clerkUser.createdAt 
            ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(clerkUser.createdAt))
            : "-",
          activeEnrollmentsCount: 2,
          totalEnrollmentsCount: 3,
        };
        
        setProfileData(mockData);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfileData();
  }, [clerkUser, clerkLoaded]);

  // Show loading skeleton
  if (isLoading || !clerkLoaded) {
    return <ProfileSkeleton />;
  }

  // Show error state
  if (error || !profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Gagal Memuat Profil
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
            Profil Saya
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Informasi akun dan data diri kamu.
          </p>
        </div>
        <Button variant="outline" disabled>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profil
        </Button>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-24 w-24 border-4 border-slate-200 dark:border-slate-700">
                <AvatarImage src={clerkUser?.imageUrl} alt={profileData.fullName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl">
                  {profileData.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Badge className="mt-3 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Siswa
              </Badge>
            </div>

            {/* Info Section */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white text-center md:text-left">
                {profileData.fullName}
              </h2>
              {profileData.studentId && (
                <p className="text-slate-500 dark:text-slate-400 text-center md:text-left mt-1">
                  NIS: {profileData.studentId}
                </p>
              )}
              
              <Separator className="my-4" />
              
              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {profileData.email}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Telepon</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {profileData.phone || "-"}
                    </p>
                  </div>
                </div>

                {/* Class */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <School className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Kelas</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {profileData.class || "-"}
                    </p>
                  </div>
                </div>

                {/* Member Since */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Bergabung Sejak</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {profileData.formattedJoinDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Ekskul */}
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Ekskul Aktif</p>
                <p className="text-3xl font-bold mt-1">{profileData.activeEnrollmentsCount}</p>
                <p className="text-blue-100 text-sm mt-1">sedang diikuti</p>
              </div>
              <Trophy className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        {/* Total Ekskul */}
        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Total Ekskul</p>
                <p className="text-3xl font-bold mt-1">{profileData.totalEnrollmentsCount}</p>
                <p className="text-emerald-100 text-sm mt-1">pernah diikuti</p>
              </div>
              <GraduationCap className="h-12 w-12 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
