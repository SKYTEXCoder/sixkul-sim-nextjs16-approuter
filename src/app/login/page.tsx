"use client";

/**
 * SIXKUL Login Page
 * 
 * Handles user authentication with:
 * - Zod validation for form fields
 * - react-hook-form for form management
 * - API integration with /api/auth/login
 * - Loading states and error handling
 * - Role-based redirect after successful login
 * 
 * @module app/login/page
 */

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Icons
import { Loader2, LogIn, Eye, EyeOff, GraduationCap } from "lucide-react";

// ============================================
// Form Validation Schema
// ============================================

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email wajib diisi" })
    .email({ message: "Format email tidak valid" }),
  password: z
    .string()
    .min(1, { message: "Password wajib diisi" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// ============================================
// Type Definitions
// ============================================

interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
    role: "ADMIN" | "PEMBINA" | "SISWA";
  };
}

// ============================================
// Login Content Component (uses useSearchParams)
// ============================================

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Get callback URL and message from query params
  const callbackUrl = searchParams.get("callbackUrl");
  const redirectMessage = searchParams.get("message");

  // Initialize react-hook-form with zod resolver
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ----------------------------------------
  // Handle Form Submission
  // ----------------------------------------
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      // ----------------------------------------
      // Step 1: POST to /api/auth/login
      // ----------------------------------------
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result: LoginResponse = await response.json();

      // ----------------------------------------
      // Step 2: Handle API Response
      // ----------------------------------------
      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          toast.error("Email atau password salah", {
            description: "Periksa kembali kredensial Anda.",
          });
          return;
        }

        // Handle other errors
        toast.error("Login gagal", {
          description: result.message || "Terjadi kesalahan. Silakan coba lagi.",
        });
        return;
      }

      // ----------------------------------------
      // Step 3: Handle Success - Redirect based on role
      // ----------------------------------------
      if (result.success && result.user) {
        toast.success("Login berhasil!", {
          description: `Selamat datang, ${result.user.full_name}`,
        });

        // Determine redirect path based on role
        let redirectPath: string;

        if (callbackUrl) {
          // Redirect to original requested page
          redirectPath = callbackUrl;
        } else {
          // Redirect to role-specific dashboard
          switch (result.user.role) {
            case "ADMIN":
              redirectPath = "/admin/dashboard";
              break;
            case "PEMBINA":
              redirectPath = "/pembina/dashboard";
              break;
            case "SISWA":
              redirectPath = "/student/dashboard";
              break;
            default:
              redirectPath = "/dashboard";
          }
        }

        // Navigate to dashboard
        router.push(redirectPath);
        router.refresh(); // Refresh to update middleware state
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Terjadi kesalahan", {
        description: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Show redirect message if present */}
      {redirectMessage && (
        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm">
          {redirectMessage}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="nama@sixkul.sch.id"
                    type="email"
                    autoComplete="email"
                    disabled={isLoading}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      disabled={isLoading}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-primary pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full mt-6"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Masuk
              </>
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}

// ============================================
// Loading Fallback Component
// ============================================

function LoginFormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-16 bg-slate-700 rounded" />
        <div className="h-10 bg-slate-700 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-20 bg-slate-700 rounded" />
        <div className="h-10 bg-slate-700 rounded" />
      </div>
      <div className="h-11 bg-slate-700 rounded mt-6" />
    </div>
  );
}

// ============================================
// Login Page Component (Main Export)
// ============================================

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="relative w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            SIXKUL
          </h1>
          <p className="text-slate-400 mt-2">
            Sistem Informasi Ekstrakurikuler <br /> Untuk Suatu Sekolah Menengah Atas (SMA)
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-white text-center">
              Login
            </CardTitle>
            <CardDescription className="text-center text-slate-400">
              Masuk ke akun Anda untuk melanjutkan
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Wrap in Suspense for useSearchParams */}
            <Suspense fallback={<LoginFormSkeleton />}>
              <LoginContent />
            </Suspense>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 border-t border-slate-700 pt-6">
            {/* Demo Credentials */}
            <div className="w-full p-3 rounded-lg bg-slate-700/50 border border-slate-600">
              <p className="text-xs font-medium text-slate-300 mb-2">
                Demo Credentials:
              </p>
              <div className="space-y-1 text-xs text-slate-400">
                <p>
                  <span className="text-slate-300">Admin:</span>{" "}
                  admin@sixkul.sch.id
                </p>
                <p>
                  <span className="text-slate-300">Pembina:</span>{" "}
                  pembina@sixkul.sch.id
                </p>
                <p>
                  <span className="text-slate-300">Siswa:</span>{" "}
                  student@sixkul.sch.id
                </p>
                <p className="pt-1 border-t border-slate-600 mt-2">
                  <span className="text-slate-300">Password:</span> password123
                </p>
              </div>
            </div>

            {/* Footer Links */}
            <p className="text-center text-sm text-slate-400">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-white hover:underline font-medium"
              >
                Hubungi Admin
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-8">
          © 2025 SIXKUL - Sistem Informasi Ekstrakurikuler Untuk Suatu SMA
        </p>
      </div>
    </div>
  );
}

