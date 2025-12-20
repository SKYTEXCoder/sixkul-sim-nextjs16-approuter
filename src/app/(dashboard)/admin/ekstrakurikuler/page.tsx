/**
 * Admin Ekstrakurikuler List Page
 *
 * Displays all ekstrakurikuler with filtering and management actions.
 * Uses client wrapper for interactivity.
 *
 * @module app/(dashboard)/admin/ekstrakurikuler/page
 */

import {
  getAllEkstrakurikuler,
  getEkstrakurikulerStats,
} from "@/lib/admin-ekstrakurikuler-data";
import { getAvailablePembina } from "@/lib/admin-user-data";
import { EkskulClientWrapper } from "@/components/admin/EkskulClientWrapper";

export default async function AdminEkstrakurikulerPage() {
  const [ekstrakurikuler, stats, pembinas] = await Promise.all([
    getAllEkstrakurikuler(),
    getEkstrakurikulerStats(),
    getAvailablePembina(),
  ]);

  return (
    <EkskulClientWrapper
      ekstrakurikuler={ekstrakurikuler}
      stats={stats}
      pembinas={pembinas}
    />
  );
}
