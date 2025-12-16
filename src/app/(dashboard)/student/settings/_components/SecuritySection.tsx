"use client";

/**
 * Security Section - Password management with Clerk
 *
 * Provides a dialog for users to change their password using
 * Clerk's user.updatePassword() API with reverification support.
 *
 * @module app/(dashboard)/student/settings/_components/SecuritySection
 */

import { useState, useCallback } from "react";
import { useUser, useReverification } from "@clerk/nextjs";
import {
  Shield,
  Key,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// ============================================
// Types
// ============================================

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// ============================================
// Component
// ============================================

export function SecuritySection() {
  const { user, isLoaded } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Create the password update function to be wrapped with reverification
  const updatePasswordAction = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!user) {
        throw new Error("User not available");
      }
      return await user.updatePassword({
        currentPassword,
        newPassword,
      });
    },
    [user],
  );

  // Wrap with reverification - this will show Clerk's reverification modal when needed
  const updatePasswordWithReverification =
    useReverification(updatePasswordAction);

  // Reset form when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      setSubmitError(null);
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Kata sandi saat ini wajib diisi";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Kata sandi baru wajib diisi";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Kata sandi baru minimal 8 karakter";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi kata sandi wajib diisi";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Kata sandi baru tidak cocok";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    if (!user) {
      setSubmitError("Tidak dapat mengakses akun pengguna.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the reverification-wrapped function
      const result = await updatePasswordWithReverification(
        formData.currentPassword,
        formData.newPassword,
      );

      // If user cancelled reverification, result will be null
      if (!result) {
        setIsSubmitting(false);
        return;
      }

      toast.success("Kata sandi berhasil diubah!", {
        description: "Kata sandi akun kamu telah diperbarui.",
      });

      handleDialogOpenChange(false);
    } catch (error: unknown) {
      console.error("Password update error:", error);

      // Handle Clerk-specific errors
      const clerkError = error as {
        errors?: Array<{ code?: string; message?: string }>;
      };
      if (clerkError.errors && clerkError.errors.length > 0) {
        const firstError = clerkError.errors[0];
        if (firstError.code === "form_password_incorrect") {
          setSubmitError("Kata sandi saat ini salah.");
        } else if (firstError.code === "form_password_pwned") {
          setSubmitError(
            "Kata sandi baru terlalu umum. Gunakan kata sandi yang lebih kuat.",
          );
        } else if (firstError.code === "form_password_length_too_short") {
          setSubmitError("Kata sandi baru terlalu pendek. Minimal 8 karakter.");
        } else {
          setSubmitError(firstError.message || "Gagal mengubah kata sandi.");
        }
      } else if (error instanceof Error) {
        setSubmitError(
          error.message || "Terjadi kesalahan. Silakan coba lagi.",
        );
      } else {
        setSubmitError("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input change
  const handleInputChange =
    (field: keyof PasswordForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  if (!isLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-violet-500" />
            Keamanan Akun
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-violet-500" />
          Keamanan Akun
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Key className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">
                Kata Sandi
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Kelola keamanan kata sandi akun kamu
              </p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button variant="outline" className="cursor-pointer">
                Ubah Kata Sandi
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-500" />
                  Ubah Kata Sandi
                </DialogTitle>
                <DialogDescription>
                  Masukkan kata sandi saat ini dan kata sandi baru untuk
                  mengubah kata sandi akun kamu.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Submit Error */}
                {submitError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {submitError}
                  </div>
                )}

                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Kata Sandi Saat Ini</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={handleInputChange("currentPassword")}
                      placeholder="Masukkan kata sandi saat ini"
                      className={errors.currentPassword ? "border-red-500" : ""}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-sm text-red-500">
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Kata Sandi Baru</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={handleInputChange("newPassword")}
                      placeholder="Masukkan kata sandi baru (min. 8 karakter)"
                      className={errors.newPassword ? "border-red-500" : ""}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-sm text-red-500">{errors.newPassword}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Konfirmasi Kata Sandi Baru
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange("confirmPassword")}
                      placeholder="Masukkan ulang kata sandi baru"
                      className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Simpan Perubahan
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500">
          Kata sandi harus minimal 8 karakter. Untuk keamanan, Anda mungkin
          diminta untuk memverifikasi identitas terlebih dahulu.
        </p>
      </CardContent>
    </Card>
  );
}
