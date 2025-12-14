/**
 * Enrollment Header Component
 * 
 * Page header with title, subtitle, and back navigation.
 * Server Component - no client-side interactivity needed.
 * 
 * @module components/enrollment-detail/EnrollmentHeader
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity } from "lucide-react";

export function EnrollmentHeader() {
  return (
    <div className="space-y-4">
      {/* Back Navigation */}
      <Link href="/student/enrollments">
        <Button variant="ghost" className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Ekstrakurikuler Saya
        </Button>
      </Link>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          Aktivitas Ekstrakurikuler
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Detail keikutsertaan dan aktivitas kamu
        </p>
      </div>
    </div>
  );
}
