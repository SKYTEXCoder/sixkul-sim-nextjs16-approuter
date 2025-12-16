# 🚀 Panduan Developer SIXKUL

> **SIXKUL** - _Sistem Informasi Ekstrakurikuler_  
> Sistem manajemen ekstrakurikuler untuk sekolah menengah

Selamat datang di proyek SIXKUL! Panduan lengkap ini akan membantu kamu untuk memulai proses development.

---

## 📋 Daftar Isi

1. [Prasyarat](#-prasyarat)
2. [Setup Awal](#-setup-awal)
3. [Konfigurasi Environment](#-konfigurasi-environment)
4. [Setup Database](#-setup-database)
5. [Menjalankan Aplikasi](#-menjalankan-aplikasi)
6. [Arsitektur Proyek](#-arsitektur-proyek)
7. [Tech Stack](#-tech-stack)
8. [Alur Kerja Development](#-alur-kerja-development)
9. [Kredensial Login untuk Testing](#-kredensial-login-untuk-testing)
10. [Masalah Umum & Troubleshooting](#-masalah-umum--troubleshooting)

---

## 🛠 Prasyarat

Sebelum memulai, pastikan kamu sudah menginstall software berikut di komputer:

| Software                 | Versi Minimum         | Link Download                                           |
| ------------------------ | --------------------- | ------------------------------------------------------- |
| **Node.js**              | v20.x atau lebih baru | [nodejs.org](https://nodejs.org/)                       |
| **npm**                  | v10.x atau lebih baru | Sudah termasuk dalam Node.js                            |
| **Git**                  | Terbaru               | [git-scm.com](https://git-scm.com/)                     |
| **PostgreSQL**           | v14.x atau lebih baru | [postgresql.org](https://www.postgresql.org/download/)  |
| **VS Code** (disarankan) | Terbaru               | [code.visualstudio.com](https://code.visualstudio.com/) |

### Verifikasi Instalasi

Jalankan perintah berikut di terminal untuk memastikan semua sudah terinstall dengan benar:

```bash
node --version    # Harus menampilkan v20.x.x atau lebih tinggi
npm --version     # Harus menampilkan v10.x.x atau lebih tinggi
git --version     # Harus menampilkan git version 2.x.x
psql --version    # Harus menampilkan psql (PostgreSQL) 14.x atau lebih tinggi
```

---

## 📦 Setup Awal

### Langkah 1: Clone Repository

```bash
# Clone proyek
git clone https://github.com/SKYTEXCoder/sixkul-sim-nextjs16-approuter.git

# Masuk ke direktori proyek
cd sixkul-sim-nextjs16-approuter
```

### Langkah 2: Install Dependencies

```bash
# Install semua package yang diperlukan
npm install
```

Perintah ini akan menginstall semua package yang diperlukan termasuk:

- **Next.js 16** - Framework React
- **Prisma** - Database ORM
- **Clerk** - Autentikasi
- **Tailwind CSS 4** - Styling
- **ShadCN UI** - Komponen UI (berbasis Radix UI)

---

## 🔐 Konfigurasi Environment

### Langkah 1: Buat File `.env`

Buat file `.env` di root proyek dengan variabel berikut:

```env
# ===========================================
# KONFIGURASI DATABASE
# ===========================================
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/NAMA_DATABASE?schema=public"

# Contoh untuk PostgreSQL lokal:
# DATABASE_URL="postgresql://postgres:passwordku@localhost:5432/sixkul_db?schema=public"

# ===========================================
# AUTENTIKASI CLERK
# ===========================================
# Dapatkan ini dari https://dashboard.clerk.com/ setelah membuat aplikasi

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# URL redirect Clerk
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

### Langkah 2: Konfigurasi Clerk Dashboard

1. Buka [Clerk Dashboard](https://dashboard.clerk.com/)
2. Buat aplikasi baru (atau minta akses ke aplikasi yang sudah ada dari ketua tim)
3. Salin **Publishable Key** dan **Secret Key**
4. Di dashboard Clerk, konfigurasi:
   - **Users & Authentication > Sessions > JWT Claims**: Tambahkan `publicMetadata` untuk menyertakan role user
   - **Paths**: Set sign-in url ke `/sign-in`

> [!IMPORTANT]
> Hubungi ketua tim untuk mendapatkan kredensial aplikasi Clerk yang sudah ada, atau buat aplikasi development baru untuk testing.

---

## 🗄 Setup Database

### Langkah 1: Buat Database PostgreSQL

Menggunakan pgAdmin atau command line:

```bash
# Konek ke PostgreSQL
psql -U postgres

# Buat database
CREATE DATABASE sixkul_db;

# Keluar dari psql
\q
```

### Langkah 2: Generate Prisma Client

```bash
# Generate Prisma client berdasarkan schema
npx prisma generate
```

Perintah ini akan generate Prisma client di direktori `src/generated/prisma/`.

### Langkah 3: Push Schema ke Database

```bash
# Push schema ke database (membuat tabel-tabel)
npx prisma db push
```

### Langkah 4: Seed Database (Opsional)

Script seed akan membuat user di Clerk dan database. Jalankan ini untuk mengisi data testing:

```bash
# Pastikan CLERK_SECRET_KEY sudah diset di .env terlebih dahulu!
npm run db:seed
```

> [!WARNING]
> Script seed memerlukan `CLERK_SECRET_KEY` untuk membuat user melalui Clerk Backend API. Pastikan ini sudah dikonfigurasi dengan benar sebelum menjalankan.

### Langkah 5: Lihat Database (Opsional)

```bash
# Buka Prisma Studio untuk melihat/edit data
npx prisma studio
```

Ini akan membuka GUI di `http://localhost:5555` untuk menjelajah database kamu.

---

## 🚀 Menjalankan Aplikasi

### Mode Development

```bash
# Jalankan development server
npm run dev
```

Aplikasi akan tersedia di: **http://localhost:3000**

### Script Lainnya

| Perintah          | Deskripsi                                     |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Jalankan development server dengan hot-reload |
| `npm run build`   | Buat production build                         |
| `npm run start`   | Jalankan production server                    |
| `npm run lint`    | Jalankan ESLint untuk kualitas kode           |
| `npm run db:seed` | Seed database dengan data testing             |

---

## 📁 Arsitektur Proyek

```
sixkul-sim-nextjs16-approuter/
├── prisma/
│   ├── schema.prisma         # Definisi schema database
│   └── seed.ts               # Script seeding database
├── public/                   # Asset statis (gambar, font)
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (dashboard)/      # Route dashboard yang terproteksi
│   │   │   ├── admin/        # Halaman dashboard admin
│   │   │   ├── pembina/      # Halaman dashboard pembina
│   │   │   └── student/      # Halaman dashboard siswa
│   │   ├── api/              # Handler route API
│   │   ├── sign-in/          # Halaman autentikasi
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Halaman utama
│   ├── components/           # Komponen React yang reusable
│   │   ├── ui/               # Komponen ShadCN UI
│   │   ├── layout/           # Komponen layout (Sidebar, Header)
│   │   └── ...               # Komponen spesifik fitur
│   ├── generated/            # File yang di-generate otomatis
│   │   └── prisma/           # Prisma client (auto-generated)
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Fungsi utility dan konfigurasi
│   └── types/                # Definisi tipe TypeScript
├── .env                      # Variabel environment (tidak di git)
├── package.json              # Dependencies dan scripts
├── proxy.ts                  # Konfigurasi middleware Clerk
└── tsconfig.json             # Konfigurasi TypeScript
```

---

## 🛠 Tech Stack

### Framework Utama

- **[Next.js 16](https://nextjs.org/)** - Framework React dengan App Router
- **[React 19](https://react.dev/)** - Library UI
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript yang type-safe

### Database & ORM

- **[PostgreSQL](https://www.postgresql.org/)** - Database relasional
- **[Prisma 6](https://www.prisma.io/)** - ORM modern untuk Node.js

### Autentikasi

- **[Clerk](https://clerk.com/)** - Solusi autentikasi lengkap
  - Role-based access control (ADMIN, PEMBINA, SISWA)
  - Manajemen session via JWT

### Styling & UI

- **[Tailwind CSS 4](https://tailwindcss.com/)** - Framework CSS utility-first
- **[ShadCN UI](https://ui.shadcn.com/)** - Komponen dengan desain yang cantik
- **[Radix UI](https://www.radix-ui.com/)** - UI primitives headless
- **[Lucide React](https://lucide.dev/)** - Library ikon

### Form & Validasi

- **[React Hook Form](https://react-hook-form.com/)** - Manajemen form
- **[Zod](https://zod.dev/)** - Validasi schema

### Utilitas

- **[date-fns](https://date-fns.org/)** - Library utilitas tanggal
- **[Sonner](https://sonner.emilkowal.ski/)** - Notifikasi toast

---

## 💻 Alur Kerja Development

### Membuat Komponen Baru

1. **Komponen UI**: Letakkan di `src/components/ui/`
2. **Komponen Fitur**: Letakkan di `src/components/<nama-fitur>/`
3. **Komponen Layout**: Letakkan di `src/components/layout/`

### Membuat Halaman Baru

Dengan Next.js App Router, buat halaman dengan menambahkan folder dan file `page.tsx`:

```
src/app/(dashboard)/student/halaman-baru/page.tsx  →  Route: /student/halaman-baru
```

### Membuat Route API

Tambahkan route handler di direktori `src/app/api/`:

```
src/app/api/endpoint-baru/route.ts  →  API: /api/endpoint-baru
```

### Perubahan Database

1. Modifikasi `prisma/schema.prisma`
2. Jalankan `npx prisma db push` untuk update database
3. Jalankan `npx prisma generate` untuk update Prisma client

### Menambah Komponen ShadCN

```bash
# Tambah komponen ShadCN baru
npx shadcn@latest add <nama-komponen>

# Contoh:
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

---

## 🔑 Kredensial Login untuk Testing

Setelah menjalankan `npm run db:seed`, kamu bisa menggunakan akun testing ini:

### Akun Admin

| Email                  | Password        |
| ---------------------- | --------------- |
| `admin@sixkul.sch.id`  | `rtx5070ti16gb` |
| `admin2@sixkul.sch.id` | `rtx5070ti16gb` |
| `admin3@sixkul.sch.id` | `rtx5070ti16gb` |

### Akun Pembina (Guru)

| Email                    | Password        |
| ------------------------ | --------------- |
| `pembina@sixkul.sch.id`  | `rtx5070ti16gb` |
| `pembina2@sixkul.sch.id` | `rtx5070ti16gb` |
| `pembina3@sixkul.sch.id` | `rtx5070ti16gb` |
| `pembina4@sixkul.sch.id` | `rtx5070ti16gb` |
| `pembina5@sixkul.sch.id` | `rtx5070ti16gb` |

### Akun Siswa

| Email                    | Password        |
| ------------------------ | --------------- |
| `student@sixkul.sch.id`  | `rtx5070ti16gb` |
| `student2@sixkul.sch.id` | `rtx5070ti16gb` |
| `student3@sixkul.sch.id` | `rtx5070ti16gb` |
| `student4@sixkul.sch.id` | `rtx5070ti16gb` |
| `student5@sixkul.sch.id` | `rtx5070ti16gb` |

---

## ❓ Masalah Umum & Troubleshooting

### 1. `CLERK_SECRET_KEY is not set`

**Masalah**: Script seed gagal dengan error ini.  
**Solusi**: Pastikan `CLERK_SECRET_KEY` sudah diset di file `.env` dengan secret key Clerk yang valid.

### 2. Prisma Client Tidak Ditemukan

**Masalah**: `Cannot find module '../src/generated/prisma'`  
**Solusi**: Jalankan `npx prisma generate` untuk generate Prisma client.

### 3. Koneksi Database Gagal

**Masalah**: Tidak bisa konek ke PostgreSQL.  
**Solusi**:

- Pastikan PostgreSQL sudah berjalan
- Cek `DATABASE_URL` di `.env`
- Pastikan database sudah dibuat

### 4. Port 3000 Sudah Dipakai

**Masalah**: Aplikasi lain sedang menggunakan port 3000.  
**Solusi**: Hentikan aplikasi lain tersebut atau jalankan Next.js di port berbeda:

```bash
npm run dev -- -p 3001
```

### 5. Loop Redirect Autentikasi

**Masalah**: Terjebak dalam loop redirect sign-in.  
**Solusi**:

- Bersihkan cookies browser
- Pastikan variabel environment Clerk sudah benar
- Cek bahwa `publicMetadata.role` sudah diset dengan benar di Clerk

### 6. Definisi Tipe Tidak Ditemukan

**Masalah**: Error TypeScript untuk tipe Prisma.  
**Solusi**: Regenerate Prisma client:

```bash
npx prisma generate
```

---

## 📚 Sumber Belajar Tambahan

- **[Dokumentasi Next.js](https://nextjs.org/docs)** - Pelajari fitur-fitur Next.js
- **[Dokumentasi Clerk](https://clerk.com/docs)** - Panduan autentikasi
- **[Dokumentasi Prisma](https://www.prisma.io/docs)** - Panduan database ORM
- **[Dokumentasi Tailwind CSS](https://tailwindcss.com/docs)** - Class utilitas CSS
- **[Dokumentasi ShadCN UI](https://ui.shadcn.com/docs)** - Library komponen

---

## 👥 Kontak Tim Proyek

Jika ada pertanyaan atau butuh bantuan, hubungi ketua tim yang memberikan akses ke repository ini.

---

**Selamat Coding! 🎉**
