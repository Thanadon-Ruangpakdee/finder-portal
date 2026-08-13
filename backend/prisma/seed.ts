import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Seeding databases with mock ABAC campus records...');

  // 1. Seed Mock Users
  const student = await prisma.user.upsert({
    where: { id: 'student_6610308' },
    update: {},
    create: {
      id: 'student_6610308',
      email: 'student.thanadon@au.edu',
      name: 'Thanadon Ruangpakdee',
      role: 'STUDENT',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=student_6610308'
    }
  });

  const staff = await prisma.user.upsert({
    where: { id: 'staff_6610387' },
    update: {},
    create: {
      id: 'staff_6610387',
      email: 'staff.somchai@au.edu',
      name: 'Somchai',
      role: 'TEACHER',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=staff_6610387'
    }
  });

  const admin = await prisma.user.upsert({
    where: { id: 'admin_6610936' },
    update: {},
    create: {
      id: 'admin_6610936',
      email: 'admin.system@au.edu',
      name: 'Admin Kitirat',
      role: 'ADMIN',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin_6610936'
    }
  });

  console.log(`[Seed] Seeded 3 users: ${student.name}, ${staff.name}, ${admin.name}`);

  // 2. Clear old items/claims to prevent key conflicts on clean seed
  await prisma.match.deleteMany({});
  await prisma.claim.deleteMany({});
  await prisma.item.deleteMany({});

  // 3. Seed Items
  const item1 = await prisma.item.create({
    data: {
      title: 'Apple MacBook Pro 16" (Space Gray)',
      description: 'Found a space gray MacBook Pro left on a desk in Room 402. It has a custom sticker on the back of a small white cat. Screen was locked.',
      category: 'Electronics',
      type: 'FOUND',
      status: 'OPEN',
      location: 'Room 402 (Engineering Building)',
      imagePreset: 'MacBook',
      aiTags: 'laptop,macbook,apple,computer,cat',
      reporterId: staff.id
    }
  });

  const item2 = await prisma.item.create({
    data: {
      title: 'Sony WH-1000XM4 Noise Canceling Headphones',
      description: 'Found black Sony over-ear headphones sitting on a charging cord near the music practice labs on 3rd floor library.',
      category: 'Electronics',
      type: 'FOUND',
      status: 'OPEN',
      location: 'Central Library (3rd Floor)',
      imagePreset: 'Headphones',
      aiTags: 'headphones,audio,sony,black,music',
      reporterId: staff.id
    }
  });

  const item3 = await prisma.item.create({
    data: {
      title: 'Brown Leather Bifold Wallet with Student ID',
      description: 'Lost my brown bifold leather wallet containing my AU Student ID Card (6610308) and driver license. Likely dropped it near MSME building hall.',
      category: 'Wallets & Bags',
      type: 'LOST',
      status: 'MATCHED',
      location: 'Martin de Tours Hall (MSME)',
      imagePreset: 'Leather Wallet',
      aiTags: 'wallet,leather,brown,id,card',
      reporterId: student.id
    }
  });

  const item4 = await prisma.item.create({
    data: {
      title: 'Hydro Flask Water Bottle',
      description: 'Yellow Hydro Flask bottle left at the AU Mall cafeteria table after lunch. Has some minor scratches at the bottom.',
      category: 'Bottles & Tumblers',
      type: 'FOUND',
      status: 'CLAIMED',
      location: 'Campus Cafeteria (AU Mall)',
      imagePreset: 'Water Bottle',
      aiTags: 'bottle,yellow,hydroflask,water',
      reporterId: staff.id
    }
  });

  const item5 = await prisma.item.create({
    data: {
      title: 'Car Keys with Toyota Keychain',
      description: 'Lost my car key fob with a black leather Toyota brand keychain. Probably slipped out of my pocket while exercising at the sports center.',
      category: 'Keys',
      type: 'LOST',
      status: 'OPEN',
      location: 'John Paul II Sports Center',
      imagePreset: 'Keys Set',
      aiTags: 'keys,toyota,car,keychain',
      reporterId: student.id
    }
  });

  console.log(`[Seed] Seeded 5 items.`);

  // 4. Seed Claims
  await prisma.claim.create({
    data: {
      itemId: item4.id,
      claimantId: student.id,
      proofText: 'The yellow Hydro Flask has a scratch in the shape of a star on the bottom and has a green sticker on the cap.',
      status: 'APPROVED',
      reviewerId: staff.id
    }
  });

  await prisma.claim.create({
    data: {
      itemId: item1.id,
      claimantId: student.id,
      proofText: 'The MacBook sticker is a white cat drinking bubble tea. The keyboard layout is US English and has 16GB of RAM.',
      status: 'PENDING'
    }
  });

  console.log(`[Seed] Seeded 2 claims.`);

  // 5. Seed Matches
  await prisma.match.create({
    data: {
      lostItemId: item3.id,
      foundItemId: item3.id, // self-reference simulated match for display
      similarityScore: 85,
      status: 'SUGGESTED'
    }
  });

  console.log('[Seed] Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('[Seed Error] Failed to seed database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
