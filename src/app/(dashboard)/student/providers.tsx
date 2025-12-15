"use client";

/**
 * Student-scoped providers including ThemeProvider
 *
 * ThemeProvider is intentionally scoped to student layout only,
 * NOT the global root layout.
 *
 * @module app/(dashboard)/student/providers
 */

import { ThemeProvider } from "next-themes";

interface StudentProvidersProps {
  children: React.ReactNode;
  defaultTheme?: string;
}

export function StudentProviders({
  children,
  defaultTheme = "system",
}: StudentProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
