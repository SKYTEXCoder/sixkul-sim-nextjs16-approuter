import { PrismaClient } from '../src/generated/prisma';
import { createClerkClient } from '@clerk/backend';

const prisma = new PrismaClient();

/**
 * SIXKUL Database Seed Script with Clerk Integration
 * 
 * This script:
 * 1. Creates users in Clerk via Backend API
 * 2. Gets the clerk_id from Clerk
 * 3. Creates corresponding records in Prisma database
 * 4. Creates extracurriculars, schedules, enrollments, etc.
 * 
 * Prerequisites:
 * - CLERK_SECRET_KEY must be set in .env
 */

// Initialize Clerk Backend Client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// ============================================
// Seed Data Configuration
// ============================================

interface SeedUser {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'PEMBINA' | 'SISWA';
  profileData?: {
    // StudentProfile fields
    nis?: string;
    class_name?: string;
    major?: string;
    phone_number?: string;
    // PembinaProfile fields
    nip?: string;
    expertise?: string;
  };
}

const seedUsers: SeedUser[] = [
  // ============================================
  // ADMIN ACCOUNTS (3 total)
  // ============================================
  {
    email: 'admin@sixkul.sch.id',
    password: 'rtx5070ti16gb',
    username: 'admin_sixkul',
    firstName: 'Administrator',
    lastName: 'SIXKUL',
    role: 'ADMIN',
  },
  {
    email: 'admin2@sixkul.sch.id',
    password: 'rtx5070ti16gb',
    username: 'admin_kepala',
    firstName: 'Kepala',
    lastName: 'Sekolah',
    role: 'ADMIN',
  },
  {
    email: 'admin3@sixkul.sch.id',
    password: 'rtx5070ti16gb',
    username: 'admin_wakasek',
    firstName: 'Wakil Kepala',
    lastName: 'Kesiswaan',
    role: 'ADMIN',
  },

  // ============================================
  // PEMBINA ACCOUNTS (5 total)
  // ============================================
  {
    email: 'pembina@sixkul.sch.id',
    password: 'rtx5070ti16gb',
    username: 'pembina_budi',
    firstName: 'Budi',
    lastName: 'Santoso',
    role: 'PEMBINA',
    profileData: {
      nip: '197801152006041001',
      expertise: 'Teknologi Informasi & Olahraga',
      phone_number: '+62812345678901',
    },
  },
  {
    email: 'pembina2@sixkul.sch.id',
    password: 'rtx5070ti16gb',
    username: 'pembina_dewi',
    firstName: 'Dewi',
    lastName: 'Lestari',
    role: 'PEMBINA',
    profileData: {
      nip: '198503212008042002',
      expertise: 'Seni & Musik',
      phone_number: '+62812345678902',
    },
  },
  {
    email: 'pembina3@sixkul.sch.id',
    password: 'rtx5070ti16gb',
    username: 'pembina_agus',
    firstName: 'Agus',
    lastName: 'Prasetyo',
    role: 'PEMBINA',
    profileData: {
      nip: '198007102009031003',
      expertise: 'Olahraga & Bela Diri',
      phone_number: '+62812345678903',
    },
  },
  {
    email: 'pembina4@sixkul.sch.id',
    password: 'rtx5070ti16gb',
    username: 'pembina_rina',
    firstName: 'Rina',
    lastName: 'Wijaya',
    role: 'PEMBINA',
    profileData: {
      nip: '199001302012042004',
      expertise: 'Bahasa & Jurnalistik',
      phone_number: '+62812345678904',
    },
  },
  {
    email: 'pembina5@sixkul.sch.id',
    password: 'rtx5070ti16gb',
    username: 'pembina_hendra',
    firstName: 'Hendra',
    lastName: 'Kusuma',
    role: 'PEMBINA',
    profileData: {
      nip: '198805152015031005',
      expertise: 'Sains & Robotik',
      phone_number: '+62812345678905',
    },
  },

  // ============================================
  // STUDENT ACCOUNTS (5 total)
  // ============================================
  {
    email: 'student@sixkul.sch.id',
    password: 'rtx5070ti16gb',
    username: 'student_siti',
    firstName: 'Siti',
    lastName: 'Nurhaliza',
    role: 'SISWA',
    profileData: {
      nis: '2024001',
      class_name: 'XII IPA 1',
      major: 'IPA',
      phone_number: '+62812345679001',
    },
  },
  {
    email: 'student2@sixkul.sch.id',
    password: 'rtx5070ti16gb',
    username: 'student_andi',
    firstName: 'Andi',
    lastName: 'Firmansyah',
    role: 'SISWA',
    profileData: {
      nis: '2024002',
      class_name: 'XII IPA 2',
      major: 'IPA',
      phone_number: '+62812345679002',
    },
  },
  {
    email: 'student3@sixkul.sch.id',
    password: 'rtx5070ti16gb',
    username: 'student_maya',
    firstName: 'Maya',
    lastName: 'Sari',
    role: 'SISWA',
    profileData: {
      nis: '2024003',
      class_name: 'XI IPS 1',
      major: 'IPS',
      phone_number: '+62812345679003',
    },
  },
  {
    email: 'student4@sixkul.sch.id',
    password: 'rtx5070ti16gb',
    username: 'student_rizki',
    firstName: 'Rizki',
    lastName: 'Ramadhan',
    role: 'SISWA',
    profileData: {
      nis: '2024004',
      class_name: 'XI IPA 1',
      major: 'IPA',
      phone_number: '+62812345679004',
    },
  },
  {
    email: 'student5@sixkul.sch.id',
    password: 'rtx5070ti16gb',
    username: 'student_putri',
    firstName: 'Putri',
    lastName: 'Ayu',
    role: 'SISWA',
    profileData: {
      nis: '2024005',
      class_name: 'X IPA 1',
      major: 'IPA',
      phone_number: '+62812345679005',
    },
  },
];

// ============================================
// Helper Functions
// ============================================

/**
 * Create a user in Clerk and return the clerk_id
 */
async function createClerkUser(userData: SeedUser): Promise<string> {
  try {
    // Check if user already exists in Clerk (by email)
    const existingUsers = await clerkClient.users.getUserList({
      emailAddress: [userData.email],
    });

    if (existingUsers.data.length > 0) {
      const existingUser = existingUsers.data[0];
      console.log(`   ℹ️  User already exists in Clerk: ${userData.email}`);
      
      // Update public metadata with role
      await clerkClient.users.updateUser(existingUser.id, {
        publicMetadata: { role: userData.role },
      });
      
      return existingUser.id;
    }

    // Create new user in Clerk
    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [userData.email],
      password: userData.password,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      publicMetadata: {
        role: userData.role,
      },
    });

    console.log(`   ✅ Created in Clerk: ${userData.email} (${clerkUser.id})`);
    return clerkUser.id;

  } catch (error) {
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('username')) {
        console.log(`   ⚠️  Username conflict, trying with timestamp...`);
        const timestamp = Date.now().toString().slice(-6);
        const newUsername = `${userData.username}_${timestamp}`;
        
        const clerkUser = await clerkClient.users.createUser({
          emailAddress: [userData.email],
          password: userData.password,
          username: newUsername,
          firstName: userData.firstName,
          lastName: userData.lastName,
          publicMetadata: {
            role: userData.role,
          },
        });
        
        console.log(`   ✅ Created in Clerk: ${userData.email} (${clerkUser.id})`);
        return clerkUser.id;
      }
    }
    throw error;
  }
}

/**
 * Delete existing Clerk users by email (for clean re-seeding)
 */
async function cleanupClerkUsers() {
  console.log('🧹 Cleaning up existing Clerk users...');
  
  for (const userData of seedUsers) {
    try {
      const existingUsers = await clerkClient.users.getUserList({
        emailAddress: [userData.email],
      });
      
      for (const user of existingUsers.data) {
        await clerkClient.users.deleteUser(user.id);
        console.log(`   🗑️  Deleted Clerk user: ${userData.email}`);
      }
    } catch (error) {
      // Ignore errors during cleanup
      console.log(`   ⚠️  Could not delete ${userData.email}`);
    }
  }
}

// ============================================
// Main Seed Function
// ============================================

async function main() {
  console.log('🌱 Starting SIXKUL database seeding with Clerk integration...\n');

  // Validate Clerk secret key
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY is not set in environment variables!');
  }

  // ============================================
  // Step 1: Clean existing data
  // ============================================
  console.log('🧹 Cleaning existing database data...');
  await prisma.announcement.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.extracurricular.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.pembinaProfile.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();
  console.log('   ✅ Database cleaned\n');

  // Optional: Clean Clerk users (uncomment if you want fresh Clerk users)
  // await cleanupClerkUsers();
  // console.log('   ✅ Clerk users cleaned\n');

  // ============================================
  // Step 2: Create Users via Clerk API
  // ============================================
  console.log('� Creating users via Clerk API...\n');

  const createdUsers: { [key: string]: { clerkId: string; prismaUser: any } } = {};

  for (const userData of seedUsers) {
    console.log(`📝 Creating ${userData.role}: ${userData.firstName} ${userData.lastName}`);
    
    // Create user in Clerk first
    const clerkId = await createClerkUser(userData);
    
    // Create user in Prisma with the Clerk ID
    let prismaUser;
    
    if (userData.role === 'SISWA' && userData.profileData) {
      prismaUser = await prisma.user.create({
        data: {
          clerk_id: clerkId,
          username: userData.username,
          email: userData.email,
          full_name: `${userData.firstName} ${userData.lastName}`,
          role: userData.role,
          studentProfile: {
            create: {
              nis: userData.profileData.nis!,
              class_name: userData.profileData.class_name!,
              major: userData.profileData.major!,
              phone_number: userData.profileData.phone_number,
            },
          },
        },
        include: { studentProfile: true },
      });
    } else if (userData.role === 'PEMBINA' && userData.profileData) {
      prismaUser = await prisma.user.create({
        data: {
          clerk_id: clerkId,
          username: userData.username,
          email: userData.email,
          full_name: `${userData.firstName} ${userData.lastName}`,
          role: userData.role,
          pembinaProfile: {
            create: {
              nip: userData.profileData.nip!,
              expertise: userData.profileData.expertise,
              phone_number: userData.profileData.phone_number,
            },
          },
        },
        include: { pembinaProfile: true },
      });
    } else {
      prismaUser = await prisma.user.create({
        data: {
          clerk_id: clerkId,
          username: userData.username,
          email: userData.email,
          full_name: `${userData.firstName} ${userData.lastName}`,
          role: userData.role,
        },
      });
    }

    createdUsers[userData.role] = { clerkId, prismaUser };
    console.log(`   ✅ Created in Prisma: ${prismaUser.username} (DB ID: ${prismaUser.id})\n`);
  }

  // ============================================
  // Step 3: Create Extracurriculars
  // ============================================
  console.log('🎯 Creating Extracurriculars...');

  const pembinaProfileId = createdUsers['PEMBINA'].prismaUser.pembinaProfile.id;

  const extracurriculars = await Promise.all([
    prisma.extracurricular.create({
      data: {
        name: 'Olahraga Bola Basket',
        category: 'Olahraga',
        description: 'Kegiatan ekstrakurikuler basket untuk mengembangkan kemampuan olahraga dan kerja sama tim.',
        logo_url: '/images/ekstrakurikuler/basket.png',
        status: 'ACTIVE',
        pembina_id: pembinaProfileId,
      },
    }),
    prisma.extracurricular.create({
      data: {
        name: 'Robotik',
        category: 'Teknologi',
        description: 'Mempelajari dan mengembangkan robot sederhana untuk kompetisi tingkat nasional.',
        logo_url: '/images/ekstrakurikuler/robotik.png',
        status: 'ACTIVE',
        pembina_id: pembinaProfileId,
      },
    }),
    prisma.extracurricular.create({
      data: {
        name: 'Pemrograman dan Pengembangan Video Game',
        category: 'Teknologi',
        description: 'Belajar membuat game menggunakan Unity, Unreal Engine, dan Godot.',
        logo_url: '/images/ekstrakurikuler/game-dev.png',
        status: 'ACTIVE',
        pembina_id: pembinaProfileId,
      },
    }),
    prisma.extracurricular.create({
      data: {
        name: 'Tenis Meja',
        category: 'Olahraga',
        description: 'Ekstrakurikuler tenis meja untuk meningkatkan refleks dan konsentrasi.',
        logo_url: '/images/ekstrakurikuler/tenis-meja.png',
        status: 'ACTIVE',
        pembina_id: pembinaProfileId,
      },
    }),
    prisma.extracurricular.create({
      data: {
        name: 'Drum Band',
        category: 'Seni',
        description: 'Marching band sekolah yang tampil di berbagai acara dan kompetisi.',
        logo_url: '/images/ekstrakurikuler/drum-band.png',
        status: 'ACTIVE',
        pembina_id: pembinaProfileId,
      },
    }),
  ]);

  console.log(`   ✅ Created ${extracurriculars.length} extracurriculars\n`);

  // ============================================
  // Step 4: Create Schedules
  // ============================================
  console.log('📅 Creating schedules...');

  await Promise.all([
    prisma.schedule.create({
      data: {
        extracurricular_id: extracurriculars[0].id,
        day_of_week: 'SENIN',
        start_time: '15:00',
        end_time: '17:00',
        location: 'Lapangan Basket Sekolah',
      },
    }),
    prisma.schedule.create({
      data: {
        extracurricular_id: extracurriculars[1].id,
        day_of_week: 'RABU',
        start_time: '14:00',
        end_time: '16:00',
        location: 'Lab Komputer',
      },
    }),
    prisma.schedule.create({
      data: {
        extracurricular_id: extracurriculars[2].id,
        day_of_week: 'KAMIS',
        start_time: '15:00',
        end_time: '17:30',
        location: 'Lab Multimedia',
      },
    }),
  ]);

  console.log('   ✅ Created 3 schedules\n');

  // ============================================
  // Step 5: Create Multiple Enrollments for First Student
  // ============================================
  console.log('📝 Creating enrollments...');

  const studentProfileId = createdUsers['SISWA'].prismaUser.studentProfile.id;

  // Enroll first student in multiple extracurriculars
  const enrollments = await Promise.all([
    prisma.enrollment.create({
      data: {
        student_id: studentProfileId,
        extracurricular_id: extracurriculars[0].id, // Basket
        status: 'ACTIVE',
        academic_year: '2024/2025',
      },
    }),
    prisma.enrollment.create({
      data: {
        student_id: studentProfileId,
        extracurricular_id: extracurriculars[1].id, // Robotik
        status: 'ACTIVE',
        academic_year: '2024/2025',
      },
    }),
    prisma.enrollment.create({
      data: {
        student_id: studentProfileId,
        extracurricular_id: extracurriculars[2].id, // Game Dev
        status: 'ACTIVE',
        academic_year: '2024/2025',
      },
    }),
  ]);

  console.log(`   ✅ Created ${enrollments.length} enrollments\n`);

  // ============================================
  // Step 6: Create Sample Attendance Records
  // ============================================
  console.log('📋 Creating attendance records...');

  // Create attendance records for the past few weeks
  const today = new Date();
  const attendanceData = [];
  
  // For each enrollment, create some attendance records
  for (const enrollment of enrollments) {
    // Create attendance for past 10 sessions
    for (let i = 1; i <= 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - (i * 7)); // Weekly sessions
      
      // Mix of attendance statuses (mostly PRESENT)
      let status: 'PRESENT' | 'SICK' | 'PERMISSION' | 'ALPHA';
      const rand = Math.random();
      if (rand < 0.7) status = 'PRESENT';
      else if (rand < 0.85) status = 'SICK';
      else if (rand < 0.95) status = 'PERMISSION';
      else status = 'ALPHA';

      attendanceData.push({
        enrollment_id: enrollment.id,
        date: date,
        status: status,
        notes: status !== 'PRESENT' ? `Status: ${status}` : null,
      });
    }
  }

  await prisma.attendance.createMany({
    data: attendanceData,
  });

  console.log(`   ✅ Created ${attendanceData.length} attendance records\n`);

  // ============================================
  // Step 7: Create Sample Announcements
  // ============================================
  console.log('📢 Creating announcements...');

  const pembinaUserId = createdUsers['PEMBINA'].prismaUser.id;

  await Promise.all([
    // Recent announcement (today)
    prisma.announcement.create({
      data: {
        extracurricular_id: extracurriculars[0].id, // Basket
        author_id: pembinaUserId,
        title: 'Perubahan Jadwal Latihan Basket',
        content: 'Latihan minggu ini dipindahkan ke hari Kamis karena ada renovasi lapangan.',
        created_at: new Date(),
      },
    }),
    // 2 days ago
    prisma.announcement.create({
      data: {
        extracurricular_id: extracurriculars[1].id, // Robotik
        author_id: pembinaUserId,
        title: 'Latihan Robotik Diliburkan',
        content: 'Latihan robotik diliburkan minggu ini karena pembina berhalangan.',
        created_at: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    // 5 days ago
    prisma.announcement.create({
      data: {
        extracurricular_id: extracurriculars[2].id, // Game Dev
        author_id: pembinaUserId,
        title: 'Selamat Datang di Ekstrakurikuler Game Development!',
        content: 'Halo semua! Selamat bergabung di ekstrakurikuler Game Development. Persiapkan laptop kalian!',
        created_at: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
      },
    }),
    // 1 week ago
    prisma.announcement.create({
      data: {
        extracurricular_id: extracurriculars[0].id, // Basket
        author_id: pembinaUserId,
        title: 'Pengumpulan Seragam Tim',
        content: 'Seragam tim basket sudah tersedia. Harap dikumpulkan ukuran masing-masing.',
        created_at: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log('   ✅ Created 4 announcements\n');

  // ============================================
  // Summary
  // ============================================
  console.log('═'.repeat(50));
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!\n');
  console.log('📊 Summary:');
  console.log('   👥 Users: 13 (3 Admin, 5 Pembina, 5 Students)');
  console.log(`   🎯 Extracurriculars: ${extracurriculars.length}`);
  console.log('   📅 Schedules: 3');
  console.log(`   📝 Enrollments: ${enrollments.length}`);
  console.log(`   📋 Attendance Records: ${attendanceData.length}`);
  console.log('   📢 Announcements: 4');
  console.log('\n🔑 Login Credentials:');
  console.log('═'.repeat(50));
  seedUsers.forEach((user) => {
    console.log(`   ${user.role.padEnd(8)} | ${user.email} | ${user.password}`);
  });
  console.log('═'.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
