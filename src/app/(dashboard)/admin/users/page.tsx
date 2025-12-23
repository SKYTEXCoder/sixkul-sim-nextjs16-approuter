/**
 * Admin Users List Page
 *
 * Displays all users with filtering, search, and management actions.
 * Uses client wrapper for interactivity.
 *
 * @module app/(dashboard)/admin/users/page
 */

import { getAllUsers, getUserStats } from "@/lib/admin-user-data";
import { getPembinaActivityMetrics } from "@/lib/admin/admin-data-aggregation";
import { UsersClientWrapper } from "@/components/admin/UsersClientWrapper";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [users, stats, pembinaMetrics] = await Promise.all([
    getAllUsers(),
    getUserStats(),
    getPembinaActivityMetrics(),
  ]);

  return (
    <UsersClientWrapper
      users={users}
      stats={stats}
      pembinaMetrics={pembinaMetrics}
    />
  );
}
