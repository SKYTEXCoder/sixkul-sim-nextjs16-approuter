"use client";

/**
 * PEMBINA Profile Client Wrapper
 *
 * Client component that handles profile editing state and form submission.
 *
 * @module app/(dashboard)/pembina/profile/_components/ProfileClientWrapper
 */

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Award,
  BookOpen,
  Calendar,
  Shield,
  Pencil,
  X,
  Save,
  Loader2,
  IdCard,
} from "lucide-react";
import {
  PembinaProfileViewModel,
  updatePembinaProfile,
} from "@/lib/pembina-profile-data";

// ============================================
// Types
// ============================================

interface ProfileClientWrapperProps {
  profile: PembinaProfileViewModel;
  hasPembinaProfile: boolean;
}

// ============================================
// Component
// ============================================

export function ProfileClientWrapper({
  profile,
  hasPembinaProfile,
}: ProfileClientWrapperProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [expertise, setExpertise] = useState(profile.expertise || "");
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber || "");

  // ----------------------------------------
  // Handle Save
  // ----------------------------------------
  const handleSave = () => {
    startTransition(async () => {
      const result = await updatePembinaProfile({
        expertise: expertise.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
      });

      if (result.success) {
        toast.success("Profil berhasil diperbarui");
        setIsEditing(false);
      } else {
        toast.error("Gagal memperbarui profil", {
          description: result.error,
        });
      }
    });
  };

  // ----------------------------------------
  // Handle Cancel
  // ----------------------------------------
  const handleCancel = () => {
    setExpertise(profile.expertise || "");
    setPhoneNumber(profile.phoneNumber || "");
    setIsEditing(false);
  };

  // ----------------------------------------
  // Format date
  // ----------------------------------------
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Profil Saya
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Kelola informasi profil dan data profesional Anda
          </p>
        </div>
        {hasPembinaProfile && !isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Pencil className="h-4 w-4 mr-2" />
            Edit Profil
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-slate-200 dark:border-slate-700">
              <AvatarImage
                src={profile.avatarUrl || undefined}
                alt={profile.fullName}
              />
              <AvatarFallback className="bg-primary text-white text-2xl">
                {profile.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{profile.fullName}</CardTitle>
              <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                <Shield className="h-4 w-4" />
                {profile.role}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Identity Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Informasi Identitas
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Email - Read Only */}
              <div className="space-y-2">
                <Label className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  Email
                </Label>
                <p className="text-slate-900 dark:text-white">
                  {profile.email}
                </p>
              </div>

              {/* NIP - Read Only */}
              <div className="space-y-2">
                <Label className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <IdCard className="h-3 w-3" />
                  NIP
                </Label>
                <p className="text-slate-900 dark:text-white font-mono">
                  {profile.nip || "-"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Professional Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Informasi Profesional
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Expertise */}
              <div className="space-y-2">
                <Label
                  htmlFor="expertise"
                  className="text-slate-500 dark:text-slate-400"
                >
                  Bidang Keahlian
                </Label>
                {isEditing ? (
                  <Textarea
                    id="expertise"
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    placeholder="Contoh: Seni Tari, Musik, Olahraga"
                    className="resize-none"
                    rows={2}
                    maxLength={200}
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white">
                    {profile.expertise || "-"}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label
                  htmlFor="phoneNumber"
                  className="text-slate-500 dark:text-slate-400 flex items-center gap-2"
                >
                  <Phone className="h-3 w-3" />
                  Nomor Telepon
                </Label>
                {isEditing ? (
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="08123456789"
                  />
                ) : (
                  <p className="text-slate-900 dark:text-white">
                    {profile.phoneNumber || "-"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Statistics Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Statistik Ekstrakurikuler
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {profile.extracurricularCount}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total Ekstrakurikuler
                </p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {profile.activeExtracurricularCount}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Ekstrakurikuler Aktif
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Informasi Akun
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Bergabung sejak{" "}
              <span className="text-slate-900 dark:text-white">
                {formatDate(profile.joinedAt)}
              </span>
            </p>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <>
              <Separator />
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Batal
                </Button>
                <Button onClick={handleSave} disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Warning for missing profile */}
      {!hasPembinaProfile && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="pt-6">
            <p className="text-amber-800 dark:text-amber-200">
              Profil pembina Anda belum lengkap. Silakan hubungi administrator
              untuk melengkapi data NIP dan informasi lainnya.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ProfileClientWrapper;
