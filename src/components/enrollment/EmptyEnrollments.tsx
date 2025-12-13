/**
 * Empty Enrollments Component
 * 
 * Displayed when student has no enrollments.
 * Provides a CTA to browse extracurriculars.
 * 
 * @module components/enrollment/EmptyEnrollments
 */

import Link from "next/link";
import { BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyEnrollments() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon Illustration */}
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-blue-500 dark:text-blue-400" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center border-4 border-white dark:border-slate-900">
          <Search className="w-5 h-5 text-amber-500 dark:text-amber-400" />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 text-center">
        Kamu belum mengikuti ekstrakurikuler apa pun
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
        Jelajahi berbagai ekstrakurikuler yang tersedia dan temukan yang sesuai dengan minat dan bakatmu!
      </p>

      {/* CTA Button */}
      <Button asChild size="lg" className="gap-2">
        <Link href="/student/ekstrakurikuler">
          <Search className="w-4 h-4" />
          Jelajahi Ekstrakurikuler
        </Link>
      </Button>
    </div>
  );
}

export default EmptyEnrollments;
