# Perancangan Kode Program
(Source Code Design)

## Repositori Kode Sumber (Source Code Repository)
Seluruh kode sumber untuk proyek ini tersedia secara publik di GitHub pada tautan berikut:
**https://github.com/SKYTEXCoder/sixkul-sim-nextjs16-approuter**

---

## 1. Stack Teknologi dan Tools-tools Pengembangan (Technology Stack)
Sistem ini dibangun menggunakan serangkaian teknologi modern (*Tech Stack*) yang dipilih untuk menjamin performa tinggi, keamanan tipe data (*type safety*), skalabilitas, dan pengalaman pengguna yang optimal. Berikut adalah rincian lengkap setiap tools-tools pengembangan yang digunakan:

### Core Framework & Language
1.  **Next.js 16 (App Router)**
    *   **Fungsi**: Framework utama React untuk pengembangan aplikasi web *full-stack*.
    *   **Alasan Penggunaan**: Verse terbaru (v16) menawarkan fitur *React Server Components (RSC)* yang memungkinkan rendering komponen di server secara default. Ini mengurangi ukuran bundle JavaScript yang dikirim ke klien, meningkatkan kecepatan *First Contentful Paint (FCP)*, dan menyederhanakan pengambilan data (*data fetching*) langsung di komponen tanpa perlu `useEffect`.

2.  **TypeScript**
    *   **Fungsi**: Bahasa pemrograman *superset* dari JavaScript yang menambahkan *static typing*.
    *   **Alasan Penggunaan**: Memberikan keamanan kode yang ketat (*strict type safety*). TypeScript mencegah kesalahan umum seperti *undefined is not a function* saat *compile-time* sebelum kode dijalankan. Ini sangat krusial untuk proyek berskala besar guna menjaga konsistensi struktur data antar komponen.

### Database & Backend
3.  **Prisma ORM**
    *   **Fungsi**: *Object-Relational Mapper (ORM)* generasi baru untuk Node.js dan TypeScript.
    *   **Alasan Penggunaan**: Memudahkan interaksi dengan database menggunakan sintaks yang intuitif dan *type-safe*. Prisma secara otomatis menghasilkan tipe TypeScript berdasarkan skema database (`schema.prisma`), sehingga *autocomplete* kode database sangat akurat.

4.  **Supabase (PostgreSQL Database)**
    *   **Fungsi**: Platform *Backend-as-a-Service (BaaS)* yang menyediakan database PostgreSQL terkelola (*cloud-hosted*).
    *   **Alasan Penggunaan**: Menyediakan infrastruktur database PostgreSQL yang skala produksinya dikelola sepenuhnya di cloud. Supabase dipilih karena kemudahan setup, antarmuka manajemen data (Table Editor) yang intuitif, dan keandalannya yang tinggi. Hal ini menghilangkan beban pemeliharaan server database manual (seperti *patching* atau *backup*) sehingga tim pengembang dapat fokus pada logika aplikasi.

### Authentication & Security
5.  **Clerk**
    *   **Fungsi**: Layanan manajemen identitas dan autentikasi pengguna lengkap.
    *   **Alasan Penggunaan**: Menangani kompleksitas keamanan seperti enkripsi password, manajemen sesi (JWT), 2FA, dan perlindungan *branding* login. Integrasi *middleware*-nya dengan Next.js sangat mulus untuk proteksi rute berbasis peran.

### Frontend & UI Components
6.  **Tailwind CSS**
    *   **Fungsi**: Framework CSS *utility-first*.
    *   **Alasan Penggunaan**: Mempercepat proses *styling* dengan menyediakan kelas-kelas utilitas siap pakai langsung di HTML. Memungkinkan pembuatan desain responsif yang konsisten tanpa perlu menulis file CSS terpisah yang membengkak.

7.  **Shadcn/UI & Radix UI**
    *   **Fungsi**: Koleksi komponen UI yang *reusable* dan *accessible*.
    *   **Alasan Penggunaan**: Shadcn/UI bukan library komponen biasa, melainkan koleksi kode yang bisa di-copy ke dalam proyek (*Headless UI*). Dibangun di atas Radix UI yang menjamin aksesibilitas (WAI-ARIA compliant) untuk komponen interaktif seperti Modal, Dropdown, dan Tabs.

8.  **Lucide React**
    *   **Fungsi**: Library ikon vektor yang ringan.
    *   **Alasan Penggunaan**: Menyediakan ikon visual yang konsisten dan modern dengan ukuran file SVG yang teroptimasi.

### Form & Data Validation
9.  **React Hook Form**
    *   **Fungsi**: Library pengelola state form untuk React.
    *   **Alasan Penggunaan**: Mengurangi jumlah render ulang (*re-renders*) yang tidak perlu saat pengguna mengetik di form, meningkatkan performa halaman pendaftaran atau input data yang kompleks.

10. **Zod**
    *   **Fungsi**: Library validasi skema berbasis TypeScript.
    *   **Alasan Penggunaan**: Digunakan bersama React Hook Form untuk memvalidasi input pengguna baik di sisi klien maupun server. Zod memastikan data yang dikirim ke API sesuai dengan format yang diharapkan.

### Utilities
11. **Sonner**
    *   **Fungsi**: Komponen *Toast notification*.
    *   **Alasan Penggunaan**: Memberikan umpan balik visual (*feedback*) kepada pengguna (sukses/gagal) dengan desain yang elegan dan dukungan *stacking*.

12. **date-fns**
    *   **Fungsi**: Library manipulasi tanggal.
    *   **Alasan Penggunaan**: Memudahkan format tanggal (misalnya: "Senin, 14 Agustus 2024") dan perhitungan selisih waktu untuk fitur jadwal dan absensi.

---

## 2. Arsitektur Umum Aplikasi
Aplikasi SIXKUL dibangun menggunakan framework **Next.js 16** dengan arsitektur **App Router**. Pemilihan ini didasarkan pada kemampuan rendering hibrida yang memisahkan antara *Server Components* (untuk performa dan keamanan data) dan *Client Components* (untuk interaktivitas antarmuka).

Bahasa pemrograman utama yang digunakan adalah **TypeScript**, yang memberikan keamanan tipe (type safety) untuk mengurangi bug saat pengembangan.

### Struktur Direktori Utama
- `src/app`: Berisi routing halaman dan API endpoints (File-system based routing).
- `src/proxy.ts`: Middleware utama untuk autentikasi dan proteksi rute.
- `src/components`: Komponen UI modular (menggunakan Shadcn/UI dan Tailwind CSS).
- `src/lib`: Utilitas logika bisnis, konfigurasi database (Prisma), dan sinkronisasi data.
- `prisma`: Definisi skema database dan konfigurasi ORM.

## 3. Perancangan Database (Prisma ORM)
Database dikelola menggunakan **Prisma ORM** dengan database relasional (PostgreSQL). Skema didefinisikan dalam file `prisma/schema.prisma` yang menjadi kontrak utama data.

### Model Data Utama
1.  **User**: Entitas pusat yang terhubung dengan layanan autentikasi eksternal (Clerk). Menyimpan data dasar seperti `username`, `email`, dan `role` (ADMIN, PEMBINA, SISWA).
2.  **Profile Models** (`StudentProfile`, `PembinaProfile`): Mengimplementasikan pola *One-to-One* dengan model User. Memisahkan data spesifik peran (seperti NIS untuk siswa atau NIP untuk pembina) dari data autentikasi.
3.  **Extracurricular**: Menyimpan data kegiatan ekstrakurikuler. Memiliki relasi *One-to-Many* dengan Pembina (satu ekskul dibina satu pembina) dan relasi *Many-to-Many* dengan Siswa melalui tabel perantara.
4.  **Enrollment**: Tabel perantara (*Joint Table*) yang menghubungkan `StudentProfile` dan `Extracurricular`. Tabel ini tidak hanya mencatat relasi, tetapi juga menyimpan status pendaftaran (`PENDING`, `ACTIVE`, `REJECTED`) dan riwayat akademik.
5.  **Attendance**: Mencatat kehadiran yang terhubung langsung ke `Enrollment` dan `Schedule`, memungkinkan pelacakan historis kehadiran siswa per pertemuan.

**Kode Lengkap: `prisma/schema.prisma`**
```prisma
// SIXKUL - Sistem Informasi Ekstrakurikuler
// Prisma Schema for High School Extracurriculars Management System

generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS
// ============================================

enum UserRole {
  ADMIN
  PEMBINA
  SISWA
}

enum ExtracurricularStatus {
  ACTIVE
  INACTIVE
}

enum EnrollmentStatus {
  PENDING
  ACTIVE
  REJECTED
  ALUMNI
  CANCELLED
}

enum AttendanceStatus {
  PRESENT
  SICK
  PERMISSION
  ALPHA
}

// ============================================
// MODELS
// ============================================

/// Central User entity - linked to Clerk authentication
model User {
  id            String   @id @default(cuid())
  clerk_id      String   @unique  // Clerk user ID (e.g., "user_2abc123...")
  username      String   @unique  // Username for display and auth
  email         String?           // Optional, synced from Clerk
  full_name     String
  role          UserRole
  avatar_url    String?
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  // Relations
  studentProfile StudentProfile?
  pembinaProfile PembinaProfile?
  notifications  Notification[]
  announcements  Announcement[]

  @@map("users")
}

/// Student profile - One-to-One with User
model StudentProfile {
  id           String  @id @default(cuid())
  user_id      String  @unique
  nis          String  @unique // Nomor Induk Siswa
  class_name   String  // e.g., "XII IPA 1"
  major        String  // e.g., "IPA", "IPS"
  phone_number String?

  // Relations
  user        User         @relation(fields: [user_id], references: [id], onDelete: Cascade)
  enrollments Enrollment[]

  @@map("student_profiles")
}

/// Pembina (Advisor/Coach) profile - One-to-One with User
model PembinaProfile {
  id           String  @id @default(cuid())
  user_id      String  @unique
  nip          String  @unique // Nomor Induk Pegawai
  expertise    String? // Bidang keahlian
  phone_number String?

  // Relations
  user             User              @relation(fields: [user_id], references: [id], onDelete: Cascade)
  extracurriculars Extracurricular[]

  @@map("pembina_profiles")
}

/// Extracurricular activity/club
model Extracurricular {
  id          String                 @id @default(cuid())
  name        String
  category    String // e.g., "Olahraga", "Seni", "Akademik"
  description String?
  logo_url    String?
  status      ExtracurricularStatus  @default(ACTIVE)
  pembina_id  String
  created_at  DateTime               @default(now())
  updated_at  DateTime               @updatedAt

  // Relations
  pembina       PembinaProfile @relation(fields: [pembina_id], references: [id], onDelete: Restrict)
  enrollments   Enrollment[]
  schedules     Schedule[]
  announcements Announcement[]

  @@map("extracurriculars")
}

/// Enrollment - Junction table for Many-to-Many between Student and Extracurricular
model Enrollment {
  id                 String           @id @default(cuid())
  student_id         String
  extracurricular_id String
  status             EnrollmentStatus @default(PENDING)
  joined_at          DateTime         @default(now())
  academic_year      String // e.g., "2024/2025"
  updated_at         DateTime         @updatedAt

  // Relations
  student         StudentProfile  @relation(fields: [student_id], references: [id], onDelete: Cascade)
  extracurricular Extracurricular @relation(fields: [extracurricular_id], references: [id], onDelete: Cascade)
  attendances     Attendance[]

  // Prevent duplicate enrollments
  @@unique([student_id, extracurricular_id])
  @@map("enrollments")
}

/// Schedule for extracurricular activities
model Schedule {
  id                 String @id @default(cuid())
  extracurricular_id String
  day_of_week        String // e.g., "MONDAY", "TUESDAY"
  start_time         String // e.g., "14:00"
  end_time           String // e.g., "16:00"
  location           String // e.g., "Lapangan Basket", "Ruang Musik"

  // Relations
  extracurricular Extracurricular @relation(fields: [extracurricular_id], references: [id], onDelete: Cascade)
  attendances     Attendance[]

  @@map("schedules")
}

/// Attendance tracking - Linked to Enrollment (not Student directly)
model Attendance {
  id            String           @id @default(cuid())
  enrollment_id String
  schedule_id   String? // Optional link to specific schedule/event
  date          DateTime
  status        AttendanceStatus
  notes         String?
  created_at    DateTime         @default(now())

  // Relations
  enrollment Enrollment @relation(fields: [enrollment_id], references: [id], onDelete: Cascade)
  schedule   Schedule?  @relation(fields: [schedule_id], references: [id], onDelete: SetNull)

  // Prevent duplicate attendance records for same day
  @@unique([enrollment_id, date])
  @@map("attendances")
}

/// Announcements for extracurricular activities
model Announcement {
  id                 String   @id @default(cuid())
  extracurricular_id String
  author_id          String
  title              String
  content            String
  created_at         DateTime @default(now())

  // Relations
  extracurricular Extracurricular @relation(fields: [extracurricular_id], references: [id], onDelete: Cascade)
  author          User            @relation(fields: [author_id], references: [id], onDelete: Cascade)

  @@map("announcements")
}

/// Notifications for users
model Notification {
  id         String   @id @default(cuid())
  user_id    String
  title      String
  message    String
  is_read    Boolean  @default(false)
  created_at DateTime @default(now())

  // Relations
  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("notifications")
}
```

## 4. Sistem Otentikasi dan Middleware Keamanan
Implementasi keamanan aplikasi berpusat pada dua komponen utama: **Middleware Terpusat** dan **Sinkronisasi Just-in-Time**.

### Middleware Autentikasi (`src/proxy.ts`)
Alih-alih menggunakan file `middleware.ts` standar yang terpisah-pisah, proyek ini memusatkan logika perlindungan rute dalam file `src/proxy.ts`. Middleware ini bertindak sebagai gerbang utama (gatekeeper) untuk setiap permintaan yang masuk ke server.

**Fungsi Utama:**
1.  **Integrasi Clerk**: Menggunakan `clerkMiddleware` untuk memvalidasi sesi pengguna secara otomatis.
2.  **Route Matching**: Mendefinisikan pola rute menggunakan helper `createRouteMatcher` untuk:
    *   Rute Publik: `/sign-in`, `/unauthorized`.
    *   Rute Role-Based: `/admin/*`, `/pembina/*`, `/student/*`.
3.  **Role-Based Access Control (RBAC)**:
    Middleware secara aktif memeriksa metadata peran pengguna (`sessionClaims.public_metadata.role`) dan menegakkan aturan akses yang ketat:
    *   Jika pengguna `SISWA` mencoba mengakses `/admin/*`, mereka langsung dialihkan ke halaman `/unauthorized`.
    *   Mencegah *Horizontal Privilege Escalation* antar tipe pengguna.
4.  **Redirection Logic**: Menangani logika pengalihan cerdas, misalnya pengguna yang sudah login namun mengakses halaman login akan otomatis diarahkan ke dashboard yang sesuai dengan peran mereka.

**Kode Lengkap: `src/proxy.ts`**
```typescript
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

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// ============================================
// Route Matchers
// ============================================

// Public routes - only sign-in and unauthorized pages
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/unauthorized',
])

// Define role-specific routes
const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isPembinaRoute = createRouteMatcher(['/pembina(.*)'])
const isStudentRoute = createRouteMatcher(['/student(.*)'])

// ============================================
// Helper Functions
// ============================================

/**
 * Get dashboard path based on user role
 */
function getDashboardPath(role: string | undefined): string {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard'
    case 'PEMBINA':
      return '/pembina/dashboard'
    case 'SISWA':
      return '/student/dashboard'
    default:
      return '/sign-in'
  }
}

// ============================================
// Clerk Middleware
// ============================================

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()
  const pathname = req.nextUrl.pathname

  // Debug logging
  console.log(`[MIDDLEWARE] Path: ${pathname}, UserId: ${userId || 'none'}`)

  // Get user role from session claims (public_metadata.role)
  // Note: We use "public_metadata" key as configured in Clerk Dashboard
  const userRole = (sessionClaims?.public_metadata as { role?: string })?.role

  // ----------------------------------------
  // CASE 1: Unauthenticated user visiting "/" → redirect to sign-in
  // ----------------------------------------
  if (!userId && pathname === '/') {
    console.log('[MIDDLEWARE] CASE 1: Unauthenticated on "/" - redirecting to /sign-in')
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  // ----------------------------------------
  // CASE 2: Authenticated user visiting "/" or "/login" → redirect to their dashboard
  // ----------------------------------------
  if (userId && (pathname === '/' || pathname === '/login' || pathname.startsWith('/sign-in'))) {
    return NextResponse.redirect(new URL(getDashboardPath(userRole), req.url))
  }

  // ----------------------------------------
  // Allow public routes (sign-in, unauthorized)
  // ----------------------------------------
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // ----------------------------------------
  // CASE 3: Unauthenticated user trying to access protected routes → redirect to sign-in
  // ----------------------------------------
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  // ----------------------------------------
  // CASE 4: Role-based access control - prevent cross-role access
  // ----------------------------------------
  if (isAdminRoute(req) && userRole !== 'ADMIN') {
    console.log(`[MIDDLEWARE] Role mismatch - User role: ${userRole}, required: ADMIN`)
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }
  
  if (isPembinaRoute(req) && userRole !== 'PEMBINA') {
    console.log(`[MIDDLEWARE] Role mismatch - User role: ${userRole}, required: PEMBINA`)
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }
  
  if (isStudentRoute(req) && userRole !== 'SISWA') {
    console.log(`[MIDDLEWARE] Role mismatch - User role: ${userRole}, required: SISWA`)
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  // ----------------------------------------
  // Allow the request to proceed
  // ----------------------------------------
  return NextResponse.next()
})

// ============================================
// Middleware Config
// ============================================

export const config = {
  matcher: [
    // Explicitly match root
    '/',
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
```

### Sinkronisasi Pengguna (`src/lib/sync-user.ts`)
Sistem menggunakan mekanisme **"Just-in-Time (JIT) Synchronization"** untuk menjaga konsistensi data antara Clerk (Auth Provider) dan Database Lokal.

**Kode Lengkap: `src/lib/sync-user.ts`**
```typescript
/**
 * SIXKUL Just-in-Time User Sync Utility
 * 
 * Automatically creates Prisma database records for Clerk users
 * on their first access to the application.
 * 
 * @module lib/sync-user
 */

import prisma from '@/lib/prisma';
import { User, UserRole, StudentProfile, PembinaProfile } from '@/generated/prisma';

// ============================================
// Types
// ============================================

interface ClerkSessionClaims {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  image_url?: string;
  public_metadata?: {
    role?: string;
  };
}

interface SyncResult {
  user: User;
  profile: StudentProfile | PembinaProfile | null;
  isNewUser: boolean;
}

interface SyncError {
  success: false;
  error: string;
  statusCode: number;
}

type SyncResponse = 
  | { success: true; data: SyncResult }
  | SyncError;

// ============================================
// Helper Functions
// ============================================

/**
 * Generate a unique username from Clerk data
 */
function generateUsername(
  clerkUserId: string,
  sessionClaims: ClerkSessionClaims
): string {
  // Priority: Clerk username > email prefix > clerk_id short
  if (sessionClaims.username) {
    return sessionClaims.username;
  }
  
  if (sessionClaims.email) {
    const emailPrefix = sessionClaims.email.split('@')[0];
    return emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  }
  
  // Fallback: use last 8 chars of Clerk user ID
  return `user_${clerkUserId.slice(-8)}`;
}

/**
 * Generate full name from Clerk data
 */
function generateFullName(sessionClaims: ClerkSessionClaims): string {
  if (sessionClaims.full_name) {
    return sessionClaims.full_name;
  }
  
  if (sessionClaims.first_name || sessionClaims.last_name) {
    return [sessionClaims.first_name, sessionClaims.last_name]
      .filter(Boolean)
      .join(' ');
  }
  
  if (sessionClaims.username) {
    return sessionClaims.username;
  }
  
  if (sessionClaims.email) {
    return sessionClaims.email.split('@')[0];
  }
  
  return 'User';
}

/**
 * Map Clerk role string to Prisma UserRole enum
 */
function mapRole(roleString?: string): UserRole {
  const normalizedRole = roleString?.toUpperCase();
  
  switch (normalizedRole) {
    case 'ADMIN':
      return 'ADMIN';
    case 'PEMBINA':
      return 'PEMBINA';
    case 'SISWA':
    default:
      return 'SISWA'; // Default to SISWA if no role specified
  }
}

// ============================================
// Main Sync Function
// ============================================

/**
 * Get existing user or create new one from Clerk data
 * 
 * This is the main JIT sync function. Call this whenever you need
 * a local database user from a Clerk session.
 * 
 * @param clerkUserId - The Clerk user ID (from auth().userId)
 * @param sessionClaims - The session claims (from auth().sessionClaims)
 * @returns SyncResponse with user, profile, and isNewUser flag
 * 
 * @example
 * const { userId, sessionClaims } = await auth();
 * const result = await getOrCreateUser(userId, sessionClaims);
 * if (!result.success) {
 *   return NextResponse.json({ error: result.error }, { status: result.statusCode });
 * }
 * const { user, profile, isNewUser } = result.data;
 */
export async function getOrCreateUser(
  clerkUserId: string,
  sessionClaims: ClerkSessionClaims | null | undefined
): Promise<SyncResponse> {
  try {
    // ----------------------------------------
    // Step 1: Check if user already exists
    // ----------------------------------------
    const existingUser = await prisma.user.findUnique({
      where: { clerk_id: clerkUserId },
      include: {
        studentProfile: true,
        pembinaProfile: true,
      },
    });

    if (existingUser) {
      // User exists - return with existing profile
      const profile = existingUser.studentProfile || existingUser.pembinaProfile;
      return {
        success: true,
        data: {
          user: existingUser,
          profile,
           isNewUser: false,
        },
      };
    }

    // ----------------------------------------
    // Step 2: User doesn't exist - create new one
    // ----------------------------------------
    const claims = sessionClaims || {};
    const role = mapRole(claims.public_metadata?.role);
    const username = generateUsername(clerkUserId, claims);
    const fullName = generateFullName(claims);

    console.log(`[JIT SYNC] Creating new user: ${username} (${role}) - Clerk ID: ${clerkUserId}`);

    // Create user with role-specific profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the base user record
      const newUser = await tx.user.create({
        data: {
          clerk_id: clerkUserId,
          username,
          email: claims.email || null,
          full_name: fullName,
          role,
          avatar_url: claims.image_url || null,
        },
      });

      let profile: StudentProfile | PembinaProfile | null = null;

      // Create role-specific profile
      if (role === 'SISWA') {
        profile = await tx.studentProfile.create({
          data: {
            user_id: newUser.id,
            nis: `PLACEHOLDER_${clerkUserId.slice(-6)}`,
            class_name: 'Belum diatur',
            major: 'Belum diatur',
            phone_number: null,
          },
        });
        console.log(`[JIT SYNC] Created StudentProfile for ${username}`);
      } else if (role === 'PEMBINA') {
        profile = await tx.pembinaProfile.create({
          data: {
            user_id: newUser.id,
            nip: `PLACEHOLDER_${clerkUserId.slice(-6)}`,
            expertise: null,
            phone_number: null,
          },
        });
        console.log(`[JIT SYNC] Created PembinaProfile for ${username}`);
      }
      // ADMIN doesn't need a profile

      return { user: newUser, profile };
    });

    console.log(`[JIT SYNC] Successfully created user: ${result.user.id}`);

    return {
      success: true,
      data: {
        user: result.user,
        profile: result.profile,
        isNewUser: true,
      },
    };

  } catch (error) {
    console.error('[JIT SYNC ERROR]', error);
    
    // Handle unique constraint violations (race condition)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      // Another request already created the user - try to fetch them
      const existingUser = await prisma.user.findUnique({
        where: { clerk_id: clerkUserId },
        include: {
          studentProfile: true,
          pembinaProfile: true,
        },
      });

      if (existingUser) {
        return {
          success: true,
          data: {
            user: existingUser,
            profile: existingUser.studentProfile || existingUser.pembinaProfile,
            isNewUser: false,
          },
        };
      }
    }

    return {
      success: false,
      error: 'Failed to sync user. Please try again.',
      statusCode: 500,
    };
  }
}

// ============================================
// Convenience Functions
// ============================================

/**
 * Get or create user and return only the user ID
 * Useful when you only need the local database user ID
 */
export async function getOrCreateUserId(
  clerkUserId: string,
  sessionClaims: ClerkSessionClaims | null | undefined
): Promise<string | null> {
  const result = await getOrCreateUser(clerkUserId, sessionClaims);
  if (!result.success) {
    return null;
  }
  return result.data.user.id;
}

/**
 * Get or create user and return only the profile
 * Useful for role-specific operations
 */
export async function getOrCreateProfile(
  clerkUserId: string,
  sessionClaims: ClerkSessionClaims | null | undefined
): Promise<{ profile: StudentProfile | PembinaProfile | null; userId: string } | null> {
  const result = await getOrCreateUser(clerkUserId, sessionClaims);
  if (!result.success) {
    return null;
  }
  return {
    profile: result.data.profile,
    userId: result.data.user.id,
  };
}

/**
 * Get or create student profile specifically
 * Returns null if user is not a SISWA
 */
export async function getOrCreateStudentProfile(
  clerkUserId: string,
  sessionClaims: ClerkSessionClaims | null | undefined
): Promise<{ studentProfile: StudentProfile; userId: string } | null> {
  const result = await getOrCreateUser(clerkUserId, sessionClaims);
  if (!result.success) {
    return null;
  }
  
  if (result.data.user.role !== 'SISWA' || !result.data.profile) {
    return null;
  }
  
  return {
    studentProfile: result.data.profile as StudentProfile,
    userId: result.data.user.id,
  };
}

/**
 * Get or create pembina profile specifically
 * Returns null if user is not a PEMBINA
 */
export async function getOrCreatePembinaProfile(
  clerkUserId: string,
  sessionClaims: ClerkSessionClaims | null | undefined
): Promise<{ pembinaProfile: PembinaProfile; userId: string } | null> {
  const result = await getOrCreateUser(clerkUserId, sessionClaims);
  if (!result.success) {
    return null;
  }
  
  if (result.data.user.role !== 'PEMBINA' || !result.data.profile) {
    return null;
  }
  
  return {
    pembinaProfile: result.data.profile as PembinaProfile,
    userId: result.data.user.id,
  };
}
```

## 5. Implementasi Fitur Utama: Manajemen Pendaftaran (Enrollment)
Salah satu fitur inti adalah kemampuan siswa melihat status keikutsertaan ekstrakurikuler mereka. Fitur ini diimplementasikan di halaman `src/app/(dashboard)/student/enrollments/page.tsx`.

### Alur Data Server-Side Rendering (SSR)
Halaman ini menggunakan pola **React Server Component (RSC)**:

1.  **Data Fetching di Server**:
    Halaman bersifat `async` dan memanggil fungsi `getStudentEnrollments()` langsung di level komponen. Fungsi ini berjalan di server, mengakses database via Prisma untuk mengambil data enrollments siswa yang sedang login.

2.  **Optimasi Database Query**:
    Query Prisma dioptimalkan untuk mengambil data relasional sekaligus (Eager Loading): enrollment beserta detail ekstrakurikuler, jadwal, dan pembina dalam satu *round-trip* database.

3.  **Conditional Rendering**:
    *   Jika siswa belum mendaftar apapun, komponen `EmptyEnrollments` ditampilkan dengan ilustrasi dan tombol ajakan (Call-to-Action) untuk mendaftar.
    *   Jika ada data, daftar `EnrollmentCard` dirender dalam layout Grid responsif.

4.  **Keamanan**:
    Karena proses fetching terjadi di server, logika bisnis dan struktur query database tidak pernah terekspos ke klien (browser), meningkatkan keamanan aplikasi secara signifikan.

**Kode Lengkap: `src/app/(dashboard)/student/enrollments/page.tsx`**

```tsx
/**
 * Student Enrollments Page (Ekstrakurikuler Saya)
 * 
 * Server Component that displays all extracurriculars the student is enrolled in.
 * Uses Prisma directly for data fetching (no API routes).
 * 
 * @module app/(dashboard)/student/enrollments/page
 */

import { redirect } from "next/navigation";
import { Trophy, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStudentEnrollments } from "@/lib/enrollments-data";
import { EnrollmentCard } from "@/components/enrollment/EnrollmentCard";
import { EmptyEnrollments } from "@/components/enrollment/EmptyEnrollments";

// ============================================
// Error Display Component
// ============================================

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        Terjadi Kesalahan
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-md">
        {message}
      </p>
      <Button asChild>
        <a href="/student/enrollments">Coba Lagi</a>
      </Button>
    </div>
  );
}

// ============================================
// Main Page Component
// ============================================

export default async function StudentEnrollmentsPage() {
  // Fetch enrollments using server-side data layer
  const result = await getStudentEnrollments();

  // Handle unauthorized - redirect to sign-in
  if (result.errorCode === "UNAUTHORIZED") {
    redirect("/sign-in");
  }

  // Handle forbidden - redirect to home or show error
  if (result.errorCode === "FORBIDDEN") {
    redirect("/");
  }

  // Handle errors
  if (!result.success || !result.data) {
    return <ErrorDisplay message={result.error || "Gagal memuat data ekstrakurikuler."} />;
  }

  const enrollments = result.data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            Ekstrakurikuler Saya
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Daftar ekstrakurikuler yang kamu ikuti
          </p>
        </div>
      </div>

      {/* Content */}
      {enrollments.length === 0 ? (
        <EmptyEnrollments />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map((enrollment) => (
            <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </div>
      )}
    </div>
  );
}
```
