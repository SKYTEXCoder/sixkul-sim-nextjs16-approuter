/**
 * Pembina Dashboard Layout - Server Component
 *
 * Server-side layout for Pembina role that fetches
 * notification data and passes it to the client layout.
 *
 * @module app/(dashboard)/pembina/layout
 */

import {
  getPembinaNotifications,
  getPembinaUnreadCount,
} from "@/lib/pembina-notification-data";
import { PembinaLayoutClient } from "./PembinaLayoutClient";

// Force dynamic rendering since this uses Clerk auth
export const dynamic = "force-dynamic";

// ============================================
// Server Layout Component
// ============================================

export default async function PembinaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch notification data server-side
  const [unreadCount, notificationsResult] = await Promise.all([
    getPembinaUnreadCount(),
    getPembinaNotifications(),
  ]);

  // Extract notifications (empty array on error)
  const notifications = notificationsResult.success
    ? (notificationsResult.data?.notifications ?? [])
    : [];

  return (
    <PembinaLayoutClient
      unreadNotificationCount={unreadCount}
      notifications={notifications}
    >
      {children}
    </PembinaLayoutClient>
  );
}
