/**
 * Legacy Route Redirect: /admin/ekskul → /admin/ekstrakurikuler
 *
 * Temporary redirect to prevent broken bookmarks during route alignment.
 * This page should be removed after Phase 1 verification is complete.
 *
 * @module app/(dashboard)/admin/ekskul/page
 */

import { redirect } from "next/navigation";

export default function LegacyEkskulRedirect() {
  redirect("/admin/ekstrakurikuler");
}
