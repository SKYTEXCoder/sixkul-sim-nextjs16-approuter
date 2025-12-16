/**
 * PEMBINA Ekstrakurikuler Management Hub Page
 *
 * Central management hub for a single extracurricular.
 * Displays metadata, summary cards, and internal navigation.
 *
 * @module app/(dashboard)/pembina/ekstrakurikuler/[id]/page
 */

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Calendar,
  Clock,
  Megaphone,
  UserCheck,
  ClipboardCheck,
} from "lucide-react";

import { getExtracurricularById } from "@/lib/pembina-ekstrakurikuler-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ============================================
// Page Component
// ============================================

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExtracurricularHubPage({ params }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const ekskul = await getExtracurricularById(id, userId);

  // Ownership validation
  if (!ekskul) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Description */}
      {ekskul.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-slate-600 dark:text-slate-400">
              {ekskul.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Anggota Aktif"
          value={ekskul.memberCount}
          icon={Users}
          color="text-emerald-600"
          bgColor="bg-emerald-100 dark:bg-emerald-900/20"
        />
        <SummaryCard
          title="Permintaan Bergabung"
          value={ekskul.pendingCount}
          icon={UserCheck}
          color="text-amber-600"
          bgColor="bg-amber-100 dark:bg-amber-900/20"
          highlight={ekskul.pendingCount > 0}
        />
        <SummaryCard
          title="Jadwal Rutin"
          value={ekskul.scheduleCount}
          icon={Calendar}
          color="text-blue-600"
          bgColor="bg-blue-100 dark:bg-blue-900/20"
        />
        <SummaryCard
          title="Total Pertemuan"
          value={ekskul.sessionCount}
          icon={Clock}
          color="text-purple-600"
          bgColor="bg-purple-100 dark:bg-purple-900/20"
        />
      </div>

      {/* Quick Actions / Internal Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Kelola Ekstrakurikuler</CardTitle>
          <CardDescription>
            Pilih menu di bawah untuk mengelola berbagai aspek ekstrakurikuler.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <NavigationCard
              href={`/pembina/ekstrakurikuler/${ekskul.id}/schedules`}
              icon={Calendar}
              title="Jadwal Rutin"
              description="Kelola template jadwal mingguan"
              count={ekskul.scheduleCount}
            />
            <NavigationCard
              href={`/pembina/ekstrakurikuler/${ekskul.id}/sessions`}
              icon={Clock}
              title="Pertemuan"
              description="Lihat dan generate pertemuan"
              count={ekskul.sessionCount}
            />
            <NavigationCard
              href={`/pembina/ekstrakurikuler/${ekskul.id}/attendance`}
              icon={ClipboardCheck}
              title="Absensi"
              description="Input kehadiran per pertemuan"
            />
            <NavigationCard
              href={`/pembina/ekstrakurikuler/${ekskul.id}/announcements`}
              icon={Megaphone}
              title="Pengumuman"
              description="Buat dan kelola pengumuman"
            />
            <NavigationCard
              href={`/pembina/ekstrakurikuler/${ekskul.id}/enrollments`}
              icon={UserCheck}
              title="Permintaan Bergabung"
              description="Setujui atau tolak permintaan"
              count={ekskul.pendingCount}
              highlight={ekskul.pendingCount > 0}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Subcomponents
// ============================================

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  highlight?: boolean;
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  highlight,
}: SummaryCardProps) {
  return (
    <Card className={highlight ? "border-amber-300 dark:border-amber-700" : ""}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${bgColor}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {value}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {title}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface NavigationCardProps {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  count?: number;
  highlight?: boolean;
}

function NavigationCard({
  href,
  icon: Icon,
  title,
  description,
  count,
  highlight,
}: NavigationCardProps) {
  return (
    <Link href={href}>
      <Card
        className={`h-full hover:shadow-md transition-shadow cursor-pointer group ${
          highlight ? "border-amber-300 dark:border-amber-700" : ""
        }`}
      >
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/10 transition-colors">
              <Icon className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                  {title}
                </h3>
                {count !== undefined && count > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      highlight
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
