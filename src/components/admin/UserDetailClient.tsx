"use client";

/**
 * UserDetailClient Component
 *
 * Client-side wrapper for user detail page interactive elements.
 * Contains Edit and Status toggle functionality.
 *
 * @module components/admin/UserDetailClient
 */

import { EditUserDialog } from "./EditUserDialog";
import { UserStatusButton } from "./UserStatusButton";

type UserRole = "ADMIN" | "PEMBINA" | "SISWA";

interface UserDetailClientProps {
  userId: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
}

export function UserDetailClient({
  userId,
  fullName,
  role,
  isActive,
}: UserDetailClientProps) {
  return (
    <div className="flex gap-2">
      <EditUserDialog
        userId={userId}
        currentName={fullName}
        currentRole={role}
      />
      <UserStatusButton
        userId={userId}
        isActive={isActive}
        userName={fullName}
      />
    </div>
  );
}
