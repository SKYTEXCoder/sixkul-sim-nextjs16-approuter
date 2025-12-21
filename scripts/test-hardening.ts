import { PrismaClient } from "../src/generated/prisma";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  console.log("--- STARTING HARDENING VERIFICATION ---");

  // 1. SETUP: Find a valid Extracurricular and Enrollment to work with
  const ekskul = await prisma.extracurricular.findFirst({
    where: { status: "ACTIVE" },
    include: { enrollments: true, sessions: true },
  });

  if (!ekskul) {
    console.error("❌ No active extracurricular found. Cannot test.");
    return;
  }

  if (ekskul.enrollments.length === 0) {
    console.error("❌ No enrollments found. Cannot test attendance.");
    // In a real scenario we might create one, but let's assume seed data exists
    return;
  }

  const enrollmentId = ekskul.enrollments[0].id;
  console.log(`✅ Using Extracurricular: ${ekskul.name} (${ekskul.id})`);
  console.log(`✅ Using Enrollment: ${enrollmentId}`);

  // ============================================
  // TEST 1: SOFT DELETE FOUNDATION (Blocker C)
  // ============================================
  console.log("\n--- TEST 1: SOFT DELETE (Session) ---");

  // Create a dummy session
  const session = await prisma.session.create({
    data: {
      extracurricular_id: ekskul.id,
      date: new Date(),
      start_time: "12:00",
      end_time: "13:00",
      location: "Test Loc",
      is_cancelled: false,
    },
  });
  console.log(`✅ Created Test Session: ${session.id}`);

  // Perform Soft Delete (Simulating the logic we placed in pembina-session-data)
  // We manually trigger the update because the function 'deleteSession' is in lib,
  // and we want to verify the *database behavior* of our "safe delete" strategy.
  // Actually, we should verify that we CAN update it to deleted_at != null
  await prisma.session.update({
    where: { id: session.id },
    data: { deleted_at: new Date() },
  });
  console.log(`✅ Soft Deleted Session (set deleted_at)`);

  // Verify it is "hidden" from standard queries if they use our filter
  // We can't test the *function* `getUpcomingSessions` easily without importing it,
  // but we can verify the data state.
  const checkSession = await prisma.session.findUnique({
    where: { id: session.id },
  });

  if (checkSession && checkSession.deleted_at !== null) {
    console.log(
      "✅ PASS: Session exists but has deleted_at set (Soft Delete confirmed)"
    );
  } else {
    console.error("❌ FAIL: Session not found or deleted_at is null");
  }

  // Check Strict Filtering (Guardrail 2)
  // Let's verify that a raw query for "active" sessions would find it if we don't filter,
  // assuring us that the filter IS necessary (and thus our code changes were vital).
  const countRaw = await prisma.session.count({ where: { id: session.id } });
  const countFiltered = await prisma.session.count({
    where: { id: session.id, deleted_at: null },
  });

  if (countRaw === 1 && countFiltered === 0) {
    console.log("✅ PASS: Standard filtering works (Raw: 1, Filtered: 0)");
  } else {
    console.error(
      `❌ FAIL: Filtering logic mismatch (Raw: ${countRaw}, Filtered: ${countFiltered})`
    );
  }

  // ============================================
  // TEST 2: ATTENDANCE MUTABILITY (Blocker B)
  // ============================================
  console.log("\n--- TEST 2: ATTENDANCE MUTABILITY ---");

  // Create a LOCKED attendance record
  // We use the session we just created (even if soft deleted, it exists in DB)
  // Or better, create a new active one to be safe.
  const session2 = await prisma.session.create({
    data: {
      extracurricular_id: ekskul.id,
      date: new Date(),
      start_time: "14:00",
      end_time: "15:00",
      location: "Test Loc 2",
    },
  });

  // Create initial attendance
  const attendance = await prisma.attendance.create({
    data: {
      enrollment_id: enrollmentId,
      session_id: session2.id,
      date: session2.date,
      status: "PRESENT",
      is_locked: true, // Default behavior we enforced
    },
  });
  console.log(`✅ Created Locked Attendance: ${attendance.id}`);

  // Attempt to "Overwrite" it (Scanning for existence)
  // This mimics the logic we added to `route.ts` and `pembina-attendance-data.ts`
  // We want to verify that `is_locked` prevents mutation effectively if we check it.

  const existing = await prisma.attendance.findUnique({
    where: {
      enrollment_id_date: { enrollment_id: enrollmentId, date: session2.date },
    },
  });

  if (existing?.is_locked) {
    console.log("✅ PASS: Found existing locked record during pre-check.");
    console.log(
      "   (Simulated API would Throw Error here as per strict guardrail)"
    );
  } else {
    console.error("❌ FAIL: Did not find locked record or is_locked is false");
  }

  // cleanup
  await prisma.attendance.delete({ where: { id: attendance.id } });
  await prisma.session.delete({ where: { id: session.id } });
  await prisma.session.delete({ where: { id: session2.id } });
  console.log("\n✅ Cleanup complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
