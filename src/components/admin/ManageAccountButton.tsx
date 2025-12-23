"use client";

import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { User, Shield } from "lucide-react";

interface ManageAccountButtonProps {
  mode?: "profile" | "security";
  variant?: "default" | "outline" | "ghost" | "link";
  className?: string;
  children?: React.ReactNode;
}

export function ManageAccountButton({
  mode = "profile",
  variant = "outline",
  className,
  children,
}: ManageAccountButtonProps) {
  const { openUserProfile } = useClerk();

  const handleClick = () => {
    // openUserProfile() opens the modal.
    // We can pass different props or just open it.
    openUserProfile();
  };

  return (
    <Button variant={variant} className={className} onClick={handleClick}>
      {children || (
        <>
          {mode === "profile" ? (
            <User className="mr-2 h-4 w-4" />
          ) : (
            <Shield className="mr-2 h-4 w-4" />
          )}
          {mode === "profile"
            ? "Kelola Akun (Keamanan & Profil)"
            : "Buka Pengaturan Keamanan"}
        </>
      )}
    </Button>
  );
}
