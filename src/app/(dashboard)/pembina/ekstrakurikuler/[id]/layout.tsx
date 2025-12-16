/**
 * PEMBINA Ekstrakurikuler Management Hub Layout
 *
 * Shared layout for extracurricular sub-pages with context header and back navigation.
 * Validates ownership before rendering children.
 *
 * @module app/(dashboard)/pembina/ekstrakurikuler/[id]/layout
 */

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getExtracurricularById } from "@/lib/pembina-ekstrakurikuler-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ============================================
// Layout Component
// ============================================

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ExtracurricularHubLayout({
  children,
  params,
}: LayoutProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const ekskul = await getExtracurricularById(id, userId);

  // Ownership validation - redirect if not owned
  if (!ekskul) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Context Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          {/* Back Navigation */}
          <Link href="/pembina/ekstrakurikuler">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali ke Daftar
            </Button>
          </Link>

          {/* Extracurricular Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {ekskul.name}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {ekskul.category}
          </p>
        </div>

        <Badge variant={ekskul.status === "ACTIVE" ? "default" : "secondary"}>
          {ekskul.status === "ACTIVE" ? "Aktif" : "Nonaktif"}
        </Badge>
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
}
