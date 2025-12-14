/**
 * Student History Page (Placeholder)
 * 
 * Placeholder page for the "Riwayat & Nilai" feature.
 * This feature is planned for future implementation.
 * 
 * @module app/(dashboard)/student/history/page
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { History, ArrowLeft, Construction } from "lucide-react";

export default function StudentHistoryPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Riwayat & Nilai
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Riwayat keikutsertaan dan penilaian ekstrakurikuler.
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
            <Construction className="w-10 h-10 text-amber-500" />
          </div>
          
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Fitur Dalam Pengembangan
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
            Halaman Riwayat & Nilai sedang dalam tahap pengembangan. 
            Fitur ini akan menampilkan riwayat keikutsertaan ekstrakurikuler 
            dan penilaian yang kamu terima dari pembina.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" asChild>
              <Link href="/student/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Dashboard
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/student/enrollments">
                <History className="w-4 h-4 mr-2" />
                Lihat Ekskul Saya
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info section */}
      <div className="text-center text-sm text-slate-400 dark:text-slate-500">
        <p>
          Fitur yang akan tersedia: Daftar ekstrakurikuler yang pernah diikuti, 
          penilaian dari pembina, dan sertifikat keikutsertaan.
        </p>
      </div>
    </div>
  );
}
