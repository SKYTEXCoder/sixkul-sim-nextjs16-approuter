/**
 * Browse Extracurriculars Page (Server Component)
 * 
 * Lists all active extracurriculars for students to browse and join.
 * Uses direct Prisma queries as a Server Component.
 * 
 * @module app/(dashboard)/student/ekskul/page
 */

import prisma from "@/lib/prisma";
import { EkskulGrid } from "@/components/ekskul/EkskulGrid";
import type { ExtracurricularCardData } from "@/types/ekskul";

// ============================================
// Data Fetching
// ============================================

async function getActiveExtracurriculars(): Promise<ExtracurricularCardData[]> {
  const extracurriculars = await prisma.extracurricular.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      pembina: {
        include: {
          user: {
            select: {
              full_name: true,
            },
          },
        },
      },
      enrollments: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return extracurriculars;
}

// ============================================
// Page Component
// ============================================

export default async function BrowseEkskulPage() {
  const extracurriculars = await getActiveExtracurriculars();

  return <EkskulGrid extracurriculars={extracurriculars} />;
}
