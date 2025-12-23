import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import {
  PrismaClient,
  AnnouncementScope,
  NotificationType,
} from "../src/generated/prisma/index.js";

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding notifications for existing announcements...");

  // 1. Fetch all Extracurricular Announcements
  const announcements = await prisma.announcement.findMany({
    where: {
      scope: AnnouncementScope.EXTRACURRICULAR,
      extracurricular_id: { not: null },
    },
    include: {
      extracurricular: true,
    },
  });

  console.log(`Found ${announcements.length} extracurricular announcements.`);

  let createdCount = 0;
  let skippedCount = 0;

  for (const announcement of announcements) {
    if (!announcement.extracurricular_id) continue;

    const extraName = announcement.extracurricular?.name || "Ekstrakurikuler";

    // 2. Find ACTIVE enrollments for this extracurricular
    const enrollments = await prisma.enrollment.findMany({
      where: {
        extracurricular_id: announcement.extracurricular_id,
        status: "ACTIVE",
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    for (const enrollment of enrollments) {
      const userId = enrollment.student.user.id;

      // 3. Check if notification already exists
      const existingNotification = await prisma.notification.findFirst({
        where: {
          user_id: userId,
          enrollment_id: enrollment.id,
          type: NotificationType.ANNOUNCEMENT,
          message: announcement.title,
        },
      });

      if (existingNotification) {
        skippedCount++;
        continue;
      }

      // 4. Create Notification
      await prisma.notification.create({
        data: {
          user_id: userId,
          enrollment_id: enrollment.id,
          type: NotificationType.ANNOUNCEMENT,
          title: `Pengumuman Baru — ${extraName}`,
          message: announcement.title,
          created_at: announcement.created_at,
        },
      });
      createdCount++;
    }
  }

  // 5. Test Case: Robotik & student_siti
  const studentSiti = await prisma.user.findUnique({
    where: { username: "student_siti" },
    include: { studentProfile: true },
  });

  if (studentSiti && studentSiti.studentProfile) {
    const robotik = await prisma.extracurricular.findFirst({
      where: { name: "Robotik" },
    });

    if (robotik) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          student_id_extracurricular_id: {
            student_id: studentSiti.studentProfile.id,
            extracurricular_id: robotik.id,
          },
        },
      });

      if (enrollment && enrollment.status === "ACTIVE") {
        const testTitle = "Latihan Robotik Minggu Ini";
        const existingAnnouncement = await prisma.announcement.findFirst({
          where: {
            extracurricular_id: robotik.id,
            title: testTitle,
          },
        });

        if (!existingAnnouncement) {
          console.log("Creating test announcement for Robotik...");
          const admin = await prisma.user.findFirst({
            where: { role: "ADMIN" },
          });
          if (admin) {
            await prisma.announcement.create({
              data: {
                extracurricular_id: robotik.id,
                scope: AnnouncementScope.EXTRACURRICULAR,
                title: testTitle,
                content:
                  "Harap membawa komponen sensor ultrasonic dan kabel jumper. Kita akan merakit obstacle avoiding robot.",
                author_id: admin.id,
              },
            });
            await prisma.notification.create({
              data: {
                user_id: studentSiti.id,
                enrollment_id: enrollment.id,
                type: NotificationType.ANNOUNCEMENT,
                title: `Pengumuman Baru — Robotik`,
                message: testTitle,
              },
            });
            createdCount++;
          }
        }
      }
    }
  }

  // 6. Ensure at least one SYSTEM announcement exists
  const sysAnnouncement = await prisma.announcement.findFirst({
    where: { scope: AnnouncementScope.SYSTEM },
  });

  if (!sysAnnouncement) {
    console.log("Creating test SYSTEM announcement...");
    const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (admin) {
      await prisma.announcement.create({
        data: {
          scope: AnnouncementScope.SYSTEM,
          title: "Pengumuman Sistem: Libur Semester",
          content:
            "Diberitahukan kepada seluruh siswa bahwa libur semester akan dimulai tanggal 25 Desember hingga 5 Januari.",
          author_id: admin.id,
        },
      });
      console.log("✅ Created test SYSTEM announcement.");
    } else {
      console.warn("⚠️ No ADMIN user found to create system announcement.");
    }
  }

  console.log(
    `✅ Seeding complete. Created ${createdCount} notifications. Skipped ${skippedCount} existing.`
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
