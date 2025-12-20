/**
 * Admin User Detail Page
 *
 * View and edit user details.
 *
 * @module app/(dashboard)/admin/users/[id]/page
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Mail, Shield, Calendar, Edit } from "lucide-react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      studentProfile: true,
      pembinaProfile: true,
    },
  });

  if (!user) {
    notFound();
  }

  const isActive = !user.clerk_id.startsWith("DEACTIVATED_");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Detail User
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Informasi lengkap pengguna
          </p>
        </div>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            Informasi Pengguna
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                {user.full_name}
              </h3>
              <p className="text-slate-500">@{user.username}</p>
            </div>
            <div className="ml-auto flex gap-2">
              <Badge
                variant={
                  user.role === "ADMIN"
                    ? "destructive"
                    : user.role === "PEMBINA"
                      ? "default"
                      : "secondary"
                }
              >
                {user.role}
              </Badge>
              <Badge
                variant={isActive ? "default" : "secondary"}
                className={
                  isActive
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : ""
                }
              >
                {isActive ? "Aktif" : "Nonaktif"}
              </Badge>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {user.email || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Role</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {user.role}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">Terdaftar</p>
                <p className="font-medium text-slate-900 dark:text-white">
                  {user.created_at.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {user.studentProfile && (
              <>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">NIS</p>
                    <p className="font-medium text-slate-900 dark:text-white font-mono">
                      {user.studentProfile.nis}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Kelas</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {user.studentProfile.class_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">Jurusan</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {user.studentProfile.major}
                    </p>
                  </div>
                </div>
              </>
            )}

            {user.pembinaProfile && (
              <>
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-500">NIP</p>
                    <p className="font-medium text-slate-900 dark:text-white font-mono">
                      {user.pembinaProfile.nip}
                    </p>
                  </div>
                </div>
                {user.pembinaProfile.expertise && (
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Keahlian</p>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {user.pembinaProfile.expertise}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" className="text-red-600 hover:text-red-700">
          {isActive ? "Nonaktifkan User" : "Aktifkan User"}
        </Button>
      </div>
    </div>
  );
}
