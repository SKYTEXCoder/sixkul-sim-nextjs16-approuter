/**
 * Seed script to add test notifications for student_siti
 *
 * Run with: npx ts-node --compiler-options '{"module":"commonjs"}' scripts/seed-notifications.ts
 */

import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding test notifications for student_siti...");

  // Find student_siti user
  const user = await prisma.user.findFirst({
    where: { username: "student_siti" },
    include: {
      studentProfile: {
        include: {
          enrollments: {
            include: {
              extracurricular: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    console.error("❌ User student_siti not found!");
    process.exit(1);
  }

  console.log(`✅ Found user: ${user.full_name} (${user.id})`);

  // Get enrollments
  const enrollments = user.studentProfile?.enrollments || [];
  if (enrollments.length === 0) {
    console.error("❌ No enrollments found for student_siti!");
    process.exit(1);
  }

  console.log(`✅ Found ${enrollments.length} enrollments`);

  // Clear existing notifications for this user
  await prisma.notification.deleteMany({
    where: { user_id: user.id },
  });
  console.log("🗑️ Cleared existing notifications");

  // Create test notifications
  const now = new Date();
  const notifications = [
    // Unread ANNOUNCEMENT
    {
      user_id: user.id,
      enrollment_id: enrollments[0].id,
      type: "ANNOUNCEMENT" as const,
      title: `Pengumuman Baru — ${enrollments[0].extracurricular.name}`,
      message:
        "Latihan minggu ini akan diadakan di lapangan utama. Harap hadir tepat waktu!",
      is_read: false,
      created_at: new Date(now.getTime() - 30 * 60 * 1000), // 30 mins ago
    },
    // Unread ATTENDANCE
    {
      user_id: user.id,
      enrollment_id: enrollments[0].id,
      type: "ATTENDANCE" as const,
      title: `Absensi Tercatat — ${enrollments[0].extracurricular.name}`,
      message:
        "Kehadiran Anda pada Senin, 16 Desember 2024 telah dicatat sebagai: Hadir",
      is_read: false,
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    // Unread SCHEDULE
    {
      user_id: user.id,
      enrollment_id: enrollments[0].id,
      type: "SCHEDULE" as const,
      title: `Jadwal Baru — ${enrollments[0].extracurricular.name}`,
      message: "Sesi baru telah dijadwalkan untuk Rabu, 18 Desember 2024",
      is_read: false,
      created_at: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    // Unread ENROLLMENT
    {
      user_id: user.id,
      enrollment_id: enrollments[0].id,
      type: "ENROLLMENT" as const,
      title: `Pendaftaran Diterima — ${enrollments[0].extracurricular.name}`,
      message: `Selamat! Pendaftaran Anda di ${enrollments[0].extracurricular.name} telah disetujui.`,
      is_read: false,
      created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    // Read notification (older)
    {
      user_id: user.id,
      enrollment_id: enrollments[0].id,
      type: "ANNOUNCEMENT" as const,
      title: `Pengumuman — ${enrollments[0].extracurricular.name}`,
      message: "Ini adalah pengumuman lama yang sudah dibaca.",
      is_read: true,
      created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  ];

  // Add more notifications if there are more enrollments
  if (enrollments.length > 1) {
    notifications.push({
      user_id: user.id,
      enrollment_id: enrollments[1].id,
      type: "SCHEDULE" as const,
      title: `Perubahan Jadwal — ${enrollments[1].extracurricular.name}`,
      message: "Jadwal sesi pada Jumat, 20 Desember 2024 telah diperbarui",
      is_read: false,
      created_at: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
    });
  }

  // Insert notifications
  for (const notification of notifications) {
    await prisma.notification.create({ data: notification });
  }

  console.log(`✅ Created ${notifications.length} test notifications`);
  console.log(`   - Unread: ${notifications.filter((n) => !n.is_read).length}`);
  console.log(`   - Read: ${notifications.filter((n) => n.is_read).length}`);

  console.log(
    "\n🎉 Seed complete! Refresh /student/notifications to see the data."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
