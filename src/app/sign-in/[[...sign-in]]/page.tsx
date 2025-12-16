/**
 * SIXKUL Custom Sign-In Page
 *
 * Custom sign-in page using Clerk's SignIn component with SIXKUL branding.
 * Sign-up is disabled - only admins can create accounts.
 *
 * @module app/sign-in/[[...sign-in]]/page
 */

import { SignIn } from "@clerk/nextjs";
import { GraduationCap } from "lucide-react";

export default function SignInPage() {
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
            Sistem Informasi Ekstrakurikuler
          </p>
        </div>

        {/* Clerk SignIn Component */}
        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-2xl",
                headerTitle: "text-white",
                headerSubtitle: "text-slate-400",
                socialButtonsBlockButton:
                  "bg-slate-700 border-slate-600 text-white hover:bg-slate-600",
                formFieldLabel: "text-slate-200",
                formFieldInput:
                  "bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400",
                formButtonPrimary: "bg-primary hover:bg-primary/90",
                footerActionLink: "text-primary hover:text-primary/90",
                identifierPreviewText: "text-white",
                formFieldInputShowPasswordButton:
                  "text-slate-400 hover:text-slate-200",
              },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="" // Disable sign-up link
          />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-8">
          © 2025 SIXKUL - Sistem Informasi Ekstrakurikuler
        </p>
        <p className="text-center text-xs text-slate-600 mt-2">
          Belum punya akun? Hubungi Administrator
        </p>
      </div>
    </div>
  );
}
