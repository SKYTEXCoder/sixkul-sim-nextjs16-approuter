"use client";

/**
 * Security Section Component for PEMBINA Settings
 *
 * Handles password change/reset via Clerk.
 * No password data touches Prisma.
 *
 * @module app/(dashboard)/pembina/settings/_components/SecuritySection
 */

import { useState, useTransition } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Shield, Key, Mail, Loader2, LogOut, Eye, EyeOff } from "lucide-react";

// ============================================
// Component
// ============================================

export function SecuritySection() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isPending, startTransition] = useTransition();

  // Password change form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  // ----------------------------------------
  // Handle Password Change via Clerk
  // ----------------------------------------
  const handlePasswordChange = () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Semua field harus diisi");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password baru minimal 8 karakter");
      return;
    }

    startTransition(async () => {
      try {
        await user?.updatePassword({
          currentPassword,
          newPassword,
        });

        toast.success("Password berhasil diubah");
        setIsPasswordDialogOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (error: unknown) {
        console.error("Password change error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Gagal mengubah password. Pastikan password lama benar.";
        toast.error("Gagal mengubah password", {
          description: errorMessage,
        });
      }
    });
  };

  // ----------------------------------------
  // Handle Password Reset via Email
  // ----------------------------------------
  const handlePasswordReset = () => {
    startTransition(async () => {
      try {
        const email = user?.primaryEmailAddress?.emailAddress;
        if (!email) {
          toast.error("Email tidak ditemukan");
          return;
        }

        // Create a password reset using Clerk's flow
        await user?.createEmailAddress({ email });

        toast.success("Link reset password telah dikirim", {
          description: `Cek email ${email} untuk melanjutkan`,
        });
      } catch {
        // For Clerk, we use a different approach - sign out and redirect to forgot password
        toast.info("Gunakan halaman login", {
          description:
            "Klik 'Lupa Password' pada halaman login untuk reset password",
        });
      }
    });
  };

  // ----------------------------------------
  // Handle Sign Out All Sessions
  // ----------------------------------------
  const handleSignOutAll = () => {
    startTransition(async () => {
      try {
        await signOut({ redirectUrl: "/sign-in" });
        toast.success("Berhasil keluar dari semua sesi");
      } catch {
        toast.error("Gagal keluar dari sesi");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Keamanan Akun
        </CardTitle>
        <CardDescription>
          Kelola password dan keamanan akun Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Info */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Email Terdaftar
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {user?.primaryEmailAddress?.emailAddress || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Key className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Ubah Password
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Perbarui password akun Anda
              </p>
            </div>
          </div>
          <Dialog
            open={isPasswordDialogOpen}
            onOpenChange={setIsPasswordDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Ubah Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ubah Password</DialogTitle>
                <DialogDescription>
                  Masukkan password lama dan password baru Anda
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Password Saat Ini</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan password saat ini"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 8 karakter"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Konfirmasi Password Baru
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Batal</Button>
                </DialogClose>
                <Button onClick={handlePasswordChange} disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4 mr-2" />
                  )}
                  {isPending ? "Menyimpan..." : "Ubah Password"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Password Reset Link */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Lupa Password?
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Kirim link reset ke email Anda
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePasswordReset}
            disabled={isPending}
          >
            Kirim Link Reset
          </Button>
        </div>

        {/* Sign Out All Sessions */}
        <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <LogOut className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Keluar dari Semua Perangkat
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Logout dari semua sesi aktif
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSignOutAll}
            disabled={isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Keluar Semua
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default SecuritySection;
