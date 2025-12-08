/**
 * SIXKUL Role-Based Access Control (RBAC) Middleware
 * 
 * This middleware protects routes based on user roles:
 * - /admin/* requires ADMIN role
 * - /pembina/* requires PEMBINA role
 * - /student/* requires SISWA role
 * 
 * Uses jose library for Edge-compatible JWT verification.
 * 
 * @module middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// ============================================
// Configuration
// ============================================

/**
 * Cookie name for authentication token
 * Must match the name used in login route
 */
const AUTH_COOKIE_NAME = 'sixkul_auth_token';

/**
 * Route definitions for RBAC
 * Maps route prefixes to required roles
 */
const PROTECTED_ROUTES: Record<string, string[]> = {
  '/admin': ['ADMIN'],
  '/pembina': ['PEMBINA'],
  '/student': ['SISWA'],
  '/dashboard': ['ADMIN', 'PEMBINA', 'SISWA'], // Any authenticated user
};

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/unauthorized',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
];

/**
 * Static file and API route patterns to skip
 */
const SKIP_PATTERNS = [
  '/_next',
  '/favicon.ico',
  '/images',
  '/fonts',
  '/static',
  '.css',
  '.js',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
];

// ============================================
// Type Definitions
// ============================================

interface TokenPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'PEMBINA' | 'SISWA';
  iat: number;
  exp: number;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get JWT secret as TextEncoder for jose
 */
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Check if a path should be skipped (static files, etc.)
 */
function shouldSkipPath(pathname: string): boolean {
  return SKIP_PATTERNS.some(
    (pattern) => pathname.startsWith(pattern) || pathname.includes(pattern)
  );
}

/**
 * Check if a path is a public route
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route;
  });
}

/**
 * Get the required roles for a given pathname
 * Returns null if no protection is needed
 */
function getRequiredRoles(pathname: string): string[] | null {
  for (const [routePrefix, roles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(routePrefix)) {
      return roles;
    }
  }
  return null;
}

/**
 * Verify and decode JWT token using jose (Edge-compatible)
 */
async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });
    
    return payload as unknown as TokenPayload;
  } catch (error) {
    console.error('[MIDDLEWARE] Token verification failed:', error);
    return null;
  }
}

/**
 * Check if user has any of the required roles
 */
function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Get the appropriate dashboard path based on user role
 */
function getDashboardPath(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'PEMBINA':
      return '/pembina/dashboard';
    case 'SISWA':
      return '/student/dashboard';
    default:
      return '/dashboard';
  }
}

/**
 * Create redirect response with optional message
 */
function createRedirect(
  request: NextRequest,
  destination: string,
  message?: string
): NextResponse {
  const url = new URL(destination, request.url);
  
  if (message) {
    url.searchParams.set('message', message);
  }
  
  // Preserve the original destination for post-login redirect
  if (destination === '/login') {
    const callbackUrl = request.nextUrl.pathname + request.nextUrl.search;
    if (callbackUrl !== '/' && callbackUrl !== '/login') {
      url.searchParams.set('callbackUrl', callbackUrl);
    }
  }
  
  return NextResponse.redirect(url);
}

// ============================================
// Middleware Function
// ============================================

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // ----------------------------------------
  // Step 1: Skip static files and assets
  // ----------------------------------------
  if (shouldSkipPath(pathname)) {
    return NextResponse.next();
  }

  // ----------------------------------------
  // Step 2: Allow public routes
  // ----------------------------------------
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // ----------------------------------------
  // Step 3: Check if route requires protection
  // ----------------------------------------
  const requiredRoles = getRequiredRoles(pathname);
  
  // If no specific protection defined, allow access
  // (can be changed to require authentication by default)
  if (!requiredRoles) {
    return NextResponse.next();
  }

  // ----------------------------------------
  // Step 4: Get token from cookie
  // ----------------------------------------
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    // No token present - redirect to login
    console.log(`[MIDDLEWARE] No token found, redirecting to login from: ${pathname}`);
    return createRedirect(request, '/login', 'Silakan login terlebih dahulu');
  }

  // ----------------------------------------
  // Step 5: Verify token
  // ----------------------------------------
  const payload = await verifyToken(token);

  if (!payload) {
    // Token invalid or expired - redirect to login
    console.log(`[MIDDLEWARE] Invalid token, redirecting to login from: ${pathname}`);
    
    // Clear the invalid cookie
    const response = createRedirect(request, '/login', 'Sesi telah berakhir. Silakan login kembali');
    response.cookies.delete(AUTH_COOKIE_NAME);
    
    return response;
  }

  // ----------------------------------------
  // Step 6: Check role authorization
  // ----------------------------------------
  const userRole = payload.role;

  if (!hasRequiredRole(userRole, requiredRoles)) {
    // User doesn't have required role - redirect to unauthorized
    console.log(
      `[MIDDLEWARE] Role mismatch - User: ${userRole}, Required: ${requiredRoles.join(' or ')}, Path: ${pathname}`
    );
    
    return createRedirect(
      request,
      '/unauthorized',
      `Anda tidak memiliki akses ke halaman ini. Role Anda: ${userRole}`
    );
  }

  // ----------------------------------------
  // Step 7: Set user info in headers for API routes
  // ----------------------------------------
  const response = NextResponse.next();
  
  // Add user info to headers for downstream use
  response.headers.set('x-user-id', payload.userId);
  response.headers.set('x-user-email', payload.email);
  response.headers.set('x-user-role', payload.role);

  console.log(`[MIDDLEWARE] Access granted - User: ${payload.email} (${userRole}) -> ${pathname}`);

  return response;
}

// ============================================
// Middleware Config
// ============================================

/**
 * Configure which paths the middleware runs on
 * Using a matcher for better performance
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
