"use client";

/**
 * PEMBINA-scoped providers including ThemeProvider
 *
 * ThemeProvider is intentionally scoped to PEMBINA layout only,
 * NOT the global root layout. This allows PEMBINA users to have
 * their own theme preference.
 *
 * @module app/(dashboard)/pembina/providers
 */

import { ThemeProvider } from "next-themes";

interface PembinaProvidersProps {
  children: React.ReactNode;
  defaultTheme?: string;
}

export function PembinaProviders({
  children,
  defaultTheme = "system",
}: PembinaProvidersProps) {
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
