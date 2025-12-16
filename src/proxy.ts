/**
 * SIXKUL Clerk Authentication Middleware
 *
 * Handles authentication and role-based access control using Clerk.
 *
 * Route Protection Rules:
 * - "/" → Unauthenticated: redirect to /sign-in | Authenticated: redirect to role dashboard
 * - "/sign-in" → Unauthenticated: allow | Authenticated: redirect to role dashboard
 * - "/admin/*" → Requires authentication + ADMIN role
 * - "/pembina/*" → Requires authentication + PEMBINA role
 * - "/student/*" → Requires authentication + SISWA role
 *
 * @module middleware
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ============================================
// Route Matchers
// ============================================

// Public routes - only sign-in and unauthorized pages
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/unauthorized"]);

// Define role-specific routes
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isPembinaRoute = createRouteMatcher(["/pembina(.*)"]);
const isStudentRoute = createRouteMatcher(["/student(.*)"]);

// ============================================
// Helper Functions
// ============================================

/**
 * Get dashboard path based on user role
 */
function getDashboardPath(role: string | undefined): string {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "PEMBINA":
      return "/pembina/dashboard";
    case "SISWA":
      return "/student/dashboard";
    default:
      return "/sign-in";
  }
}

// ============================================
// Clerk Middleware
// ============================================

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const pathname = req.nextUrl.pathname;

  // Debug logging
  console.log(`[MIDDLEWARE] Path: ${pathname}, UserId: ${userId || "none"}`);

  // Get user role from session claims (public_metadata.role)
  // Note: We use "public_metadata" key as configured in Clerk Dashboard
  const userRole = (sessionClaims?.public_metadata as { role?: string })?.role;

  // ----------------------------------------
  // CASE 1: Unauthenticated user visiting "/" → redirect to sign-in
  // ----------------------------------------
  if (!userId && pathname === "/") {
    console.log(
      '[MIDDLEWARE] CASE 1: Unauthenticated on "/" - redirecting to /sign-in',
    );
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // ----------------------------------------
  // CASE 2: Authenticated user visiting "/" or "/login" → redirect to their dashboard
  // ----------------------------------------
  if (
    userId &&
    (pathname === "/" ||
      pathname === "/login" ||
      pathname.startsWith("/sign-in"))
  ) {
    return NextResponse.redirect(new URL(getDashboardPath(userRole), req.url));
  }

  // ----------------------------------------
  // Allow public routes (sign-in, unauthorized)
  // ----------------------------------------
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // ----------------------------------------
  // CASE 3: Unauthenticated user trying to access protected routes → redirect to sign-in
  // ----------------------------------------
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // ----------------------------------------
  // CASE 4: Role-based access control - prevent cross-role access
  // ----------------------------------------
  if (isAdminRoute(req) && userRole !== "ADMIN") {
    console.log(
      `[MIDDLEWARE] Role mismatch - User role: ${userRole}, required: ADMIN`,
    );
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (isPembinaRoute(req) && userRole !== "PEMBINA") {
    console.log(
      `[MIDDLEWARE] Role mismatch - User role: ${userRole}, required: PEMBINA`,
    );
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (isStudentRoute(req) && userRole !== "SISWA") {
    console.log(
      `[MIDDLEWARE] Role mismatch - User role: ${userRole}, required: SISWA`,
    );
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // ----------------------------------------
  // Allow the request to proceed
  // ----------------------------------------
  return NextResponse.next();
});

// ============================================
// Middleware Config
// ============================================

export const config = {
  matcher: [
    // Explicitly match root
    "/",
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
