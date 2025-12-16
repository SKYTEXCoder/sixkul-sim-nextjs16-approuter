/**
 * Student Dashboard Layout - Server Component
 *
 * Server-side layout for Student (SISWA) role that fetches
 * unread notification count and passes it to the client layout.
 *
 * @module app/(dashboard)/student/layout
 */

import { getUnreadNotificationCount } from "@/lib/notification-data";
import { StudentLayoutClient } from "./StudentLayoutClient";

// Force dynamic rendering since this uses Clerk auth
export const dynamic = "force-dynamic";

// ============================================
// Server Layout Component
// ============================================

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch unread notification count server-side
  const unreadNotificationCount = await getUnreadNotificationCount();

  return (
    <StudentLayoutClient unreadNotificationCount={unreadNotificationCount}>
      {children}
    </StudentLayoutClient>
  );
}
