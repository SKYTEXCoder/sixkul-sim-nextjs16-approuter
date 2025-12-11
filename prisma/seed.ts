import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

/**
 * SIXKUL Database Seed Script
 * 
 * Creates placeholder users linked to Clerk authentication.
 * NOTE: Actual Clerk users must be created in Clerk Dashboard with matching clerk_id.
 * 
 * After creating users in Clerk Dashboard, update the clerk_id values below to match.
 */

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data (optional - remove if you want to keep existing data)
  console.log('🧹 Cleaning existing data...');
  await prisma.announcement.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.extracurricular.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.pembinaProfile.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  // ============================================
  // 1. Create Admin User (linked to Clerk)
  // ============================================
  console.log('👤 Creating Admin user...');
  const admin = await prisma.user.create({
    data: {
      clerk_id: 'clerk_admin_placeholder', // Replace with actual Clerk user ID
      username: 'admin',
      email: 'admin@sixkul.sch.id',
      full_name: 'Administrator SIXKUL',
      role: 'ADMIN',
      avatar_url: null,
    },
  });
  console.log(`✅ Admin created: ${admin.username}`);

  // ============================================
  // 2. Create Pembina User with Profile
  // ============================================
  console.log('👤 Creating Pembina user...');
  const pembina = await prisma.user.create({
    data: {
      clerk_id: 'clerk_pembina_placeholder', // Replace with actual Clerk user ID
      username: 'pembina',
      email: 'pembina@sixkul.sch.id',
      full_name: 'Budi Santoso, S.Pd',
      role: 'PEMBINA',
      avatar_url: null,
      pembinaProfile: {
        create: {
          nip: '197801152006041001',
          expertise: 'Teknologi Informasi & Olahraga',
          phone_number: '+62812345678901',
        },
      },
    },
    include: {
      pembinaProfile: true,
    },
  });
  console.log(`✅ Pembina created: ${pembina.username}`);

  // ============================================
  // 3. Create Student User with Profile
  // ============================================
  console.log('👤 Creating Student user...');
  const student = await prisma.user.create({
    data: {
      clerk_id: 'clerk_student_placeholder', // Replace with actual Clerk user ID
      username: 'student',
      email: 'student@sixkul.sch.id',
      full_name: 'Siti Nurhaliza',
      role: 'SISWA',
      avatar_url: null,
      studentProfile: {
        create: {
          nis: '2024001',
          class_name: 'XII IPA 1',
          major: 'IPA',
          phone_number: '+62812345678902',
        },
      },
    },
    include: {
      studentProfile: true,
    },
  });
  console.log(`✅ Student created: ${student.username}`);

  // ============================================
  // 4. Create 5 Extracurriculars
  // ============================================
  console.log('🎯 Creating Extracurriculars...');

  const extracurriculars = await Promise.all([
    // 1. Olahraga Bola Basket (managed by Pembina)
    prisma.extracurricular.create({
      data: {
        name: 'Olahraga Bola Basket',
        category: 'Olahraga',
        description:
          'Kegiatan ekstrakurikuler basket untuk mengembangkan kemampuan olahraga dan kerja sama tim.',
        logo_url: '/images/ekstrakurikuler/basket.png',
        status: 'ACTIVE',
        pembina_id: pembina.pembinaProfile!.id,
      },
    }),

    // 2. Robotik (managed by Pembina)
    prisma.extracurricular.create({
      data: {
        name: 'Robotik',
        category: 'Teknologi',
        description:
          'Mempelajari dan mengembangkan robot sederhana untuk kompetisi tingkat nasional.',
        logo_url: '/images/ekstrakurikuler/robotik.png',
        status: 'ACTIVE',
        pembina_id: pembina.pembinaProfile!.id,
      },
    }),

    // 3. Pemrograman dan Pengembangan Video Game (managed by Pembina)
    prisma.extracurricular.create({
      data: {
        name: 'Pemrograman dan Pengembangan Video Game',
        category: 'Teknologi',
        description:
          'Belajar membuat game menggunakan Unity, Unreal Engine, dan Godot. Cocok untuk yang suka coding dan desain game.',
        logo_url: '/images/ekstrakurikuler/game-dev.png',
        status: 'ACTIVE',
        pembina_id: pembina.pembinaProfile!.id,
      },
    }),

    // 4. Tenis Meja
    prisma.extracurricular.create({
      data: {
        name: 'Tenis Meja',
        category: 'Olahraga',
        description:
          'Ekstrakurikuler tenis meja untuk meningkatkan refleks dan konsentrasi.',
        logo_url: '/images/ekstrakurikuler/tenis-meja.png',
        status: 'ACTIVE',
        pembina_id: pembina.pembinaProfile!.id,
      },
    }),

    // 5. Drum Band
    prisma.extracurricular.create({
      data: {
        name: 'Drum Band',
        category: 'Seni',
        description:
          'Marching band sekolah yang tampil di berbagai acara dan kompetisi.',
        logo_url: '/images/ekstrakurikuler/drum-band.png',
        status: 'ACTIVE',
        pembina_id: pembina.pembinaProfile!.id,
      },
    }),
  ]);

  extracurriculars.forEach((ekskul) => {
    console.log(`✅ Extracurricular created: ${ekskul.name}`);
  });

  // ============================================
  // 5. Create Sample Schedules
  // ============================================
  console.log('📅 Creating sample schedules...');

  await prisma.schedule.create({
    data: {
      extracurricular_id: extracurriculars[0].id, // Basket
      day_of_week: 'SENIN',
      start_time: '15:00',
      end_time: '17:00',
      location: 'Lapangan Basket Sekolah',
    },
  });

  await prisma.schedule.create({
    data: {
      extracurricular_id: extracurriculars[1].id, // Robotik
      day_of_week: 'RABU',
      start_time: '14:00',
      end_time: '16:00',
      location: 'Lab Komputer',
    },
  });

  await prisma.schedule.create({
    data: {
      extracurricular_id: extracurriculars[2].id, // Game Dev
      day_of_week: 'KAMIS',
      start_time: '15:00',
      end_time: '17:30',
      location: 'Lab Multimedia',
    },
  });

  console.log('✅ Schedules created');

  // ============================================
  // 6. Create Sample Enrollment
  // ============================================
  console.log('📝 Creating sample enrollment...');

  const enrollment = await prisma.enrollment.create({
    data: {
      student_id: student.studentProfile!.id,
      extracurricular_id: extracurriculars[2].id, // Game Dev
      status: 'ACTIVE',
      academic_year: '2024/2025',
    },
  });

  console.log('✅ Sample enrollment created');

  // ============================================
  // 7. Create Sample Announcement
  // ============================================
  console.log('📢 Creating sample announcement...');

  await prisma.announcement.create({
    data: {
      extracurricular_id: extracurriculars[2].id, // Game Dev
      author_id: pembina.id,
      title: 'Selamat Datang di Ekstrakurikuler Game Development!',
      content:
        'Halo semua! Selamat bergabung di ekstrakurikuler Game Development. Kita akan belajar membuat game dari nol menggunakan Unity dan Godot. Jangan lupa bawa laptop ya!',
    },
  });

  console.log('✅ Sample announcement created');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   👥 Users: 3 (1 Admin, 1 Pembina, 1 Student)`);
  console.log(`   🎯 Extracurriculars: ${extracurriculars.length}`);
  console.log(`   📅 Schedules: 3`);
  console.log(`   📝 Enrollments: 1`);
  console.log(`   📢 Announcements: 1`);
  console.log('\n🔑 Clerk Authentication:');
  console.log(`   Users must be created in Clerk Dashboard with matching clerk_id values.`);
  console.log(`   Set publicMetadata.role = "ADMIN" | "PEMBINA" | "SISWA" for each user.`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
