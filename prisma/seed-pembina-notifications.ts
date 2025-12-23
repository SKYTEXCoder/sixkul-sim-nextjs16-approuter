import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import {
  PrismaClient,
  AnnouncementScope,
  NotificationType,
  EnrollmentStatus,
} from "../src/generated/prisma/index.js";

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding notifications for PEMBINA users...");

  // 1. Find Pembina Budi
  const pembinaBudi = await prisma.user.findUnique({
    where: { username: "pembina_budi" },
    include: { pembinaProfile: true },
  });

  if (!pembinaBudi || !pembinaBudi.pembinaProfile) {
    console.error("❌ Pembina Budi not found!");
    return;
  }

  const pembinaId = pembinaBudi.id;
  const pembinaProfileId = pembinaBudi.pembinaProfile.id;

  console.log(`Found Pembina Budi (User ID: ${pembinaId})`);

  // 2. Find Managed Extracurriculars
  const managedExtras = await prisma.extracurricular.findMany({
    where: { pembina_id: pembinaProfileId },
  });

  console.log(
    `Pembina manages ${managedExtras.length} extracurriculars: ${managedExtras
      .map((e) => e.name)
      .join(", ")}`
  );

  let createdCount = 0;

  // 3. Create Notifications for PENDING Enrollments (Simulation)
  for (const extra of managedExtras) {
    const pendingEnrollments = await prisma.enrollment.findMany({
      where: {
        extracurricular_id: extra.id,
        status: EnrollmentStatus.PENDING,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log(
      `Found ${pendingEnrollments.length} pending enrollments for ${extra.name}`
    );

    for (const enrollment of pendingEnrollments) {
      // Check if notification exists
      const existing = await prisma.notification.findFirst({
        where: {
          user_id: pembinaId,
          enrollment_id: enrollment.id,
          type: NotificationType.ENROLLMENT,
        },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            user_id: pembinaId,
            enrollment_id: enrollment.id,
            type: NotificationType.ENROLLMENT,
            title: `Pendaftaran Baru — ${extra.name}`,
            message: `Siswa ${enrollment.student.user.full_name} ingin bergabung dengan ${extra.name}.`,
            created_at: enrollment.joined_at, // Backdate to usage time
          },
        });
        createdCount++;
      }
    }
  }

  // 4. Create Notifications for SYSTEM Announcements
  const systemAnnouncements = await prisma.announcement.findMany({
    where: { scope: AnnouncementScope.SYSTEM },
  });

  console.log(`Found ${systemAnnouncements.length} system announcements.`);

  for (const announcement of systemAnnouncements) {
    const existing = await prisma.notification.findFirst({
      where: {
        user_id: pembinaId,
        type: NotificationType.ANNOUNCEMENT,
        message: announcement.title,
      },
    });

    if (!existing) {
      await prisma.notification.create({
        data: {
          user_id: pembinaId,
          enrollment_id: null, // No specific enrollment for system announcement
          type: NotificationType.ANNOUNCEMENT,
          title: "Pengumuman Sistem",
          message: announcement.title,
          created_at: announcement.created_at,
        },
      });
      createdCount++;
    }
  }

  // 5. Create a fake "Upcoming Session" notification for testing if none exists
  if (managedExtras.length > 0) {
    const extra = managedExtras[0];
    const today = new Date();

    // Check for existing schedule notification
    const existingScheduleNotif = await prisma.notification.findFirst({
      where: {
        user_id: pembinaId,
        type: NotificationType.SCHEDULE,
        title: { contains: extra.name },
      },
    });

    if (!existingScheduleNotif) {
      await prisma.notification.create({
        data: {
          user_id: pembinaId,
          enrollment_id: null,
          type: NotificationType.SCHEDULE,
          title: `Jadwal Mendatang — ${extra.name}`,
          message: `Jangan lupa sesi latihan ${extra.name} besok pukul 15:00.`,
          created_at: today,
        },
      });
      createdCount++;
    }
  }

  console.log(
    `✅ Seeding complete. Created ${createdCount} notifications for Pembina Budi.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
